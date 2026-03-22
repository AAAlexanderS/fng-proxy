# fng-proxy

CNN Fear & Greed Index (US Stock Market) Vercel Edge Function proxy.

## 部署

1. Fork 或 push 到你的 GitHub 仓库
2. vercel.com/new → Import → 选择仓库 → Deploy
3. 无需任何环境变量

## 端点

```
GET https://your-project.vercel.app/api/fng
```

## 返回格式

```json
{
  "value": 15,
  "classification": "extreme fear",
  "timestamp": "2026-03-22T12:00:00Z",
  "previous_close": 18,
  "history": [
    { "ts": 1742000000000, "value": 14 }
  ]
}
```
