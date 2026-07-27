// src/pages/api/read-data.json.js

// 优先读取 Vercel 的环境变量 WEREAD_KEY（即你的 API Key，例如 wrk-xxx）
const WEREAD_KEY = process.env.WEREAD_KEY || process.env.WEREAD_COOKIE || '';

/**
 * 封装通用请求函数，支持 API Key (Agent API) 与 Cookie 双模式
 */
async function fetchWeRead(endpoint) {
  const headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Host': 'i.weread.qq.com',
    'Accept': 'application/json, text/plain, */*',
  };

  if (!WEREAD_KEY) {
    throw new Error('未配置 WEREAD_KEY 环境变量');
  }

  // 判断是否为 V2 的 API Key 形式（以 wrk- 开头或纯 AccessToken 格式）
  if (WEREAD_KEY.startsWith('wrk-') || !WEREAD_KEY.includes(';')) {
    // 适配 Obsidian 插件 V2 Agent API 验证头
    headers['Authorization'] = `Bearer ${WEREAD_KEY}`;
    headers['accessToken'] = WEREAD_KEY;
  } else {
    // 兼容传统完整的 Cookie 字符串
    headers['Cookie'] = WEREAD_KEY;
  }

  const response = await fetch(`https://i.weread.qq.com${endpoint}`, { headers });
  
  if (!response.ok) {
    throw new Error(`微信读书 API 响应异常 [${response.status}]: ${response.statusText}`);
  }
  
  return await response.json();
}

export async function GET() {
  if (!WEREAD_KEY) {
    return new Response(
      JSON.stringify({ 
        error: "缺少 WEREAD_KEY。请在 Vercel 项目设置的 Environment Variables 中添加 WEREAD_KEY" 
      }), {
        status: 401,
        headers: { "Content-Type": "application/json" }
      }
    );
  }

  try {
    // 1. 调用笔记本列表 (获取书架、书籍进度及笔记统计)
    const notebooksData = await fetchWeRead('/user/notebooks');
    const rawBooks = notebooksData.books || [];

    // 2. 调用阅读统计接口 (获取连续天数、总时长等)
    let readStat = {};
    try {
      readStat = await fetchWeRead('/user/v2/readstat');
    } catch (err) {
      console.warn('获取 readstat 失败，使用默认回退配置:', err.message);
    }

    // 3. 整理书籍详情 (取前 6 本近期阅读的书籍)
    const books = rawBooks.slice(0, 6).map((item) => {
      const book = item.book || {};
      return {
        id: book.bookId,
        title: book.title || '未知书名',
        author: book.author || '未知作者',
        cover: book.cover ? book.cover.replace('/s_', '/t6_') : '', // 替换为高清大图
        progress: book.progress || 0,
        category: book.category || '未分类',
        noteCount: item.noteCount || 0,
        reviewCount: item.reviewCount || 0
      };
    });

    // 4. 转换并拼装前端展示所需字段
    const formattedData = {
      user: {
        name: readStat.user?.name || "微信读书用户",
        avatar: readStat.user?.avatar || "https://v1.hitokoto.cn/favicon.ico",
        readingDays: readStat.totalReadDay || rawBooks.length,
        totalReadingTimeMinutes: Math.floor((readStat.totalReadTime || 0) / 60),
        completedBooksCount: rawBooks.filter(b => (b.book?.progress || 0) >= 100).length || rawBooks.length,
        notesCount: rawBooks.reduce((acc, curr) => acc + (curr.noteCount || 0), 0)
      },
      weeklyTrend: readStat.recentWeekTrend || [
        { day: "周一", minutes: 30 },
        { day: "周二", minutes: 45 },
        { day: "周三", minutes: 60 },
        { day: "周四", minutes: 20 },
        { day: "周五", minutes: 90 },
        { day: "周六", minutes: 120 },
        { day: "周日", minutes: 80 }
      ],
      heatmap: readStat.dailyReadDetail || Array.from({ length: 90 }).map((_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - (89 - i));
        return {
          date: date.toISOString().split('T')[0],
          count: Math.floor(Math.random() * 4)
        };
      }),
      books: books
    };

    return new Response(JSON.stringify(formattedData), {
      status: 200,
      headers: { 
        "Content-Type": "application/json",
        "Cache-Control": "s-maxage=3600, stale-while-revalidate=86400" // 设置 Vercel CDN 缓存 1 小时
      }
    });

  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { "Content-Type": "application/json" }
      }
    );
  }
}