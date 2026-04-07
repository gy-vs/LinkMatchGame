package com.game.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@TableName("leaderboard")
public class Leaderboard {
    @TableId(type = IdType.AUTO)
    private Long id;
    private Long userId;
    private Integer score;
    private LocalDateTime updatedAt;
}
