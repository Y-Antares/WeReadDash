# scripts/sync_weread.py
import os
import json
import requests

OUTPUT_FILE = os.path.join(os.path.dirname(__file__), "../src/data/weread.json")

def call_agent(api_key, api_name, params=None):
    if params is None:
        params = {}
        
    url = "https://i.weread.qq.com/api/agent/gateway"
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json"
    }
    
    payload = {
        "api_name": api_name,
        "skill_version": "1.0.3"
    }
    payload.update(params)
    
    try:
        res = requests.post(url, headers=headers, json=payload, timeout=15)
        if res.status_code == 200:
            data = res.json()
            if data.get("errcode", 0) == 0:
                return data
            else:
                print(f"WeRead API 业务错误 [{api_name}]: {data.get('errmsg')}")
        else:
            print(f"HTTP 请求失败 [{api_name}]: {res.status_code}")
    except Exception as e:
        print(f"Agent API 请求异常 [{api_name}]: {e}")
        
    return {}

def fetch_weread_agent_data():
    api_key = os.environ.get("WEREAD_KEY", "").strip()
    if not api_key:
        print("缺少 WEREAD_KEY 环境变量，跳过数据同步。")
        return

    print("正在通过 WeRead Agent API 拉取数据...")

    # 1. 获取笔记本数据
    notebooks_data = call_agent(api_key, "/user/notebooks", {"count": 300})
    raw_books = notebooks_data.get("books", [])
    print(f"获取到 {len(raw_books)} 本书的笔记数据。")

    # 2. 获取用户和统计信息
    # 修复 1: 换回 /user/v2/readstat 获取大盘信息
    read_stat = call_agent(api_key, "/user/v2/readstat")
    
    user_info = read_stat.get("user", {})
    if not user_info.get("name"):
        user_info = call_agent(api_key, "/user/info")

    processed_books = []
    for item in raw_books[:6]:
        book = item.get("book", item)
        cover_url = book.get("cover", "").replace("/s_", "/t6_")
        processed_books.append({
            "id": book.get("bookId", ""),
            "title": book.get("title", "未知书籍"),
            "author": book.get("author", "未知作者"),
            "cover": cover_url,
            "progress": book.get("progress", 0),
            "category": book.get("category", "未分类"),
            "noteCount": item.get("noteCount", 0),
            "reviewCount": item.get("reviewCount", 0)
        })

    # 修复 3: 恢复正确的 fallback 取值
    completed_books = [b for b in raw_books if b.get("book", {}).get("progress", 0) >= 100]
    completed_count = len(completed_books) if len(completed_books) > 0 else len(raw_books)

    # 数据组装
    formatted_data = {
        "user": {
            "name": user_info.get("name", "微信读书用户"),
            "avatar": user_info.get("avatar", "https://v1.hitokoto.cn/favicon.ico"),
            "readingDays": read_stat.get("totalReadDay", len(raw_books)),
            # 修复 2: 修正字段名为 totalReadTime
            "totalReadingTimeMinutes": int(read_stat.get("totalReadTime", 0) // 60),
            "completedBooksCount": completed_count,
            "notesCount": sum(item.get("noteCount", 0) for item in raw_books if isinstance(item, dict))
        },
        "weeklyTrend": read_stat.get("recentWeekTrend", []),
        "heatmap": read_stat.get("dailyReadDetail", []),
        "books": processed_books
    }

    os.makedirs(os.path.dirname(OUTPUT_FILE), exist_ok=True)
    with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
        json.dump(formatted_data, f, ensure_ascii=False, indent=2)
    print(f"数据成功保存至: {OUTPUT_FILE}")

if __name__ == "__main__":
    fetch_weread_agent_data()