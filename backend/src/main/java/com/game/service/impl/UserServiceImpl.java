package com.game.service.impl;

import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.game.common.BusinessException;
import com.game.common.ResultCode;
import com.game.dto.LoginDTO;
import com.game.dto.UserInfoVO;
import com.game.entity.User;
import com.game.mapper.UserMapper;
import com.game.service.UserService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.BeanUtils;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Slf4j
@Service
public class UserServiceImpl extends ServiceImpl<UserMapper, User> implements UserService {

    @Override
    @Transactional
    public UserInfoVO login(LoginDTO loginDTO) {
        User user = baseMapper.selectByOpenId(loginDTO.getOpenId());
        
        if (user == null) {
            user = new User();
            user.setOpenId(loginDTO.getOpenId());
            user.setNickname(loginDTO.getNickname());
            user.setAvatarUrl(loginDTO.getAvatarUrl());
            user.setScore(0);
            user.setLevel(1);
            user.setCreatedAt(LocalDateTime.now());
            user.setUpdatedAt(LocalDateTime.now());
            baseMapper.insert(user);
        } else {
            user.setNickname(loginDTO.getNickname());
            user.setAvatarUrl(loginDTO.getAvatarUrl());
            user.setUpdatedAt(LocalDateTime.now());
            baseMapper.updateById(user);
        }
        
        UserInfoVO vo = new UserInfoVO();
        BeanUtils.copyProperties(user, vo);
        return vo;
    }

    @Override
    public UserInfoVO getUserInfo(Long userId) {
        User user = baseMapper.selectById(userId);
        if (user == null) throw new BusinessException(ResultCode.USER_NOT_FOUND);
        UserInfoVO vo = new UserInfoVO();
        BeanUtils.copyProperties(user, vo);
        return vo;
    }

    @Override
    @Transactional
    public void updateScore(Long userId, Integer score) {
        User user = baseMapper.selectById(userId);
        if (user == null) throw new BusinessException(ResultCode.USER_NOT_FOUND);
        user.setScore(score);
        user.setLevel(user.getScore() / 500 + 1);
        user.setUpdatedAt(LocalDateTime.now());
        baseMapper.updateById(user);
    }
}
