# 贡献指南

鲸片只做一件事：**用代码把一件事讲清楚**。欢迎加风格、修渲染、补文档，但请先读完这份指南。

## 加一种风格：7 步

1. **起名。** 中文名 + 英文 slug，例如 `档案报纸 / archive`。
2. **复制模板。** `cp -r styles/_template styles/<slug>`，把 `STYLE.md` 填满 9 个 section。
3. **写契约。** 色板 ≤6 色；运动词汇 ≤5 个；禁止项 ≥3 条；验收清单 ≥4 条。不要写“高级感”“电影感”这种无法验收的词。
4. **做一支 10 秒测试片。** 放在 `scenes/<slug>-test.html`，用 `render/render.mjs` 渲染，确认渲染链路和中文排版没问题。
5. **做一支正式样片。** 8 秒，1280×720，24fps；输出 `renders/<slug>.mp4` 和 `previews/<slug>.jpg`。
6. **登记。** 在 `index.json` 加一条：slug、name、best_for、avoid、duration、difficulty、palette、signature、demo、preview。
7. **跑校验。** `node scripts/validate-styles.mjs`，确保 9 个 section、色板数量、禁止项、验收项、文件路径都通过。

## 质量门槛

一支风格能不能进主线，看五条：

| 维度 | 及格线 |
|---|---|
| 视觉一致性 | 全片色板、字体、材质、阴影方向不打架 |
| 可复现 | 同一份 `STYLE.md` + 同一份脚本，第二个人能做出 80% 像的片子 |
| 信息密度 | 8 秒内只讲一件事；没有为了“炫”加的镜头 |
| 情绪 | 看完有一个明确的感受，而不是“哦，挺技术” |
| 完成度 | 有开头、有结尾、有 1 个签名瞬间；没有半成品帧 |

## PR 检查清单

- [ ] `STYLE.md` 有 9 个 `##` section
- [ ] 色板 ≤6 色，且都写了 hex
- [ ] 禁止项 ≥3 条
- [ ] 验收清单 ≥4 条
- [ ] 有 10 秒测试片或 8 秒样片
- [ ] `index.json` 已登记，路径存在
- [ ] `node scripts/validate-styles.mjs` 通过
- [ ] 没有引入未授权字体、音乐、图片
- [ ] 没有把民间说法写成“史料记载”

## 代码约定

- 场景是**自包含 HTML**：`window.__duration`、`window.__seek(t)`、`window.__ready`。
- `__seek(t)` 必须是纯函数：不依赖 `Date.now()`、`Math.random()`、网络。
- 不联网加载素材；字体/纹理要么内联，要么放 `assets/`。
- DOM <500 节点；少用大面积 `filter: blur()`。
- 文案集中在 `COPY` 对象里，方便改。
- 不提交 `node_modules/`、`*.wav`；样片 mp4 放 `renders/`（单支 <1MB），超过 10MB 的放 Releases。

## 提交信息

```
feat(style): add archive / 档案报纸
fix(render): handle missing font fallback
docs(readme): add 30s trailer
```

## 风格提案

开 issue，标题写 `[style] 档案报纸 / archive`，附：

- 3 个参考片/图；
- 一句视觉主张；
- 适合 / 不适合；
- 一条 10 秒测试片链接；
- 你愿意维护它吗？

没有测试片的提案，只会被当成“想法”，不会进主线。

## 行为准则

- 对事不对人；不嘲讽“土”“low”。
- 不抄袭他人的 STYLE.md 文本、场景代码、样片；参考可以，复制不行。
- 商用前自行确认字体、音乐、图片、商标的授权。
