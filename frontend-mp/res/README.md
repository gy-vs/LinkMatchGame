# 游戏资源目录

此目录用于存放游戏的图片、音频等资源文件。

## 目录结构

```
res/
├── images/           # 图片资源
│   ├── patterns/     # 游戏图案
│   ├── ui/           # UI元素
│   └── bg/           # 背景图片
├── audio/            # 音频资源
│   ├── bgm.mp3       # 背景音乐
│   ├── click.mp3     # 点击音效
│   ├── match.mp3     # 匹配成功音效
│   └── win.mp3       # 胜利音效
└── README.md         # 本文件
```

## 当前资源方案

由于原始需求中没有提供资源文件，当前游戏使用以下占位方案：

### 游戏图案
使用 **Emoji 符号** 作为占位符：
- 🍎 🍊 🍋 🍇 🍓 🍒 🥝 🍑 🍌 🥭 🍍 🥥

### 背景和UI
使用 **Canvas 绘制** 的纯色和渐变：
- 主色调: #FF6B6B
- 辅助色: #4ECDC4
- 背景色: #F5F5F5

### 音效
当前 **未启用音效**，游戏可正常运行。

---

## 如何替换为实际资源

### 1. 准备图片资源

将图案图片放入 `images/patterns/` 目录，推荐规格：
- 格式: PNG (支持透明)
- 尺寸: 128x128 像素
- 命名: pattern_1.png, pattern_2.png, ...

### 2. 准备音频资源

将音频文件放入 `audio/` 目录，推荐规格：
- 格式: MP3 或 WAV
- 采样率: 44100Hz
- 音效时长: < 2秒
- BGM: 循环播放，建议30秒-2分钟

### 3. 修改资源管理器

编辑 `js/res/ResourceManager.js`：

```javascript
// 添加图片资源
this.imageList = [
  { key: 'pattern_1', src: 'res/images/patterns/pattern_1.png' },
  { key: 'pattern_2', src: 'res/images/patterns/pattern_2.png' },
  // ... 更多图案
];

// 添加音频资源
this.audioList = [
  { key: 'bgm', src: 'res/audio/bgm.mp3' },
  { key: 'click', src: 'res/audio/click.mp3' },
  { key: 'match', src: 'res/audio/match.mp3' },
  { key: 'win', src: 'res/audio/win.mp3' },
];
```

### 4. 修改游戏配置

编辑 `js/config.js`，将图案列表改为图片key：

```javascript
PATTERNS: ['pattern_1', 'pattern_2', 'pattern_3', ...],
```

### 5. 在渲染器中使用

```javascript
import ResourceManager from '../res/ResourceManager';

// 绘制图案时
ResourceManager.drawPattern(ctx, pattern, x, y, size);

// 播放音效
ResourceManager.playSound('click');
ResourceManager.playSound('match');
```

---

## 资源优化建议

1. **图片压缩**: 使用 TinyPNG 等工具压缩图片，减小包体积
2. **音频压缩**: 使用较低码率的MP3，128kbps足够
3. **按需加载**: 大资源可考虑分包加载
4. **缓存策略**: 图片资源会自动缓存，无需重复加载

---

## 版权说明

请确保使用的资源拥有合法授权，避免版权纠纷。

推荐免费资源站点：
- [OpenGameArt](https://opengameart.org/) - 免费游戏资源
- [Kenney](https://kenney.nl/) - CC0协议游戏资源
- [Freesound](https://freesound.org/) - 免费音效
