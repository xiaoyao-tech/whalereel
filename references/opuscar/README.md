# Opuscar 风格提示词（参考副本）

> 这里放的是 [LemoLab / Opuscar](https://github.com/lemomo-ai/lemo-opuscar) 的原始 `STYLE.md`，**未修改**，仅作参考。
> 鲸片自己的 `styles/<slug>/STYLE.md` 会在此基础上改写，并在文件头注明来源。

- 来源：`https://github.com/lemomo-ai/lemo-opuscar`
- 版权：Copyright (c) 2026 LemoLab
- 许可证：MIT（见本目录 `LICENSE`）
- 拉取日期：2026-10-20
- 拉取方式：GitHub Contents API，`ref=main`

## 对应关系

| 鲸片风格 | 参考文件 | 说明 |
|---|---|---|
| 白模投影 | `styles/white-model.md` | 潭柘寺第一支片 |
| 白板讲解 | `styles/whiteboard.md` | AI 幻觉 |
| 产品拆解 | `styles/teardown.md` | 吹风机 / 开源硬件 |
| 水墨 | `styles/ink-wash.md` | 富春山居图 |
| 蜡笔绘本 | `styles/crayon-book.md` | 一颗种子的旅行 |
| 俯视立体 | `styles/iso-infographic.md` | 快递包裹 24 小时 |
| 俯视立体（备选） | `styles/tilt-shift.md` | 如果要做“实拍微缩”而不是“信息图” |

## 使用边界

MIT 允许复制、修改、商用，但要求保留版权声明和许可证。因此：

- 本目录保留原始文件 + `LICENSE`，不删版权头。
- 鲸片的 `styles/` 是**改写版**，不是原样复制；文件头写“参考 Opuscar 的 XXX 风格（MIT）”。
- 鲸片的 `CREDITS.md` 要写明来源。
- 不复制 Opuscar 的样片、截图、音效、字体；只参考提示词的**语法和结构**。
- 如果之后要把这些提示词直接嵌进商业课程/模板售卖，建议再和 LemoLab 确认一次；MIT 本身允许，但这是礼貌问题。

## 原始提示词的结构

六份文件基本都按这个结构写：

1. Essence / 什么不是
2. Materials & rendering
3. Colour logic
4. Type & subtitles
5. Motion quality
6. Camera grammar
7. Sound palette
8. Native moves
9. Pitfalls
10. Engine
11. Variation space

鲸片的改写版会保留 1、2、3、6、8、9，压缩 4、5、7、10，并增加：

- `素材与数据`：拍之前要准备什么、数据从哪来、哪些不能编。
- `鲸片管线`：2D Canvas / SVG / Three.js 的实现建议。
- `验收`：与当前项目一致的检查项。
