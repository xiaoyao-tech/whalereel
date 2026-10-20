# Changelog

## v0.2.0 — 2026-10-20

把四个真实案例的风格收进库里，并给流程加上“搜资料”这道闸。

### 新增风格

- 档案卷宗 `dossier`：对应案例「朱元璋」三集。米色卷宗纸、涂黑条、印章、朱红只给“判决”。
- 钢笔淡彩 `pen-wash`：对应案例「庐州月」60 秒。线先于色，颜色跟着一盏灯笼走，默认无旁白。
- 白模投影 `white-model`：对应案例「北京」120 秒。真实建筑轮廓 + 地形，数据是光；要求 `FACTS.md`。

### 退役风格

一笔画 `one-line`、蜡笔绘本 `crayon-book`、俯视立体 `isometric-diorama` 移入 `archive/v0.1/`，样式与样片一并保留，不再进 `index.json`。原因是：六种风格要每一种都有真实案例；这三种暂时没有。

### 流程

- `SKILL.md` 重写：解析 brief → 选/确认风格 → **搜资料** → 脚本 → 场景 → 10 秒测试片 → 渲染 → 验收 → 交付。
- 资料变成必经步骤：`sources.md` / `FACTS.md`；没有来源的数字不上屏；民间说法必须标注。
- 用户没指定风格时，推荐 2–3 个、说明理由、直接开工；指定了就照做。
- 新增失败处理表（字体、渲染超时、资料查不到、白模数据缺失）。

### 素材

- `renders/cases/{dossier,pen-wash,white-model}.mp4`：三段 24–30 秒案例片段（720p，含声音）。
- `renders/00-trailer-v2.mp4`：30 秒六风格混剪（片头 3s + 六段各 4s + 片尾 3s）。
- `previews/00-trailer-v2.jpg`、`renders/cases/*.jpg`：封面帧。
- `examples/cases.md`：四个案例的 brief、资料、结构、坑、可复用提示语。
- `styles/README.md`：风格索引与选型表。

### 文档

- README 重写：四个案例、六种风格、资料要求、诚实说明。
- PROMPTS.md 重写：六种风格提示语 + 自动选型 + 测试片 + 改稿话术。
- CREDITS 更新：逐项说明六份 `STYLE.md` 的来源；`pen-wash` 与 `white-model` 为 Opuscar 语法改写（CC BY 4.0）。
- 画廊页 `site/index.html` 换成新六种风格与案例片段。

### 已知限制

- 三支案例片段是从完整版裁的，不是为本仓库单独渲染的样片。
- 声音仍是短板：TTS + 合成音乐，正式片建议真人配音。
- 白模投影对数据要求高，缺数据时只能降级或换风格。
- 竖屏模板仍未做。

## v0.1.0 — 2026-10-20

首个可运行版本。

### 风格

- 立体纸雕 `paper-diorama`：潭柘寺样片。
- 白板讲解 `whiteboard`：RAG 样片。
- 一笔画 `one-line`：拖延样片。
- 水墨 `ink-wash`：深山藏古寺样片。
- 蜡笔绘本 `crayon-book`：月亮睡不着样片。
- 俯视立体 `isometric-diorama`：潭柘寺导览样片。

### 能力

- `SKILL.md`：一句话 → 选风格 → 脚本 → 场景代码 → 渲染 → 验收。
- `render/render.mjs`：Playwright + ffmpeg，支持本机 Chrome（`--channel chrome`）。
- `render/techniques.md`：六种风格的实现技巧。
- `scripts/render-demos.mjs`：一键渲染六支样片。
- `site/index.html`：六种风格画廊。
- `renders/00-trailer.mp4`：30 秒混剪（片头 3s + 六支各 4s + 片尾 3s）。
- `scripts/capture-previews.mjs`：按最佳帧生成六张封面。
- `scripts/validate-styles.mjs` + GitHub Actions：检查 9 个 section、色板、禁止项、验收项、文件路径。
- `README.en.md`：英文简介。
- `scripts/install-harness.sh`：装进 `~/.dsh/skills/whalereel`，只复制 skill 必需文件。
- `PROMPTS.md`：六种风格 + 自动选型 + 改稿的读者提示语。
- README / SKILL / ARTICLE 增加 DeepSeek Harness 的 3 步用法。
- `templates/sources.md`：事实核查模板。
- `examples/tanzhe-temple.md`：同一座寺的三种拍法。
- `templates/`：brief、script、qa 三份模板。

### 文档

- README、ROADMAP、CONTRIBUTING、CREDITS。
- MIT License。

### 已知限制

- 样片无声；声音包在 v0.2。
- 只有 16:9；竖屏模板在 v0.3。
- 8 秒 1280×720 渲染约 1 分钟；性能优化在 v0.3。
