package com.game.dto;

import lombok.Data;

@Data
public class RankVO {
    private Integer rank;
    private Integer userId;
    private String nickname;
    private String avatarUrl;
    private Integer score;
}
