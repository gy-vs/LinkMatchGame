-- 连线消消乐游戏数据库初始化脚本
CREATE DATABASE IF NOT EXISTS game_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE game_db;

-- 用户表
CREATE TABLE IF NOT EXISTS users (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    open_id VARCHAR(100) UNIQUE NOT NULL COMMENT '抖音openId',
    nickname VARCHAR(50) NOT NULL COMMENT '昵称',
    avatar_url VARCHAR(500) DEFAULT '' COMMENT '头像URL',
    score INT DEFAULT 0 COMMENT '总分数',
    level INT DEFAULT 1 COMMENT '当前等级',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) DEFAULT CHARSET=utf8mb4;

-- 游戏关卡表
CREATE TABLE IF NOT EXISTS game_levels (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(50) NOT NULL COMMENT '关卡名称',
    config JSON NOT NULL COMMENT '关卡配置(网格大小、配对数、时限等)',
    difficulty INT DEFAULT 1 COMMENT '难度等级',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) DEFAULT CHARSET=utf8mb4;

-- 游戏记录表
CREATE TABLE IF NOT EXISTS game_records (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL COMMENT '用户ID',
    level_id BIGINT NOT NULL COMMENT '关卡ID',
    score INT NOT NULL COMMENT '本局得分',
    time_used INT NOT NULL COMMENT '用时(秒)',
    is_completed TINYINT(1) DEFAULT 0 COMMENT '是否完成',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_user_id (user_id),
    INDEX idx_level_id (level_id)
) DEFAULT CHARSET=utf8mb4;

-- 排行榜表
CREATE TABLE IF NOT EXISTS leaderboard (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT UNIQUE NOT NULL COMMENT '用户ID',
    score INT NOT NULL COMMENT '最高分',
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_score (score DESC)
) DEFAULT CHARSET=utf8mb4;

-- 管理员表
CREATE TABLE IF NOT EXISTS admins (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) UNIQUE NOT NULL COMMENT '用户名',
    password VARCHAR(100) NOT NULL COMMENT '密码',
    name VARCHAR(50) NOT NULL COMMENT '显示名称',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
) DEFAULT CHARSET=utf8mb4;

-- 插入默认管理员 (密码: password)
INSERT INTO admins (username, password, name) VALUES 
('admin', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iKbGMmj8AenKdXE2TKUQzXsJ9bFe', '超级管理员')
ON DUPLICATE KEY UPDATE name=VALUES(name);

-- 插入默认关卡
INSERT INTO game_levels (name, config, difficulty) VALUES
('第一关', '{"gridSize": 3, "pairs": 4, "timeLimit": 60}', 1),
('第二关', '{"gridSize": 4, "pairs": 6, "timeLimit": 90}', 2),
('第三关', '{"gridSize": 5, "pairs": 8, "timeLimit": 120}', 3),
('第四关', '{"gridSize": 6, "pairs": 10, "timeLimit": 150}', 4),
('第五关', '{"gridSize": 7, "pairs": 12, "timeLimit": 180}', 5)
ON DUPLICATE KEY UPDATE name=VALUES(name);

-- 插入假用户数据用于排行榜
INSERT INTO users (open_id, nickname, avatar_url, score, level) VALUES
('douyin_test_001', '游戏大神', '', 9850, 15),
('douyin_test_002', '连线高手', '', 8720, 12),
('douyin_test_003', '消除王者', '', 7650, 10),
('douyin_test_004', '快乐玩家', '', 6580, 8),
('douyin_test_005', '闪电手指', '', 5420, 6),
('douyin_test_006', '休闲大师', '', 4980, 5),
('douyin_test_007', '挑战者', '', 4350, 4),
('douyin_test_008', '幸运星', '', 3890, 3),
('douyin_test_009', '萌萌哒', '', 3210, 3),
('douyin_test_010', '小可爱', '', 2580, 2),
('douyin_test_011', '新手玩家', '', 1500, 1),
('douyin_test_012', '路人甲', '', 980, 1),
('douyin_test_013', '围观群众', '', 650, 1),
('douyin_test_014', '匿名用户', '', 320, 1),
('douyin_test_015', '测试账号', '', 100, 1)
ON DUPLICATE KEY UPDATE nickname=VALUES(nickname);

-- 插入排行榜数据
INSERT INTO leaderboard (user_id, score) VALUES
(1, 9850), (2, 8720), (3, 7650), (4, 6580), (5, 5420),
(6, 4980), (7, 4350), (8, 3890), (9, 3210), (10, 2580),
(11, 1500), (12, 980), (13, 650), (14, 320), (15, 100)
ON DUPLICATE KEY UPDATE score=VALUES(score);
