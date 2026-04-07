package com.game.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.game.dto.LoginDTO;
import com.game.dto.UserInfoVO;
import com.game.entity.User;

public interface UserService extends IService<User> {
    
    UserInfoVO login(LoginDTO loginDTO);
    
    UserInfoVO getUserInfo(Long userId);
    
    void updateScore(Long userId, Integer score);
}
