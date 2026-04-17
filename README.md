# 3分钟解压屋

这是一个纯前端的解压小游戏站点。

## 结构

- `index.html`：站点首页 / 入口页
- `play/index.html`：游戏本体
- `play/script.js`：游戏逻辑
- `play/styles.css`：游戏样式

## 本地打开

直接打开 `index.html` 进入站点首页，点击按钮进入游戏。

## GitHub Pages

如果把这个仓库启用 GitHub Pages，站点首页就是仓库根目录的 `index.html`，游戏入口在 `play/index.html`。

## 体验优化

- 支持系统的 `prefers-reduced-motion`，低动效模式会自动减少特效和抖动
- Canvas 做了 DPR 上限和自动 resize，手机上更稳一点
- 移动端和低动效模式会自动降低初始物件密度，减少卡顿
