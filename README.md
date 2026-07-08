# 华为乾崑智驾数据实时监控

一个采用 **GitHub Actions 自动爬取** + **GitHub Pages 静态托管** 的实时数据监控网页应用。每 30 秒自动爬取华为乾崑智驾 API 数据，并以折线图展示三个核心指标的增长趋势。

## 🎯 功能

- **自动爬取**：GitHub Actions 每 30 秒自动爬取一次 API 数据
- **实时展示**：网页每 30 秒自动刷新并展示最新数据
- **历史保存**：所有数据保存在仓库中，最多保留 24 小时
- **三个核心指标**：
  - 累计辅助驾驶里程（青绿色线）
  - 累计行驶总里程（橙色线）
  - 累计主动避险次数（紫红色线）
- **离线可用**：支持本地存储备份，即使网络异常也能显示缓存数据
- **专业仪表板设计**：深蓝色科技感风格，包含实时数值卡片和交互式图表
- **响应式布局**：支持桌面和移动设备

## 🚀 快速开始

### 本地开发

```bash
# 安装依赖
pnpm install

# 启动开发服务器
pnpm dev

# 构建生产版本
pnpm build

# 预览生产版本
pnpm preview
```

### 部署到 GitHub Pages

详见 [DEPLOYMENT.md](./DEPLOYMENT.md)

## 📊 数据来源

API 端点：`https://auto.huawei.com/external/uiapi/ads/v1/query`

爬取频率：**每 30 秒一次**（由 GitHub Actions 自动执行）

数据保留：**最多 24 小时**（2880 条记录）

## 🛠️ 技术栈

- **前端框架**: React 19 + TypeScript
- **图表库**: Recharts
- **样式**: Tailwind CSS 4
- **UI 组件**: shadcn/ui
- **构建工具**: Vite
- **自动化**: GitHub Actions
- **爬取脚本**: Python 3.11
- **托管**: GitHub Pages

## 📁 项目结构

```
huawei-ads-monitor/
├── client/
│   ├── public/
│   │   ├── data/              # 数据文件（由 GitHub Actions 生成）
│   │   │   ├── current.json   # 最新数据
│   │   │   └── history.json   # 历史数据
│   │   └── ...
│   ├── src/
│   │   ├── pages/
│   │   │   └── Home.tsx       # 主页面（读取数据文件）
│   │   ├── components/        # 可复用组件
│   │   ├── contexts/          # React 上下文
│   │   ├── hooks/             # 自定义 Hook
│   │   ├── lib/               # 工具函数
│   │   ├── App.tsx            # 应用入口
│   │   ├── main.tsx           # React 入口
│   │   └── index.css          # 全局样式
│   └── index.html
├── scripts/
│   └── fetch_data.py          # 爬取脚本（由 GitHub Actions 调用）
├── .github/
│   └── workflows/
│       ├── deploy.yml         # 部署工作流
│       └── fetch-data.yml     # 数据爬取工作流
├── DEPLOYMENT.md              # 详细部署指南
├── README.md                  # 本文件
└── package.json
```

## 🔄 工作流程

```
GitHub Actions (每分钟运行一次)
    ↓
执行 fetch_data.py 爬取 API 数据（两次，间隔 30 秒）
    ↓
保存数据到 public/data/current.json 和 public/data/history.json
    ↓
自动提交并推送到仓库
    ↓
GitHub Pages 网页读取数据文件
    ↓
网页每 30 秒刷新一次，显示最新数据
```

## 📝 部署步骤

### 1. 创建 GitHub 仓库

访问 https://github.com/new，创建公开仓库 `huawei-ads-monitor`

### 2. 上传代码

```bash
cd huawei-ads-monitor
git init && git add . && git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/huawei-ads-monitor.git
git push -u origin main
```

### 3. 启用 GitHub Pages

1. 进入仓库 Settings → Pages
2. 选择 main 分支作为源
3. 点击 Save

### 4. 等待部署

- 首次构建约 2-5 分钟
- 爬取工作流在下一个整分钟时开始运行
- 网站上线于 `https://YOUR_USERNAME.github.io/huawei-ads-monitor`

## 🎨 设计特点

- **深蓝色科技感背景**：代表华为的科技形象
- **三色线条**：使用不同颜色区分三个数据指标
- **网格背景**：增强科技感
- **实时更新**：显示最后更新时间和数据来源
- **数据卡片**：展示最新的实时数值

## ⚙️ 自定义配置

### 修改爬取频率

编辑 `.github/workflows/fetch-data.yml`：

```yaml
on:
  schedule:
    - cron: '*/1 * * * *'  # 改为其他 cron 表达式
```

### 修改数据保留时间

编辑 `scripts/fetch_data.py`：

```python
# 只保留最近 2880 条记录（24 小时，每 30 秒一条）
if len(history) > 2880:
    history = history[-2880:]
```

### 修改配色

编辑 `client/src/pages/Home.tsx` 中的线条颜色。

## 📱 浏览器支持

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- 移动浏览器

## 📝 许可证

MIT

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📧 联系方式

如有问题或建议，欢迎联系我们。
