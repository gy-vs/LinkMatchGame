package com.game.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class LevelDTO {
    private Integer id;
    
    @NotBlank(message = "关卡名称不能为空")
    private String name;
    
    @NotBlank(message = "关卡配置不能为空")
    private String config;
    
    @NotNull(message = "难度等级不能为空")
    @Min(value = 1, message = "难度等级最小为1")
    @Max(value = 5, message = "难度等级最大为5")
    private Integer difficulty;
}
