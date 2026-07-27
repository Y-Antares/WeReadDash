// src/pages/api/read-data.json.js

const WEREAD_KEY = process.env.WEREAD_KEY || process.env.WEREAD_COOKIE || '';

// 模拟 Obsidian 插件的 ApiV2Manager.callAgent 逻辑
async function callAgent(apiName, params = {}) {
  if (!WEREAD_KEY) {
    throw new Error('未配置 WEREAD_KEY，请检查环境变量。');
  }

  const headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko)',
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${WEREAD_KEY}`
  };

  const response = await fetch('https://i.weread.qq.com/api/agent/gateway', {
    method: 'POST',
    headers,
    body: JSON.stringify({
      api_name: apiName,
      skill_version: '1.0.3',
      ...params
    })
  });

  if (!response.ok) {
    throw new Error(`WeRead API 请求失败 [${response.status}]: ${response.statusText}`);
  }

  const data = await response.json();
  if (data.errcode && data.errcode !== 0) {
    throw new Error(`WeRead API 业务错误: ${data.errmsg}`);
  }
  return data;
}

export async function GET() {
  if (!WEREAD_KEY) {
    return new Response(
      JSON.stringify({ error: "未配置 WEREAD_KEY" }), 
      { status: 401, headers: { "Content-Type": "application/json" } }
    );
  }

  try {
    // 1. 获取笔记本/书架数据 (最多获取 300 本以作展示)
    const notebooksData = await callAgent('/user/notebooks', { count: 300 });
    const rawBooks = notebooksData?.books || [];

    // 2. 获取用户基础信息
    const userInfo = await callAgent('/user/info').catch(() => ({}));

    // 3. 获取阅读统计信息
    const readStat = await callAgent('/readdata/detail').catch(() => ({}));

    // 4. 数据格式化映射 (适配前端 UI 组件)
    const books = rawBooks.slice(0, 6).map((item) => {
      const book = item.book || {};
      return {
        id: book.bookId,
        title: book.title || '未知书籍',
        author: book.author || '未知作者',
        cover: book.cover ? book.cover.replace('/s_', '/t6_') : '', 
        progress: book.progress || 0,
        category: book.category || '未分类',
        noteCount: item.noteCount || 0,
        reviewCount: item.reviewCount || 0
      };
    });

    const formattedData = {
      user: {
        name: userInfo?.name || "微信读书用户",
        avatar: userInfo?.avatar || "https://v1.hitokoto.cn/favicon.ico",
        readingDays: readStat?.totalReadDay || rawBooks.length,
        totalReadingTimeMinutes: Math.floor((readStat?.totalReadingTime || 0) / 60),
        completedBooksCount: rawBooks.filter(b => (b.book?.progress || 0) >= 100).length || 0,
        notesCount: rawBooks.reduce((acc, curr) => acc + (curr.noteCount || 0), 0)
      },
      // 容错处理：如果新 API 不包含以下数据，提供模拟 fallback，或直接使用 readStat 中的等价字段
      weeklyTrend: readStat?.recentWeekTrend || [
        { day: "周一", minutes: 30 }, { day: "周二", minutes: 45 },
        { day: "周三", minutes: 60 }, { day: "周四", minutes: 20 },
        { day: "周五", minutes: 90 }, { day: "周六", minutes: 120 }, { day: "周日", minutes: 80 }
      ],
      heatmap: readStat?.dailyReadDetail || Array.from({ length: 90 }).map((_, i) => {
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
        "Cache-Control": "s-maxage=3600, stale-while-revalidate=86400"
      }
    });

  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }), 
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
