import os
import json
import requests

OUTPUT_FILE = os.path.join(os.path.dirname(__file__), "../src/data/weread.json")
GATEWAY_URL = "https://i.weread.qq.com/api/agent/gateway"

def call_agent(api_name, params=None, api_key=""):
    """
    完全对齐 obsidian-weread-plugin 的 callAgent 逻辑
    """
    if params is None:
        params = {}
        
    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {api_key}",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
    }

    payload = {
        "api_name": api_name,
        "skill_version": "1.0.3",
        **params
    }

    try:
        res = requests.post(GATEWAY_URL, headers=headers, json=payload, timeout=15)
        if res.status_code == 200:
            data = res.json()
            if data.get("errcode", 0) != 0:
                print(f"❌ Agent API 逻辑错误 [{api_name}]: {data.get('errmsg')}")
                return None
            return data
        else:
            print(f"❌ HTTP 请求失败 [{api_name}]: 状态码 {res.status_code}")
            return None
    except Exception as e:
        print(f"❌ 请求网关异常 [{api_name}]: {e}")
        return None

def fetch_weread_data():
    api_key = os.environ.get("WEREAD_KEY", "").strip()
    if not api_key:
        print("❌ 错误：环境变量 WEREAD_KEY 未配置！")
        return

    print("🚀 开始通过微信读书 Agent Gateway 拉取数据...")

    # 1. 调用 /user/notebooks 获取所有书架/笔记本书籍
    notebooks_data = call_agent("/user/notebooks", {"count": 300}, api_key)
    raw_books = notebooks_data.get("books", []) if notebooks_data else []
    print(f"📚 成功拉取到 {len(raw_books)} 本书籍")

    # 2. 调用 /readdata/detail 获取详细阅读统计 (传入 mode 参数)
    read_stat = call_agent("/readdata/detail", {"mode": "all"}, api_key) or {}

    # 3. 整理近期阅读书籍 (前 6 本)
    processed_books = []
    for item in raw_books[:6]:
        book = item.get("book", item)
        cover_url = book.get("cover", "").replace("/s_", "/t6_")

        processed_books.append({
            "id": str(book.get("bookId", "")),
            "title": book.get("title", "未知书名"),
            "author": book.get("author", "未知作者"),
            "cover": cover_url,
            "progress": book.get("progress", 0),
            "category": book.get("category", "未分类"),
            "noteCount": item.get("noteCount", 0),
            "reviewCount": item.get("reviewCount", 0)
        })

    # 4. 提取用户信息与统计数据
    user_info = read_stat.get("user", {})
    total_minutes = int(read_stat.get("totalReadTime", 0) / 60)

    formatted_data = {
        "user": {
            "name": user_info.get("name", "微信读书用户"),
            "avatar": user_info.get("avatar", "https://v1.hitokoto.cn/favicon.ico"),
            "readingDays": read_stat.get("totalReadDay", len(raw_books)),
            "totalReadingTimeMinutes": total_minutes,
            "completedBooksCount": len([
                b for b in raw_books 
                if (b.get("book", {}).get("progress", 0) >= 100 or b.get("progress", 0) >= 100)
            ]),
            "notesCount": sum(item.get("noteCount", 0) for item in raw_books)
        },
        "weeklyTrend": read_stat.get("recentWeekTrend", []),
        "heatmap": read_stat.get("dailyReadDetail", []),
        "books": processed_books
    }

    # 5. 覆盖保存至静态 JSON
    os.makedirs(os.path.dirname(OUTPUT_FILE), exist_ok=True)
    with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
        json.dump(formatted_data, f, ensure_ascii=False, indent=2)

    print(f"✅ 数据成功保存至: {OUTPUT_FILE}")

if __name__ == "__main__":
    fetch_weread_data()
