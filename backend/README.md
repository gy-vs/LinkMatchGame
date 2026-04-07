# 连线消消乐 - 后端服务

## 技术栈

- Java 17
- Spring Boot 3.2.0
- MyBatis-Plus 3.5.5
- MySQL 8.0
- JWT (jjwt 0.12.5)

## 项目结构

```
backend/
├── src/main/java/com/game/
│   ├── GameApplication.java       # 启动类
│   ├── controller/                # 控制器层
│   │   ├── UserController.java    # 用户接口
│   │   ├── GameController.java    # 游戏接口
│   │   └── AdminController.java   # 管理接口
│   ├── service/                   # 业务逻辑层
│   │   ├── UserService.java
│   │   ├── GameService.java
│   │   └── AdminService.java
│   ├── mapper/                    # 数据访问层
│   ├── entity/                    # 实体类
│   ├── dto/                       # 数据传输对象
│   ├── common/                    # 通用组件
│   │   ├── Result.java            # 统一响应体
│   │   ├── ResultCode.java        # 响应码枚举
│   │   ├── BusinessException.java # 业务异常
│   │   └── GlobalExceptionHandler.java # 全局异常处理
│   ├── config/                    # 配置类
│   │   ├── CorsConfig.java        # 跨域配置
│   │   ├── WebMvcConfig.java      # MVC配置
│   │   └── MybatisPlusConfig.java # MyBatis配置
│   ├── interceptor/               # 拦截器
│   │   └── JwtInterceptor.java    # JWT拦截器
│   ├── aspect/                    # AOP切面
│   │   └── LogAspect.java         # 日志切面
│   └── utils/                     # 工具类
│       └── JwtUtil.java           # JWT工具
├── src/main/resources/
│   └── application.yml            # 配置文件
├── schema.sql                     # 数据库建表脚本
├── pom.xml                        # Maven配置
└── README.md
```

## 快速开始

### 1. 环境要求

- JDK 17+
- Maven 3.6+
- MySQL 8.0+

### 2. 数据库配置

```bash
# 创建数据库并执行建表脚本
mysql -u root -p < schema.sql
```

### 3. 修改配置

编辑 `src/main/resources/application.yml`：

```yaml
spring:
  datasource:
    url: jdbc:mysql://localhost:3306/game_db?useUnicode=true&characterEncoding=utf-8&useSSL=false&serverTimezone=Asia/Shanghai
    username: your_username
    password: your_password
```

### 4. 启动服务

```bash
# 方式一：Maven直接运行
mvn spring-boot:run

# 方式二：打包后运行
mvn clean package -DskipTests
java -jar target/game-backend-1.0.0.jar
```

服务启动后访问 `http://localhost:8080/api`

## API文档

### 统一响应格式

```json
{
  "code": 200,
  "message": "操作成功",
  "data": {}
}
```

### 响应码说明

| Code | 说明 |
|------|------|
| 200 | 成功 |
| 400 | 参数错误 |
| 401 | 未授权 |
| 500 | 系统错误 |
| 1001 | 用户不存在 |
| 1003 | 密码错误 |
| 1004 | Token无效 |
| 2001 | 关卡不存在 |

## 工程质量

- ✅ 全局异常处理 (`@RestControllerAdvice`)
- ✅ AOP日志记录 (记录所有Controller请求)
- ✅ 参数校验 (`@Valid` + JSR-303)
- ✅ JWT身份认证 (管理端接口)
- ✅ 跨域支持 (CORS配置)
- ✅ 分层架构 (Controller -> Service -> Mapper)
