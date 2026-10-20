# 渲染器

`render.mjs` 把一段自包含的 HTML 场景逐帧截图，再交给 ffmpeg 合成 mp4。没有视频模型，没有 GPU。

## 依赖

- Node.js 18+
- ffmpeg（`brew install ffmpeg` / `apt install ffmpeg`）
- Playwright + Chromium

```bash
npm init -y
npm i playwright
npx playwright install chromium
```

## 用法

```bash
node render.mjs ../output/tanzhe/scene.html ../output/tanzhe/out.mp4 \
  --duration 45 --fps 30
```

带音频：

```bash
node render.mjs ../output/tanzhe/scene.html ../output/tanzhe/out.mp4 \
  --duration 45 --fps 30 --audio ../output/tanzhe/mix.wav
```

参数：

| 参数 | 默认 | 说明 |
|---|---|---|
| `--duration` | 场景里的 `window.__duration` | 秒 |
| `--fps` | 30 | 帧率 |
| `--width` | 1920 | 宽 |
| `--height` | 1080 | 高 |
| `--audio` | 无 | wav/mp3，混入输出 |

## 场景契约

`scene.html` 必须暴露三个东西：

```js
window.__duration = 45;          // 秒
window.__seek = (t) => { ... };  // 纯函数：只依赖 t
window.__ready = true;           // 字体/素材加载完成后
```

规则：

- `__seek(t)` 里不能出现 `Math.random()`、`Date.now()`、网络请求。
- 所有动画由 `t` 计算，同一份代码每次渲染结果一致。
- 1920×1080 舞台；文字离边 ≥5%；最小字号 32px。
- 字体建议用 `@font-face` 嵌入，或使用系统自带字体并准备兜底。
- DOM 节点 <500；少用大面积 `filter: blur()`，会拖慢渲染。

## 模板

`scene-template.html` 是一个可运行的最小示例：

```bash
# 浏览器预览
open scene-template.html#preview

# 固定在第 5 秒（方便截图对稿）
open "scene-template.html?t=5"

# 渲染 10 秒
node render.mjs scene-template.html template.mp4
```

## 常见问题

**字体缺字**：把字体文件放进 `fonts/`，用 `@font-face` 引入；同时在 `qa.md` 标注兜底字体。

**渲染很慢**：先降特效（模糊、阴影、粒子），不要降分辨率。1080p 30fps 的 45 秒片子，普通笔记本通常要 8–15 分钟；超过 20 分钟就先减特效。

**画面抖动**：检查是否用了 CSS `animation` 而不是 `__seek` 驱动；渲染时必须由 `__seek` 决定每一帧。

**音画不同步**：先用 `--duration` 对齐总时长，再检查音频起点；ffmpeg 的 `-shortest` 会截断，不要把音频做得比视频短。
