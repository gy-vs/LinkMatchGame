# 连线消消乐 - 抖音小游戏

一款完整的连连看类休闲游戏项目，包含抖音小游戏前端、Spring Boot 后端服务和 Vue3 管理后台。

---

## How to Run

### 环境要求

| 依赖 | 版本 | 说明 |
|------|------|------|
| Docker | 20.10+ | 容器运行环境 |
| Docker Compose | 2.0+ | 容器编排工具 |

> ✅ 支持 ARM64 (Apple Silicon Mac M1/M2/M3) 和 AMD64 (Intel)

### 一键启动（推荐）

```bash
# 1. 进入项目目录
确保进入根目录

# 2. 构建并启动所有服务（首次约 3-5 分钟）
docker-compose up --build -d

# 3. 查看服务状态
docker-compose ps

# 4. 等待所有服务就绪（约 30-60 秒）
# 当看到以下状态表示启动成功：
# game-mysql            Up (healthy)
# game-backend          Up (healthy)
# game-frontend-admin   Up
```

### 启动流程说明

Docker Compose 会自动完成以下步骤：

1. **数据库初始化**
   - 启动 MySQL 8.0 容器
   - 自动执行 `backend/schema.sql` 创建数据库和表
   - 插入默认管理员账号和 5 个游戏关卡

2. **后端服务启动**
   - 等待数据库健康检查通过
   - Maven 构建 Spring Boot 应用
   - 启动后端 API 服务（端口 8080）

3. **前端服务启动**
   - npm 构建 Vue3 管理后台
   - Nginx 提供静态文件服务
   - 管理后台（端口 8081）

### 停止服务

```bash
# 停止所有服务（保留数据）
docker-compose down

# 停止并清除所有数据（包括数据库）
docker-compose down -v
```

### 重新构建

```bash
# 代码修改后重新构建
docker-compose up --build -d

# 仅重建某个服务
docker-compose build backend
docker-compose up -d backend
```

---

## Services

### 服务端口列表

| 服务 | 容器名 | 端口 | 访问地址 |
|------|--------|------|----------|
| MySQL 数据库 | game-mysql | 3306 | localhost:3306 |
| 后端 API | game-backend | 8080 | http://localhost:8080/api |
| 管理后台 | game-frontend-admin | **8081** | http://localhost:8081 |

### 技术栈详情

| 模块 | 技术栈 |
|------|--------|
| **backend** | Java 17 + Spring Boot 3.2 + MyBatis-Plus 3.5 + MySQL 8.0 + JWT |
| **frontend-admin** | Vue 3.4 + Vite 5 + **Element Plus 2.4** + **Pinia 2.1** + Vue Router 4 + Axios + **Scss** |
| **frontend-mp** | 抖音原生开发 + Canvas 2D + ES6 Modules |

### 管理后台技术说明

- **Element Plus**：UI 组件库，提供表格、表单、弹窗等组件
- **Pinia**：状态管理，管理用户登录状态和 Token
- **Scss**：CSS 预处理器，实现主题变量和样式复用
- **Axios**：HTTP 请求库，封装 API 调用和拦截器

---

## 测试账号

### 管理后台登录

| 项目 | 值 |
|------|-----|
| 地址 | http://localhost:8081 |
| 用户名 | `admin` |
| 密码 | `123456` |

### 数据库连接

| 项目 | 值 |
|------|-----|
| Host | localhost |
| Port | 3306 |
| Database | game_db |
| Username | root |
| Password | root123456 |

---

## 项目结构

```
1770/
├── backend/                      # 后端服务 (Java 17 + Spring Boot 3.2)
│   ├── Dockerfile               # Docker 多阶段构建
│   ├── pom.xml                  # Maven 依赖配置
│   ├── schema.sql               # 数据库初始化脚本
│   └── src/main/java/com/game/
│       ├── controller/          # API 控制器
│       ├── service/             # 业务逻辑层
│       ├── mapper/              # MyBatis-Plus 数据访问
│       ├── entity/              # 实体类
│       ├── dto/                 # 数据传输对象
│       ├── common/              # 统一响应、异常处理
│       └── config/              # 配置类（CORS、JWT）
│
├── frontend-admin/               # 管理后台 (Vue 3 + Element Plus + Pinia + Scss)
│   ├── Dockerfile               # Docker 多阶段构建
│   ├── nginx.conf               # Nginx 反向代理配置
│   ├── package.json             # NPM 依赖
│   ├── vite.config.js           # Vite 构建配置
│   └── src/
│       ├── api/                 # API 请求封装
│       ├── store/               # Pinia 状态管理
│       ├── router/              # Vue Router 路由
│       ├── views/               # 页面组件
│       └── styles/global.scss   # 全局 Scss 样式
│
├── frontend-mp/                  # 抖音小游戏 (Canvas 原生开发)
│   ├── game.json                # 游戏配置
│   ├── project.config.json      # 抖音项目配置（含域名校验关闭）
│   ├── game.js                  # 游戏主文件（含动画、特效、音效）
│   └── README.md                # 小游戏说明
│
├── docker-compose.yml           # Docker 编排配置
├── .gitignore                   # Git 忽略规则
└── README.md                    # 项目说明
```

---

## 功能验证

### 1. 验证服务状态

```bash
# 检查所有容器运行状态
docker-compose ps

# 预期输出（所有 STATUS 应为 Up）：
# game-mysql            Up (healthy)
# game-backend          Up (healthy)
# game-frontend-admin   Up
```

### 2. 验证后端 API

```bash
# 测试关卡列表接口
curl http://localhost:8080/api/game/levels

# 预期返回 JSON：
# {"code":200,"message":"操作成功","data":[...]}

# 测试管理员登录
curl -X POST http://localhost:8080/api/admin/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"123456"}'

# 预期返回包含 token
```

### 3. 验证管理后台

1. 打开浏览器访问 http://localhost:8081
2. 使用 `admin` / `123456` 登录
3. 验证功能：
   - ✅ Dashboard 显示统计数据（数字动画）
   - ✅ 用户管理列表加载（分页、搜索）
   - ✅ 关卡管理支持增删改查
   - ✅ 游戏记录分页显示（游戏时间正确展示）
   - ✅ 个人信息页面

### 4. 验证小游戏（抖音开发者工具）

#### 下载并安装抖音开发者工具

1. 访问 [抖音开发者工具下载页面](https://developer.open-douyin.com/docs/resource/zh-CN/mini-game/develop/developer-instrument/developer-instrument-update-and-download)
2. 下载适合您系统的版本（Windows / macOS）
3. 安装并启动开发者工具

#### 导入并运行项目

1. 启动抖音开发者工具
2. 点击「打开项目」或「导入项目」
3. **选择 `frontend-mp` 文件夹**（不是整个项目目录）
4. AppID 选择「测试号」或输入 `testAppId`
5. 点击确定，等待项目加载

#### 功能验证

加载完成后，在模拟器中验证：
   - ✅ **主菜单**：游戏启动显示主菜单，包含开始游戏、排行榜、设置
   - ✅ **关卡选择**：从后端同步关卡配置
   - ✅ **游戏玩法**：点击相同图案消除
   - ✅ **粒子特效**：消除时彩色粒子爆炸
   - ✅ **飘字动画**：得分和连击提示上浮
   - ✅ **连击系统**：快速连续消除触发 COMBO 加成
   - ✅ **震动效果**：消除成功时屏幕轻微震动
   - ✅ **音效反馈**：点击、消除、胜利、失败音效
   - ✅ **排行榜**：与后端同步，显示自己的排名
   - ✅ **游戏记录**：分数和用时同步到后端

#### 重要设置

在抖音开发者工具中测试时，需要：
1. 点击右上角 **详情**
2. 勾选 **「不校验合法域名、业务域名、TLS版本」**

> 注意：小游戏使用 tt.* API，需要在抖音开发者工具中运行

---

## 资源与特效说明

由于原始需求中"准备好了所有的材料，但是没有资源"，本项目采用以下方案：

### 游戏图案

使用 **60+ Emoji 符号** 作为游戏图案：
```
🍎 🍊 🍋 🍇 🍓 🍒 🥝 🍑 🍌 🥭 🍍 🥥 🍉 🥑 🍈 🫐 🍏 🍐
🌸 🌺 🌻 🌹 🌷 💐 🪷 🌼 🏵️ 💮 ⭐ 🌟 ✨ 💫 ⚡ 🔥 ❄️ 💧
🎈 🎁 🎀 🎄 🎃 🎯 🎪 🎨 🎭 🎵 💎 💰 👑 🏆 🔮 💝 ...
```

### 视觉效果

使用 **Canvas 绘制** 实现丰富的视觉效果：
- 主色调：`#FF6B6B`（珊瑚红）
- 辅助色：`#4ECDC4`（青绿色）
- 背景渐变：`#667eea → #764ba2`（紫蓝渐变）
- 主菜单：深色主题 `#1a1a2e → #16213e → #0f3460`

### 动画特效

| 特效 | 说明 |
|------|------|
| 🎆 粒子爆炸 | 消除方块时彩色粒子四散 |
| 📝 飘字动画 | 得分、连击提示上浮渐隐 |
| 💥 震动效果 | 消除成功时画面轻微抖动 |
| 🔄 缩放动画 | 选中方块放大高亮 |
| 🌈 渐变背景 | 主菜单背景动态旋转光点 |

### 音效系统

| 事件 | 音效 |
|------|------|
| 点击 | 清脆点击声 |
| 消除 | 悦耳消除声 |
| 胜利 | 欢快庆祝声 |
| 失败 | 温和提示声 |

---

## 常见问题

### Q: 端口被占用？

```bash
# 查看占用端口的进程
lsof -i :8080
lsof -i :8081

# 停止占用的容器
docker stop <container_name>
```

### Q: 后端无法连接数据库？

```bash
# 等待 MySQL 健康检查通过（约 30 秒）
docker-compose logs -f mysql
# 看到 "ready for connections" 表示就绪
```

### Q: 管理后台登录失败？

```bash
# 检查后端服务是否正常
curl http://localhost:8080/api/game/levels

# 检查后端日志
docker-compose logs backend
```

### Q: 如何完全重置？

```bash
# 删除所有容器和数据卷
docker-compose down -v

# 重新构建启动
docker-compose up --build -d
```

---

## UI/UX 设计规范

### 视觉分层

| 层级 | 样式 |
|------|------|
| 页面背景 | `#F5F7FA` |
| 卡片背景 | `#FFFFFF` + `box-shadow: 0 2px 12px rgba(0,0,0,0.1)` |
| 边框 | `#EBEEF5` |

### 交互反馈

| 交互 | 效果 |
|------|------|
| 按钮 Hover | `transform: translateY(-2px)` + 阴影加深 |
| 按钮 Loading | 显示加载图标 + 禁用点击 |
| 表格行 Hover | 背景色变为 `rgba(255,107,107,0.04)` |
| 输入框 Focus | 边框变为主题色 |

### 统一间距

- 小间距：`8px`
- 中间距：`16px`
- 大间距：`24px`
- 卡片圆角：`12px`

---

## License

MIT License
