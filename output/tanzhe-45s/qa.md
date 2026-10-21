# 验收清单 · 潭柘寺 45 秒

核验时点：2026-10-21（Asia/Shanghai）。以下都是实跑结果。

## 成片

```text
$ ffprobe -v error -show_entries format=duration,size:stream=codec_name,width,height,r_frame_rate,sample_rate,channels -of default=nw=1 renders/01-tanzhe-45s.mp4
codec_name=h264
width=1920
height=1080
r_frame_rate=24/1
codec_name=aac
sample_rate=48000
channels=2
duration=45.000000
size=6745190
```

- 1,080 帧（`-count_frames` 实测），24 fps，45.000 s。
- `blackdetect=d=0.1:pix_th=.02`：**0 条**黑帧/近黑帧。
- `ebur128`：**I = −14.1 LUFS**（目标 −14），真峰值 ≤ −1.5 dB。
- 画面：H.264，yuv420p，1920×1080；声音：AAC 48 kHz 立体声。

## 文字

- [x] 无错字、无多字、无缺字
- [x] 字幕在底部安全区，单行
- [x] 标题竖排/横排断行正确（“潭柘寺”三字，未拆行）
- [x] 数字、地名、年代已核对（见 `sources.md`）

## 时间

- [x] 总时长 45.000s，与脚本一致
- [x] 无 >2s 的无意义空镜（最长静止是 40.6–45s 的落印定格）
- [x] 四句旁白与字幕对齐（7.0 / 14.6 / 24.6 / 34.4s）
- [x] 结尾定格 4.4s

## 风格

- [x] 色板只用 6 色：纸白 `#F3EBDD`、牛皮 `#C9A77C`、暖灯 `#FFB86B`、松绿 `#4E6E5D`、朱砂 `#B4462F`、墨 `#1E1A17`
- [x] 运动只有：推近、拉远、山门滑出、光变
- [x] 没有 3D 塑料感、霓虹、快切
- [x] 签名瞬间：12–22s 山门向下滑出画面
- [x] 与 8 秒样片放在一起，像一家人

## 声音

- [x] 人声清晰，音乐在人声下约 16 dB
- [x] 无爆音 / 削波
- [x] 划火柴、纸响、过门风声、脚步、磬与画面对齐
- [x] 整体 −14.1 LUFS

## 事实与版权

- [x] “先有潭柘寺，后有北京城”标注为民间说法
- [x] 建寺年份未写成确定史实（旁白用“西晋至今”）
- [x] 画面全部为代码绘制；配乐为 numpy 合成；无第三方素材
- [x] 字体为系统 Songti SC，发布前替换可商用宋体

## 文件

- [x] 1080p，H.264，AAC，6.4 MB
- [x] 工程齐全：`brief.md`、`script.md`、`sources.md`、`qa.md`、`score.py`、`mix.wav`
- [x] 场景：`scenes/01b-tanzhe-45s.html`

## 已知问题

1. 建筑是 SVG 拼的，近看是“像”不是考据；屋顶起翘、斗拱都简化了。
2. 人物只有 30px，是一根带边光的小棍。
3. 天空是一层渐变，没有云；4K 大屏会显得干净过头。
4. 旁白是 TTS（云扬），句尾偏平；正式片建议真人补录。
5. 为了 1080p 渲染速度，去掉了 SVG 滤镜（feTurbulence / drop-shadow），纸边颗粒感比 8 秒样片弱；后续可以做一版高精度渲染。
