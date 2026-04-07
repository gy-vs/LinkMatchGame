# ================================================
# 连线消消乐 - 管理后台 Dockerfile
# 多阶段构建，支持 ARM64 (Apple Silicon) 和 AMD64 (Intel)
# ================================================

# ============ 构建阶段 ============
# 使用官方 Node.js 镜像，支持多架构
FROM node:20-alpine AS builder

WORKDIR /build

# 复制 package 文件并安装依赖
COPY package*.json ./
RUN npm install --registry=https://registry.npmmirror.com

# 复制源代码并构建
COPY . .
RUN npm run build

# ============ 运行阶段 ============
# 使用官方 Nginx 镜像，支持 linux/amd64 和 linux/arm64
FROM nginx:1.25-alpine

LABEL maintainer="game-admin"
LABEL description="连线消消乐管理后台"
LABEL version="1.0.0"

# 删除默认配置
RUN rm -rf /usr/share/nginx/html/*

# 复制 nginx 配置
COPY nginx.conf /etc/nginx/conf.d/default.conf

# 从构建阶段复制构建产物
COPY --from=builder /build/dist /usr/share/nginx/html

# 暴露端口
EXPOSE 80

# 健康检查
HEALTHCHECK --interval=30s --timeout=10s --retries=3 \
    CMD wget --quiet --tries=1 --spider http://localhost/ || exit 1

# 启动 nginx
CMD ["nginx", "-g", "daemon off;"]
