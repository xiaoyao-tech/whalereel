# 六种风格的实现提示

给写场景代码的 agent 看的技术参考。不是规范，是“怎么把它做出来”的捷径。

## 通用

- 舞台固定 1920×1080，用 `transform: scale()` 适配窗口；渲染时只截舞台。
- 所有动画由 `window.__seek(t)` 驱动；不要用 CSS `animation`，否则逐帧截图会漂。
- 线条绘制统一用 SVG：`pathLength="1"`，`stroke-dasharray: 1`，`stroke-dashoffset: 1 - p`。
- 纸张/噪点纹理用内联 SVG `feTurbulence` 的 data URI，避免外部图片。
- 字体优先 `@font-face` 嵌入；没有字体文件时用 `local()` + 兜底，并在 `qa.md` 标注。
- 文案集中在 `COPY` 对象里；不要在 DOM 里散落硬编码。

## 立体纸雕

- 每一层一个绝对定位的 `div`，用 `clip-path` 或 SVG  silhouette 做形状；`z-index` 从远到近。
- 层深：按 `t` 给每层不同的 `translateX/Y` 和 `scale`，近层动得多、远层动得少。
- 纸的厚度：`filter: drop-shadow(0 2px 2px rgba(0,0,0,.22))`，再加 1px 内亮边/外暗边。
- 背光：层后面放一个 `radial-gradient` 光斑，`mix-blend-mode: screen`；光斑随 `t` 变暖/变冷。
- 纸纹：`feTurbulence` 覆盖层，透明度 4–8%，`pointer-events: none`。
- “穿层”：把最前层放大到超出视口，或用一个 `clip-path` 遮罩逐步打开；不要真的做 3D 摄像机。
- 灰尘：20–30 个小圆点，位置由索引确定（不要 `Math.random()`），缓慢上浮。

## 白板讲解

- 板面：`#F7F7F2` + 3% 噪点；四角轻微暗角。
- 线条：SVG `path`，`stroke-linecap: round`，宽 5–7；用 `feTurbulence` + `feDisplacementMap`（scale 2–3）做手绘抖动。
- 笔尖：小圆点，位置用 `path.getPointAtLength(p * total)`；不画线时隐藏。
- 圆圈：椭圆路径 + dashoffset；结束时多转 8%，像手画的。
- 擦除：板面色的矩形横扫，后面留 3% 灰痕；不要用 `opacity: 0` 硬切。
- 便签：旋转 -2°~2° 的 `div`，带阴影；磁铁用 `radial-gradient` 小圆。
- 每拍最多 3 个元素；新元素出现时，旧元素不要同时动。

## 一笔画

- 只有一条 SVG `path`，`fill: none`，`stroke-linecap: round`，`stroke-linejoin: round`。
- 连续性：整条 `d` 只能有一个 `M`；后续全部用 `C/S/Q` 连接，不能有新的 `M`。
- 绘制：`const L = path.getTotalLength()`；`strokeDashoffset = L * (1 - p)`。
- 镜头：让 `viewBox` 跟随 `p` 处的点；或反向平移 `<g>`，让线头保持在画面中心偏下。
- 形状变化：不要做真正的 morph；预先设计一条长线，让它依次“经过”侧脸、道路、房子、鸟、圆。
- 纸纹：5% 噪点 + 轻微暗角；线宽 3–5px，不要纯黑 `#000`，用 `#1B1B1B`。
- 结尾红点：一个 8–12px 的圆，或一个 90px 的方印；只出现一次。

## 水墨

- 纸：暖白 + `feTurbulence` 纤维 + 暗角；不要纯白。
- 远山：3–5 个大的模糊形状（`border-radius: 50%` + `blur(20–40px)`），或 SVG path + `feGaussianBlur`。
- 湿边：同一形状复制一层，`stroke` 深一点、`blur(1px)`，放在下面。
- 飞白：SVG path + `stroke-dasharray: 2 6` + `feDisplacementMap`；只在干笔处用。
- 雾：纸色的半透明横带，缓慢横移；`mix-blend-mode: screen`。
- 墨色只用 3 层：焦墨（近）、重墨（中）、淡墨（远）；不要纯黑大面积填充。
- 印章：红色方框 + 篆书/宋体白字，旋转 -3°；全片只出现一次。

## 蜡笔绘本

- 抖动线：SVG path + `feTurbulence` + `feDisplacementMap`（scale 3–6）；或用固定种子的短线段拼接。
- 蜡痕：噪点/斜线纹理覆盖层，`mix-blend-mode: multiply`，透明度 10–18%。
- 涂色：粗糙多边形 + 稍微偏移的描边；故意留 1–2 个缺口。
- 翻页：右半页 `rotateY(-160deg)`，`transform-origin: left`；下面露出下一页；加纸张阴影。
- 动作：`steps(5)` 或简单的上下位移；不要用很长的 `cubic-bezier` 缓动。
- 文字：手写童体，每行 -1°~1° 旋转；字号大，行距松。
- 颜色控制在 6 个以内；暖色为主。

## 俯视立体

- 网格：CSS `transform: rotateX(60deg) rotateZ(-45deg)` 作用在一个平面上；或直接画 2:1 等距 SVG 网格。
- 建筑：用多个 `div` 做“顶面 + 左面 + 右面”；顶面最亮，右面最暗；不要用真 3D。
- 阴影：`filter: drop-shadow()` 或斜椭圆；统一从左上打光。
- 小人/车：圆 + 矩形，沿路径移动；位置由 `t` 计算，不要随机。
- 移轴：复制一层场景 `blur(2px)`，用遮罩保留中心清晰；或只对边缘元素加模糊。
- 标签：绝对定位 + SVG 引线；手动排布，保证不交叉；同屏 ≤5 个。
- 底座：一个圆角矩形 + 厚度边；边缘留 40–60px，像放在桌上。
