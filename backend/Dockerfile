# ================================================
# 连线消消乐 - 后端服务 Dockerfile
# 多阶段构建，支持 ARM64 (Apple Silicon) 和 AMD64 (Intel)
# ================================================

# ============ 构建阶段 ============
# 使用官方 Maven 镜像，基于 Eclipse Temurin JDK，支持多架构
FROM maven:3.9-eclipse-temurin-17 AS builder

WORKDIR /build

# 复制 pom.xml 并下载依赖（利用 Docker 缓存层）
COPY pom.xml .
RUN mvn dependency:go-offline -B

# 复制源代码并构建
COPY src ./src
RUN mvn clean package -DskipTests -B

# ============ 运行阶段 ============
# 使用 Eclipse Temurin JRE，官方支持 linux/amd64 和 linux/arm64
FROM eclipse-temurin:17-jre-jammy

LABEL maintainer="game-admin"
LABEL description="连线消消乐后端服务"
LABEL version="1.0.0"

WORKDIR /app

# 从构建阶段复制 jar 包
COPY --from=builder /build/target/*.jar app.jar

# 创建日志目录和非 root 用户
RUN mkdir -p /app/logs && \
    groupadd -r appgroup && \
    useradd -r -g appgroup appuser && \
    chown -R appuser:appgroup /app

# 切换到非 root 用户
USER appuser

# 暴露端口
EXPOSE 8080

# 健康检查
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
    CMD curl -f http://localhost:8080/api/game/levels || exit 1

# JVM 参数优化
ENV JAVA_OPTS="-Xms256m -Xmx512m -XX:+UseG1GC -XX:+UseContainerSupport"

# 启动命令
ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar app.jar"]
