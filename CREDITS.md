# Credits / 灵感来源

## 组织方式

鲸片的“风格书”结构参考了近期开源的代码渲染短片项目，尤其是 LemoLab 的 [Lemo-Opuscar](https://github.com/lemomo-ai/lemo-opuscar)：**一份风格契约 + 一支样片 + 可复用提示词**，外加导演指南与技术指南。

我们借的是组织方式，也借了两种风格的语法，逐项说明如下。

## 六份 STYLE.md 的来源

| slug | 来源 | 授权 |
|---|---|---|
| `dossier` 档案卷宗 | 本项目原创，改写自《洪武卷宗》的实践（`examples/cases.md`） | 本项目 |
| `pen-wash` 钢笔淡彩 | **改写自 Opuscar `urban-sketch`**，重写为中文语境，替换色板、镜头、声音与分镜 | 原文 CC BY 4.0 |
| `white-model` 白模投影 | **改写自 Opuscar `white-model`**，重写为中文语境，补充数据口径与 `FACTS.md` 要求 | 原文 CC BY 4.0 |
| `paper-diorama` 立体纸雕 | 本项目原创 | 本项目 |
| `whiteboard` 白板讲解 | 本项目原创 | 本项目 |
| `ink-wash` 水墨 | 本项目原创 | 本项目 |

“改写”指：保留风格的语法内核（例如钢笔淡彩的“线先于色、颜色作为事件”，白模投影的“模型是真实几何、数据是光”），重写全部文字、色板、镜头表、分镜与禁止项。没有整段复制原文。

来源仓库：https://github.com/lemomo-ai/lemo-opuscar  
作者：Lemomo（[@lemomo_ai](https://x.com/lemomo_ai)）  
许可：代码 MIT；风格文档与样片 CC BY 4.0。  
`references/opuscar/` 保存了几份原始 `STYLE.md` 的未修改副本，仅供对照。

## 案例片

| 案例 | 风格 | 说明 |
|---|---|---|
| 朱元璋（3 集） | 档案卷宗 | 本项目制作；史料见 `examples/cases.md` |
| 庐州月（60s） | 钢笔淡彩 | 本项目制作；配乐原创，不引用原曲 |
| 北京（120s） | 白模投影 | 本项目制作；建筑数据 © OpenStreetMap contributors（ODbL），地形 SRTM/GMTED（CC BY 4.0） |
| 潭柘寺（8s 样片） | 立体纸雕 | 本项目制作 |

`renders/cases/` 里是从完整版裁出的 24–30 秒片段，用于展示风格。

## 工具

- [Playwright](https://playwright.dev/)：逐帧截图。
- [ffmpeg](https://ffmpeg.org/)：合成 mp4。
- 本机 Chrome：渲染时通过 `--channel chrome` 调用。
- 白模投影案例使用 Three.js（MIT）。

## 字体

样片使用系统字体：

- 宋体 / Songti SC（标题、正文）
- 黑体 / PingFang SC（标签、英文）
- 楷体 / Kaiti SC（白板、绘本）

正式发布前请替换为可商用字体，并把字体文件放进 `assets/fonts/`，附 OFL 许可证。

## 参考片 / 视觉方向

- 档案卷宗：档案纪录片推近静态文件、调查报告一屏一条证据、产品微距片对纸纤维的打光
- 钢笔淡彩：城市速写（urban sketching）、水墨长卷的观看方式
- 白模投影：城市规划馆的投影沙盘、模型微距摄影、编辑型数据图
- 立体纸雕：纸雕灯箱、纸雕定格动画《传承》
- 白板讲解：RSA Animate、MinutePhysics
- 水墨：《小蝌蚪找妈妈》《山水情》《牧笛》

以上仅作为视觉方向参考，样片中的具体画面均为原创绘制。
