package com.game.dto;

import lombok.Data;

@Data
public class UserInfoVO {
    private Long id;
    private String openId;
    private String nickname;
    private String avatarUrl;
    private Integer score;
    private Integer level;
}
