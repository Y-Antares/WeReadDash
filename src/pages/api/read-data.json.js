// src/pages/api/read-data.json.js

async function callAgent(apiKey, apiName, params = {}) {
  const headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko)',
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${apiKey}`
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

export async function GET({ request }) {
  const url = new URL(request.url);
  const apiKey = url.searchParams.get('apiKey');

  if (!apiKey) {
    return new Response(
      JSON.stringify({ error: "Missing apiKey parameter" }), 
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  try {
    const notebooksData = await callAgent(apiKey, '/user/notebooks', { count: 300 });
    const rawBooks = notebooksData?.books || [];

    const userInfo = await callAgent(apiKey, '/user/info').catch(() => ({}));
    const readStat = await callAgent(apiKey, '/readdata/detail').catch(() => ({}));

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
      weeklyTrend: readStat?.recentWeekTrend || [
        { day: "周一", minutes: 0 }, { day: "周二", minutes: 0 },
        { day: "周三", minutes: 0 }, { day: "周四", minutes: 0 },
        { day: "周五", minutes: 0 }, { day: "周六", minutes: 0 }, { day: "周日", minutes: 0 }
      ],
      heatmap: readStat?.dailyReadDetail || [],
      books: books
    };

    return new Response(JSON.stringify(formattedData), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });

  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }), 
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}