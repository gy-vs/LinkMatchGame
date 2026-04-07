package com.game.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class LoginDTO {
    @NotBlank(message = "openId不能为空")
    private String openId;
    
    @NotBlank(message = "昵称不能为空")
    private String nickname;
    
    private String avatarUrl;
}
