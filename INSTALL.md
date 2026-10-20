# 在 DeepSeek Harness 里安装鲸片

> 读者三步：**下载项目 → 运行安装脚本 → 新建会话粘贴提示语**。
> 这一页把每一步写死，照着做即可。

## 你需要

- DeepSeek Harness（桌面端或 CLI 均可）
- Node.js 18+
- ffmpeg
- 本机 Chrome（或 Playwright 自带的 Chromium）

## 第一步：下载

GitHub 页面 → **Code → Download ZIP**；解压后把文件夹改名为 `whalereel`。

确认这一层存在：

```
whalereel/
├── SKILL.md          ← 必须在根目录
├── styles/
├── render/
└── scripts/install-harness.sh
```

不要出现 `whalereel/whalereel/SKILL.md` 这种多套一层的情况，Harness 会找不到。

## 第二步：安装

```bash
cd whalereel
bash scripts/install-harness.sh
# 默认安装到 ~/.dsh/skills/whalereel
```

装到某个项目里（只在该项目可见）：

```bash
bash scripts/install-harness.sh /path/to/project/.dsh/skills
```

不想用脚本，也可以手动复制：

```bash
mkdir -p ~/.dsh/skills
cp -R whalereel ~/.dsh/skills/whalereel
```

Harness 会扫描项目级和用户级的 `.dsh/skills`，以及 `.agents/skills`。如果 `.dsh/skills` 不被你的版本识别，换成：

```bash
bash scripts/install-harness.sh ~/.agents/skills
```

如果你的版本用别的路径，打开 **Settings → Skills** 看当前目录，把 `whalereel` 放进去即可。

> 只装一份。`~/.dsh/skills` 和 `~/.agents/skills` 同时放会出现两个同名技能。

## 第三步：新建会话

**不要用装之前的旧会话**。新开一个 DeepSeek Harness 会话，在技能列表里确认出现 `whalereel`，然后输入：

```
用 whalereel 做一条潭柘寺的景区介绍，45 秒，16:9，用立体纸雕风格。
```

没自动加载就输入 `/whalereel` 手动触发。

**没出现？** 按顺序检查：

- [ ] `~/.dsh/skills/whalereel/SKILL.md` 存在
- [ ] 没有多套一层 `whalereel/whalereel`
- [ ] 文件夹名和 `SKILL.md` 里的 `name: whalereel` 一致
- [ ] 新开了会话，不是旧会话
- [ ] 没有同时装在 `.dsh/skills` 和 `.agents/skills`
- [ ] 换到 `~/.agents/skills/whalereel` 试过

## 渲染依赖

Skill 负责写脚本和场景代码；真正出 mp4 需要本机渲染。

```bash
cd ~/.dsh/skills/whalereel
npm i playwright

# ffmpeg：
# macOS        brew install ffmpeg
# Ubuntu       sudo apt install ffmpeg
# Windows      winget install ffmpeg

mkdir -p renders
node render/render.mjs render/scene-template.html renders/test.mp4 \
  --width 1920 --height 1080 --duration 2 --fps 12 --channel chrome
```

没有 Chrome，就装 Playwright 自带的 Chromium：

```bash
npx playwright install chromium
# 然后去掉 --channel chrome
```

> `install-harness.sh` 只复制 skill 运行必需的文件（`SKILL.md`、`styles/`、`templates/`、`examples/`、`render/` 等）。想跑样片和 `render:demos`，用完整仓库：
>
> ```bash
> cd whalereel
> npm install
> npm run render:demos
> ```

## 只想用提示词，不装 skill

也可以。打开 `styles/<slug>/STYLE.md`，复制“6. 风格提示词（可直接复制）”那一节，加上主题、时长、画幅，直接发给 Harness。

六种风格的复制即用版本见 [PROMPTS.md](PROMPTS.md)。

## 常见问题

**能生成，但不出 mp4。**
先看 `render/render.mjs` 的报错：缺 ffmpeg、缺 Playwright、或 `--channel chrome` 找不到 Chrome。按上面的依赖装齐。

**中文缺字。**
样片用的是系统字体（Songti / PingFang / Kaiti）。换机器后如果缺字，把可商用字体放进 `assets/fonts/`，在场景 CSS 里用 `@font-face` 引入。

**渲染很慢。**
8 秒 720p 约 30–60 秒；45 秒 1080p 约 8–15 分钟。先减特效，不要降分辨率。

**想加第 7 种风格。**
看 [CONTRIBUTING.md](CONTRIBUTING.md)：一份 `STYLE.md` + 一支 10 秒测试片 + 一条 `index.json` 记录。
