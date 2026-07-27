# WeReadDash
微信读书数据展板

## 项目结构

```python
wereaddash/
├── public/
├── src/
│   ├── components/
│   │   ├── StatCards.jsx         # 顶部核心指标卡片
│   │   ├── ReadingHeatmap.jsx    # 年度阅读热力图
│   │   ├── ReadingTrendChart.jsx # 近期阅读时长趋势图
│   │   └── RecentBooks.jsx       # 在读/已读书籍展板
│   ├── layouts/
│   │   └── Layout.astro          # Astro 页面主框架
│   ├── pages/
│   │   ├── api/
│   │   │   └── read-data.json.js # 数据接口 (可做数据清洗或模拟)
│   │   └── index.astro           # 展板主页
│   └── styles/
│       └── global.css            # 全局样式与 Tailwind
├── astro.config.mjs
├── tailwind.config.mjs
└── package.json
```

