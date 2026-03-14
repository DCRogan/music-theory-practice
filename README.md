# 乐理练习 (Music Theory Practice)

一个交互式乐理练习应用，支持音程、五度圈、吉他指板等多种练习模式。

## 在线体验

**https://dcrogan.github.io/music-theory-practice/**

## 功能特性

- **音程练习**：10种单项模式 + 4种混合模式，支持上/下行音程
- **五度圈**：调号/关系小调/属调识别，SVG交互式圆环
- **吉他指板**：SVG渲染真实指板，点击发声，记忆音名
- **异名同音**：完整的升/降/重升/重降音名系统（Bb, F#, Fx, Cbb 等）
- **练习统计**：各模式正确率记录，localStorage 持久化

## 本地开发

```bash
npm install
npm run dev
```

## Docker 本地预览

```bash
docker compose up --build
# 访问 http://localhost:8080/music-theory-practice/
```

## 部署

推送到 `main` 分支后，GitHub Actions 自动：
1. 运行测试（140个）
2. 构建生产版本
3. 部署到 GitHub Pages
