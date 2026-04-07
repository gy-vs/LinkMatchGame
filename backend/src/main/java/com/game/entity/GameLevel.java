package com.game.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@TableName("game_levels")
public class GameLevel {
    @TableId(type = IdType.AUTO)
    private Long id;
    private String name;
    private String config;
    private Integer difficulty;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
