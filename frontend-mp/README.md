# 连线消消乐 - 抖音小游戏

## 在抖音开发者工具中运行

### 步骤

1. **下载抖音开发者工具**
   - 访问: https://developer.open-douyin.com/docs/resource/zh-CN/mini-game/develop/developer-instrument/developer-instrument-update-and-download
   - 下载并安装适合您系统的版本

2. **打开项目**
   - 启动抖音开发者工具
   - 点击「打开项目」或「导入项目」
   - 选择 `frontend-mp` 文件夹
   - AppID 选择「测试号」或使用 `testAppId`

3. **运行游戏**
   - 项目加载完成后，模拟器会自动显示游戏界面
   - 点击模拟器中的按钮进行操作

## 项目结构

```
frontend-mp/
├── game.js              # 游戏主文件（所有代码）
├── game.json            # 游戏配置
├── project.config.json  # 项目配置
├── index.html           # 网页预览版（浏览器测试用）
└── README.md            # 说明文档
```

## 游戏功能

- 🎮 **5个关卡** - 难度递增
- 👤 **假登录系统** - 自动生成随机用户
- 🏆 **排行榜** - 含假数据和自己的排名
- 💾 **本地存储** - 分数自动保存

## 玩法说明

1. 选择一个关卡开始游戏
2. 点击两个相同的水果图案即可消除
3. 在时间内消除所有配对即可过关
4. 得分会累计到总分

## 技术说明

- 使用 Canvas 2D 渲染
- 使用 `tt` 全局对象（抖音小游戏API）
- 触摸事件通过 `tt.onTouchEnd` 处理
- 数据存储使用 `tt.getStorageSync` / `tt.setStorageSync`

## 网页预览

如果没有抖音开发者工具，可以访问网页预览版:

```
http://localhost:8082
```

注意：网页版功能相同，但使用的是标准 Web API 而非抖音小游戏 API。
