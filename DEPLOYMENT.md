# 华为乾崑智驾数据监控 - GitHub Pages 部署指南

## 项目概述

这是一个实时监控华为乾崑智驾数据的网页应用，采用 **GitHub Actions 自动爬取** + **GitHub Pages 静态托管** 的架构。

### 核心特性

- **自动爬取**：GitHub Actions 每 30 秒自动爬取一次 API 数据
- **实时展示**：网页每 30 秒自动刷新并展示最新数据
- **历史保存**：所有数据保存在仓库中，最多保留 24 小时（2880 条记录）
- **离线可用**：网页支持本地存储备份，即使 GitHub 数据加载失败也能显示缓存数据

## 技术架构

```
GitHub Actions (每 30 秒)
    ↓
爬取 API 数据 (fetch_data.py)
    ↓
保存到 public/data/current.json 和 public/data/history.json
    ↓
推送到仓库
    ↓
GitHub Pages 网页读取并展示
```

## 部署步骤

### 1. 创建 GitHub 仓库

在 GitHub 上创建一个新的公开仓库（例如 `huawei-ads-monitor`）。

### 2. 初始化本地项目

```bash
cd /home/ubuntu/huawei-ads-monitor
git init
git add .
git commit -m "Initial commit: Huawei ADS data monitor with GitHub Actions"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/huawei-ads-monitor.git
git push -u origin main
```

### 3. 配置 GitHub Pages

1. 进入仓库的 **Settings**
2. 找到左侧菜单中的 **Pages**
3. 在 **Source** 中选择 **Deploy from a branch**
4. 选择分支为 **main**，文件夹为 **/ (root)**
5. 点击 **Save**

### 4. 启用 GitHub Actions

1. 进入仓库的 **Actions** 标签页
2. 确认 `Build and Deploy to GitHub Pages` 工作流已启用
3. 确认 `Fetch Huawei ADS Data Every 30 Seconds` 工作流已启用

### 5. 等待部署

- 首次推送后，GitHub Actions 会自动构建网站（约 2-5 分钟）
- 爬取工作流会在下一个整分钟时开始运行
- 网站将在 `https://YOUR_USERNAME.github.io/huawei-ads-monitor` 上线

## 工作流说明

### deploy.yml - 部署工作流

在以下情况下触发：
- 推送到 main 分支时
- 手动触发（Actions 页面的 "Run workflow" 按钮）

功能：
- 安装依赖
- 构建 React 应用
- 部署到 GitHub Pages

### fetch-data.yml - 数据爬取工作流

在以下情况下触发：
- **每分钟运行一次**（cron: `*/1 * * * *`）
- 每次运行执行两次爬取，间隔 30 秒

功能：
- 调用 `scripts/fetch_data.py` 爬取 API 数据
- 保存当前数据到 `public/data/current.json`
- 保存历史数据到 `public/data/history.json`
- 自动提交并推送到仓库

## 数据文件说明

### public/data/current.json

存储最新的数据快照：

```json
{
  "timestamp": "2026-07-08T12:50:00.000Z",
  "pilot": 7228242208,
  "mileage": 3907154,
  "avoid": 4883943
}
```

### public/data/history.json

存储历史数据数组（最多 2880 条）：

```json
[
  {
    "timestamp": "2026-07-08T12:50:00.000Z",
    "pilot": 7228242208,
    "mileage": 3907154,
    "avoid": 4883943
  },
  ...
]
```

## 网页功能

### 实时更新

- 网页每 30 秒自动刷新一次数据
- 显示最后更新时间
- 显示数据来源（GitHub Actions 或本地存储）

### 三个核心指标

| 指标 | 说明 | 单位 | 颜色 |
|------|------|------|------|
| pilot | 累计辅助驾驶里程 | 公里 | 青绿色 |
| mileage | 累计行驶总里程 | 公里 | 橙色 |
| avoid | 累计主动避险次数 | 次 | 紫红色 |

### 数据展示

1. **实时数值卡片**：显示最新数据
2. **折线图**：展示 24 小时内的数据趋势
3. **统计信息**：显示数据来源和更新频率

## 自定义配置

### 修改爬取频率

编辑 `.github/workflows/fetch-data.yml`：

```yaml
on:
  schedule:
    - cron: '*/1 * * * *'  # 改为其他 cron 表达式
```

常见的 cron 表达式：
- `*/1 * * * *` - 每分钟（每 30 秒爬取两次）
- `*/5 * * * *` - 每 5 分钟
- `*/30 * * * *` - 每 30 分钟
- `0 * * * *` - 每小时

### 修改数据保留时间

编辑 `scripts/fetch_data.py`：

```python
# 只保留最近 2880 条记录（24 小时，每 30 秒一条）
if len(history) > 2880:
    history = history[-2880:]
```

改为其他值：
- 2880 = 24 小时
- 1440 = 12 小时
- 288 = 2.4 小时

### 修改配色

编辑 `client/src/pages/Home.tsx` 中的线条颜色：

```typescript
<Line dataKey="pilot" stroke="#00D4AA" ... />  // 青绿色
<Line dataKey="mileage" stroke="#FF9500" ... /> // 橙色
<Line dataKey="avoid" stroke="#E91E63" ... />   // 紫红色
```

## 故障排除

### GitHub Actions 工作流不运行

1. 检查 `.github/workflows/` 目录中的 YAML 文件语法
2. 确保工作流文件名以 `.yml` 或 `.yaml` 结尾
3. 在 Actions 页面查看工作流运行历史和错误日志

### 数据文件为空或不更新

1. 检查 `scripts/fetch_data.py` 是否有错误
2. 查看 GitHub Actions 日志中的错误信息
3. 确保 `public/data/` 目录存在
4. 检查 Python 依赖是否正确安装

### 网页显示 "暂无数据"

1. 等待 GitHub Actions 首次运行完成（约 1-2 分钟）
2. 刷新网页并检查浏览器控制台错误
3. 检查 `public/data/current.json` 和 `public/data/history.json` 是否存在
4. 尝试使用本地存储的备份数据

### API 请求失败

1. 检查华为 API 是否可访问
2. 查看 GitHub Actions 日志中的网络错误
3. 检查 Python 脚本中的超时设置

## 浏览器兼容性

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- 移动浏览器（iOS Safari, Chrome Mobile）

## 许可证

MIT

## 支持

如有问题或建议，欢迎提交 Issue 或 Pull Request。
