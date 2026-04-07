package com.game.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class GameSubmitDTO {
    @NotNull(message = "用户ID不能为空")
    private Long userId;
    
    @NotNull(message = "关卡ID不能为空")
    private Long levelId;
    
    @NotNull(message = "得分不能为空")
    @Min(value = 0, message = "得分不能为负数")
    private Integer score;
    
    @NotNull(message = "用时不能为空")
    @Min(value = 0, message = "用时不能为负数")
    private Integer timeUsed;
}
