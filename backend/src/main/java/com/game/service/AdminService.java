package com.game.service;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.game.dto.AdminLoginDTO;
import com.game.dto.DashboardVO;
import com.game.dto.LevelDTO;
import com.game.entity.GameLevel;
import com.game.entity.User;

import java.util.Map;

public interface AdminService {
    
    Map<String, Object> login(AdminLoginDTO loginDTO);
    
    DashboardVO getDashboard();
    
    Page<User> getUserPage(int page, int size, String keyword);
    
    Page<GameLevel> getLevelPage(int page, int size);
    
    void addLevel(LevelDTO levelDTO);
    
    void updateLevel(LevelDTO levelDTO);
    
    void deleteLevel(Integer levelId);
}
