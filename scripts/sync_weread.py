import os
import json
import requests

# 输出的目标路径
OUTPUT_FILE = os.path.join(os.path.dirname(__file__), "../src/data/weread.json")

def get_headers(weread_key):
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Host": "i.weread.qq.com",
        "Accept": "application/json, text/plain, */*",
    }
    
    # 兼容 V2 API Key (wrk- 开头) 或传统 Cookie 格式
    if weread_key.startswith("wrk-") or ";" not in weread_key:
        headers["Authorization"] = f"Bearer {weread_key}"
        headers["accessToken"] = weread_key
    else:
        headers["Cookie"] = weread_key
        
    return headers

def fetch_weread_data():
    weread_key = os.environ.get("WEREAD_KEY")
    if not weread_key:
        print("Error: 环境变量 WEREAD_KEY 未配置！")
        return

    headers = get_headers(weread_key)
    
    print("开始拉取微信读书数据...")
    
    # 1. 拉取笔记本列表 (获取书架信息与笔记数)
    notebooks_url = "https://i.weread.qq.com/user/notebooks"
    try:
        res = requests.get(notebooks_url, headers=headers, timeout=10)
        notebooks_data = res.json() if res.status_code == 200 else {}
    except Exception as e:
        print(f"请求笔记本接口异常: {e}")
        notebooks_data = {}

    raw_books = notebooks_data.get("books", [])

    # 2. 拉取用户阅读统计 (总时长、连续阅读天数、热力图数据等)
    stat_url = "https://i.weread.qq.com/user/v2/readstat"
    try:
        res = requests.get(stat_url, headers=headers, timeout=10)
        read_stat = res.json() if res.status_code == 200 else {}
    except Exception as e:
        print(f"请求阅读统计接口异常: {e}")
        read_stat = {}

    # 3. 提取处理前 6 本近期书籍
    processed_books = []
    for item in raw_books[:6]:
        book = item.get("book", {})
        cover_url = book.get("cover", "")
        if cover_url:
            cover_url = cover_url.replace("/s_", "/t6_") # 替换为高清大图

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

    # 4. 计算指标并构造前端 UI 所需的标准 JSON
    total_minutes = int(read_stat.get("totalReadTime", 0) / 60)
    user_info = read_stat.get("user", {})
    
    formatted_data = {
        "user": {
            "name": user_info.get("name", "微信读书用户"),
            "avatar": user_info.get("avatar", "https://v1.hitokoto.cn/favicon.ico"),
            "readingDays": read_stat.get("totalReadDay", len(raw_books)),
            "totalReadingTimeMinutes": total_minutes,
            "completedBooksCount": len([b for b in raw_books if b.get("book", {}).get("progress", 0) >= 100]),
            "notesCount": sum(item.get("noteCount", 0) for item in raw_books)
        },
        "weeklyTrend": read_stat.get("recentWeekTrend", [
            {"day": "周一", "minutes": 0},
            {"day": "周二", "minutes": 0},
            {"day": "周三", "minutes": 0},
            {"day": "周四", "minutes": 0},
            {"day": "周五", "minutes": 0},
            {"day": "周六", "minutes": 0},
            {"day": "周日", "minutes": 0}
        ]),
        "heatmap": read_stat.get("dailyReadDetail", []),
        "books": processed_books
    }

    # 确保输出目录存在
    os.makedirs(os.path.dirname(OUTPUT_FILE), exist_ok=True)
    
    # 写入 JSON
    with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
        json.dump(formatted_data, f, ensure_ascii=False, indent=2)

    print(f"数据成功写入至: {OUTPUT_FILE}")

if __name__ == "__main__":
    fetch_weread_data()