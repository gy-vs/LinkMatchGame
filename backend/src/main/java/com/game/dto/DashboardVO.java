package com.game.dto;

import lombok.Data;

@Data
public class DashboardVO {
    private Long totalUsers;
    private Long todayUsers;
    private Long totalRecords;
    private Long todayRecords;
    private Integer levelCount;
}
