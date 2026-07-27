import os
import json
import requests

OUTPUT_FILE = os.path.join(os.path.dirname(__file__), "../src/data/weread.json")

def fetch_weread_agent_data():
    api_key = os.environ.get("WEREAD_KEY", "").strip()
    if not api_key:
        print("❌ 错误：环境变量 WEREAD_KEY 为空！")
        return

    # 微信读书官方 Agent API 鉴权 Header
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0 Safari/537.36",
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json"
    }

    print("🚀 开始请求微信读书 Agent API...")

    # 1. 请求官方 Agent API 的笔记本/书架列表
    # Agent 架构下的 Endpoint 为 /api/v2/notebooks 或插件所调用的网关
    agent_notebooks_url = "https://weread.qq.com/api/v2/notebooks" 
    raw_books = []
    
    try:
        res = requests.get(agent_notebooks_url, headers=headers, timeout=15)
        print(f"📌 [Agent Notebooks] HTTP 状态码: {res.status_code}")
        
        # 如果 v2 路径不对，回退尝试 Agent 备用路径
        if res.status_code == 404:
            agent_notebooks_url = "https://weread.qq.com/api/skills/notebooks"
            res = requests.get(agent_notebooks_url, headers=headers, timeout=15)
            print(f"📌 [Skills Notebooks] HTTP 状态码: {res.status_code}")

        if res.status_code == 200:
            data = res.json()
            raw_books = data.get("books", []) if isinstance(data, dict) else data
            print(f"📚 成功通过 Agent API 拉取到 {len(raw_books)} 本书籍")
        else:
            print(f"🔍 接口返回: {res.text[:300]}")
    except Exception as e:
        print(f"❌ 请求 Agent API 异常: {e}")

    # 2. 清洗数据并写入 json
    processed_books = []
    for item in raw_books[:6]:
        book = item.get("book", item)
        cover_url = book.get("cover", "").replace("/s_", "/t6_")

        processed_books.append({
            "id": book.get("bookId", ""),
            "title": book.get("title", "未知书名"),
            "author": book.get("author", "未知作者"),
            "cover": cover_url,
            "progress": book.get("progress", 0),
            "category": book.get("category", "未分类"),
            "noteCount": item.get("noteCount", 0),
            "reviewCount": item.get("reviewCount", 0)
        })

    formatted_data = {
        "user": {
            "name": "微信读书用户",
            "avatar": "https://v1.hitokoto.cn/favicon.ico",
            "readingDays": len(raw_books),
            "totalReadingTimeMinutes": 0,
            "completedBooksCount": len([b for b in raw_books if b.get("progress", 0) >= 100]),
            "notesCount": sum(item.get("noteCount", 0) for item in raw_books if isinstance(item, dict))
        },
        "weeklyTrend": [],
        "heatmap": [],
        "books": processed_books
    }

    os.makedirs(os.path.dirname(OUTPUT_FILE), exist_ok=True)
    with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
        json.dump(formatted_data, f, ensure_ascii=False, indent=2)

    print(f"✅ 数据处理完成，已写入: {OUTPUT_FILE}")

if __name__ == "__main__":
    fetch_weread_agent_data()
