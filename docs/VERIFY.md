# 项目验证指南

本文档提供了完整的项目验证步骤，确保所有功能正常运行。

---

## 一、环境准备检查

### 1.1 Docker 环境

```bash
# 检查 Docker 版本
docker --version
# 预期: Docker version 20.10+

# 检查 Docker Compose 版本
docker-compose --version
# 预期: Docker Compose version 2.0+
```

### 1.2 本地开发环境（可选）

```bash
# 检查 Java 版本
java -version
# 预期: java 17+

# 检查 Maven 版本
mvn -version
# 预期: Apache Maven 3.6+

# 检查 Node.js 版本
node -v
# 预期: v18+

# 检查 npm 版本
npm -v
# 预期: 9+
```

---

## 二、Docker 部署验证

### 2.1 启动服务

```bash
cd 1770

# 启动所有服务
docker-compose up --build -d

# 查看服务状态
docker-compose ps
```

### 2.2 预期输出

```
NAME                   STATUS                   PORTS
game-mysql             Up (healthy)            0.0.0.0:3306->3306/tcp
game-backend           Up                      0.0.0.0:8080->8080/tcp
game-frontend-admin    Up                      0.0.0.0:8081->80/tcp
game-frontend-mp       Up                      0.0.0.0:8082->80/tcp
```

### 2.3 等待服务就绪

```bash
# 等待 MySQL 健康检查通过（约 30 秒）
docker-compose logs -f mysql

# 预期看到: "ready for connections"
```

---

## 三、后端 API 验证

### 3.1 健康检查

```bash
# 测试关卡列表接口
curl http://localhost:8080/api/game/levels

# 预期响应:
# {"code":200,"message":"操作成功","data":[...]}
```

### 3.2 完整 API 测试

```bash
# 1. 测试用户登录
curl -X POST http://localhost:8080/api/user/login \
  -H "Content-Type: application/json" \
  -d '{"openId":"test123","nickname":"测试用户","avatarUrl":""}'

# 预期: {"code":200,"message":"操作成功","data":{"id":1,"openId":"test123",...}}

# 2. 测试排行榜
curl http://localhost:8080/api/game/rank/top?limit=10

# 预期: {"code":200,"message":"操作成功","data":[...]}

# 3. 测试管理员登录
curl -X POST http://localhost:8080/api/admin/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"password"}'

# 预期: {"code":200,"message":"操作成功","data":{"token":"...", "name":"超级管理员"}}
```

---

## 四、管理后台验证

### 4.1 访问管理后台

打开浏览器访问: http://localhost:8081

### 4.2 登录测试

| 测试项 | 操作 | 预期结果 |
|--------|------|----------|
| 空用户名 | 不填用户名，点击登录 | 提示"请输入用户名" |
| 空密码 | 不填密码，点击登录 | 提示"请输入密码" |
| 错误密码 | 输入admin/wrong | 提示登录失败 |
| 正确登录 | 输入admin/password | 跳转到 Dashboard |

### 4.3 功能验证清单

#### Dashboard 页面
- [ ] 统计卡片显示数字（可能为 0）
- [ ] 快捷操作卡片可点击
- [ ] 系统信息正确显示

#### 用户管理页面
- [ ] 列表正常加载
- [ ] 搜索功能正常
- [ ] 分页正常

#### 关卡管理页面
- [ ] 显示默认 5 个关卡
- [ ] 添加关卡功能正常
- [ ] 编辑关卡功能正常
- [ ] 删除关卡（确认框）正常

#### 游戏记录页面
- [ ] 列表正常加载（可能为空）
- [ ] 分页正常

---

## 五、抖音小游戏验证

### 5.1 开发环境配置

1. 下载抖音开发者工具
2. 打开 `frontend-mp` 目录
3. 修改 `js/config.js`:

```javascript
API_BASE_URL: 'http://localhost:8080/api'
```

### 5.2 功能验证清单

#### 首页
- [ ] 标题正常显示
- [ ] 用户信息卡片显示（可能是离线玩家）
- [ ] 关卡列表显示 5 个关卡
- [ ] "开始游戏"按钮可点击
- [ ] "排行榜"按钮可点击

#### 游戏页面
- [ ] 网格正常显示
- [ ] 时间倒计时正常
- [ ] 点击方块可选中
- [ ] 相同方块可连线消除
- [ ] 分数增加正常
- [ ] 暂停功能正常
- [ ] 返回按钮正常

#### 结算页面
- [ ] 胜利/失败状态正确
- [ ] 分数显示正确
- [ ] "再玩一次"按钮正常
- [ ] "返回首页"按钮正常
- [ ] "排行榜"按钮正常

#### 排行榜页面
- [ ] 我的排名显示（如果登录）
- [ ] 排行榜列表显示
- [ ] 返回按钮正常

---

## 六、数据库验证

### 6.1 连接数据库

```bash
# 通过 Docker 进入 MySQL
docker exec -it game-mysql mysql -uroot -proot123456

# 或本地客户端连接
mysql -h127.0.0.1 -uroot -proot123456
```

### 6.2 数据验证

```sql
USE game_db;

-- 检查表结构
SHOW TABLES;
-- 预期: admins, game_levels, game_records, leaderboard, users

-- 检查管理员
SELECT * FROM admins;
-- 预期: 1 条记录，username=admin

-- 检查关卡
SELECT * FROM game_levels;
-- 预期: 5 条记录（5个关卡）

-- 检查用户（登录后才有）
SELECT * FROM users;
```

---

## 七、常见问题排查

### 7.1 服务无法启动

```bash
# 查看详细日志
docker-compose logs -f backend

# 常见原因:
# 1. MySQL 未就绪 - 等待 30 秒后重试
# 2. 端口被占用 - 修改 docker-compose.yml 中的端口
```

### 7.2 管理后台无法登录

```bash
# 检查后端是否正常
curl http://localhost:8080/api/admin/login \
  -X POST \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"password"}'

# 如果返回错误，检查:
# 1. 数据库是否有 admin 记录
# 2. 密码是否正确（BCrypt 加密，原始密码：password）
```

### 7.3 小游戏 API 请求失败

```bash
# 检查 CORS 配置
curl -I http://localhost:8080/api/game/levels

# 检查返回的 Access-Control-Allow-Origin 头
```

### 7.4 重置所有数据

```bash
# 停止并删除所有数据
docker-compose down -v

# 重新启动
docker-compose up --build -d
```

---

## 八、性能测试（可选）

### 8.1 简单压力测试

```bash
# 安装 ab 工具 (Apache Benchmark)
# macOS: brew install httpd
# Linux: apt-get install apache2-utils

# 测试关卡接口（100 请求，10 并发）
ab -n 100 -c 10 http://localhost:8080/api/game/levels

# 预期:
# Requests per second: > 100
# Time per request: < 100ms
```

---

## 九、验证完成

如果以上所有验证步骤通过，说明项目部署成功！

### 服务地址汇总

| 服务 | 地址 |
|------|------|
| 管理后台 | http://localhost:8081 |
| 后端 API | http://localhost:8080/api |
| 小程序代码 | http://localhost:8082 |
| 数据库 | localhost:3306 |

### 默认账号

| 系统 | 用户名 | 密码 |
|------|--------|------|
| 管理后台 | admin | password |
| 数据库 | root | root123456 |
