import os
import json
import requests

OUTPUT_FILE = os.path.join(os.path.dirname(__file__), "../src/data/weread.json")

def get_headers(weread_key):
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Host": "i.weread.qq.com",
        "Accept": "application/json, text/plain, */*",
    }
    
    if weread_key.startswith("wrk-") or ";" not in weread_key:
        headers["Authorization"] = f"Bearer {weread_key}"
        headers["accessToken"] = weread_key
    else:
        headers["Cookie"] = weread_key
        
    return headers

def fetch_weread_data():
    weread_key = os.environ.get("WEREAD_KEY", "").strip()
    if not weread_key:
        print("❌ 错误：环境变量 WEREAD_KEY 为空，请检查 GitHub Secrets 设置。")
        return

    headers = get_headers(weread_key)
    print("🚀 开始访问微信读书 API...")

    # 1. 请求笔记本接口（包含书架与笔记列表）
    notebooks_url = "https://i.weread.qq.com/user/notebooks"
    raw_books = []
    try:
        res = requests.get(notebooks_url, headers=headers, timeout=15)
        print(f"📌 [Notebooks] HTTP 状态码: {res.status_code}")
        print(f"🔍 [Notebooks] 接口原始返回 (前500字符): {res.text[:500]}")
        
        if res.status_code == 200:
            data = res.json()
            raw_books = data.get("books", [])
    except Exception as e:
        print(f"❌ 请求笔记本接口发生异常: {e}")

    # 2. 请求阅读统计接口
    stat_url = "https://i.weread.qq.com/user/v2/readstat"
    read_stat = {}
    try:
        res = requests.get(stat_url, headers=headers, timeout=15)
        print(f"📌 [ReadStat] HTTP 状态码: {res.status_code}")
        print(f"🔍 [ReadStat] 接口原始返回 (前500字符): {res.text[:500]}")
        
        if res.status_code == 200:
            read_stat = res.json()
    except Exception as e:
        print(f"❌ 请求阅读统计接口发生异常: {e}")

    # 3. 提取与清洗书籍列表数据
    processed_books = []
    for item in raw_books[:6]:
        book = item.get("book", {})
        if not book and "bookId" in item:
            book = item  # 兼容平铺格式的数据结构
            
        cover_url = book.get("cover", "")
        if cover_url:
            cover_url = cover_url.replace("/s_", "/t6_") # 替换为高清画质封面图

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

    # 4. 组装最终 JSON 数据
    user_info = read_stat.get("user", {})
    total_minutes = int(read_stat.get("totalReadTime", 0) / 60)

    formatted_data = {
        "user": {
            "name": user_info.get("name", "微信读书用户"),
            "avatar": user_info.get("avatar", "https://v1.hitokoto.cn/favicon.ico"),
            "readingDays": read_stat.get("totalReadDay", len(raw_books)),
            "totalReadingTimeMinutes": total_minutes,
            "completedBooksCount": len([b for b in raw_books if (b.get("book", {}).get("progress", 0) >= 100 or b.get("progress", 0) >= 100)]),
            "notesCount": sum(item.get("noteCount", 0) for item in raw_books)
        },
        "weeklyTrend": read_stat.get("recentWeekTrend", []),
        "heatmap": read_stat.get("dailyReadDetail", []),
        "books": processed_books
    }

    os.makedirs(os.path.dirname(OUTPUT_FILE), exist_ok=True)
    with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
        json.dump(formatted_data, f, ensure_ascii=False, indent=2)

    print(f"✅ 诊断脚本执行完毕，数据已写入至: {OUTPUT_FILE}")

if __name__ == "__main__":
    fetch_weread_data()