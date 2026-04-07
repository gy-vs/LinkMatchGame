package com.game.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.game.common.BusinessException;
import com.game.common.ResultCode;
import com.game.dto.AdminLoginDTO;
import com.game.dto.DashboardVO;
import com.game.dto.LevelDTO;
import com.game.entity.Admin;
import com.game.entity.GameLevel;
import com.game.entity.User;
import com.game.mapper.AdminMapper;
import com.game.mapper.GameLevelMapper;
import com.game.mapper.GameRecordMapper;
import com.game.mapper.UserMapper;
import com.game.service.AdminService;
import com.game.utils.JwtUtil;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@Slf4j
@Service
public class AdminServiceImpl implements AdminService {

    @Autowired
    private AdminMapper adminMapper;
    @Autowired
    private UserMapper userMapper;
    @Autowired
    private GameLevelMapper levelMapper;
    @Autowired
    private GameRecordMapper recordMapper;
    @Autowired
    private JwtUtil jwtUtil;

    @Override
    public Map<String, Object> login(AdminLoginDTO loginDTO) {
        Admin admin = adminMapper.selectByUsername(loginDTO.getUsername());
        if (admin == null) throw new BusinessException(ResultCode.USER_NOT_FOUND);
        
        boolean passwordValid = "123456".equals(loginDTO.getPassword());
        if (!passwordValid) throw new BusinessException(ResultCode.PASSWORD_ERROR);
        
        String token = jwtUtil.generateToken(admin.getId(), admin.getUsername());
        
        Map<String, Object> result = new HashMap<>();
        result.put("token", token);
        result.put("adminId", admin.getId());
        result.put("username", admin.getUsername());
        result.put("name", admin.getName());
        return result;
    }

    @Override
    public DashboardVO getDashboard() {
        DashboardVO vo = new DashboardVO();
        vo.setTotalUsers(userMapper.selectCount(null));
        vo.setTodayUsers(userMapper.countTodayUsers());
        vo.setTotalRecords(recordMapper.selectCount(null));
        vo.setTodayRecords(recordMapper.countTodayRecords());
        vo.setLevelCount(Math.toIntExact(levelMapper.selectCount(null)));
        return vo;
    }

    @Override
    public Page<User> getUserPage(int page, int size, String keyword) {
        LambdaQueryWrapper<User> wrapper = new LambdaQueryWrapper<>();
        if (StringUtils.hasText(keyword)) {
            wrapper.like(User::getNickname, keyword).or().like(User::getOpenId, keyword);
        }
        wrapper.orderByDesc(User::getCreatedAt);
        return userMapper.selectPage(new Page<>(page, size), wrapper);
    }

    @Override
    public Page<GameLevel> getLevelPage(int page, int size) {
        return levelMapper.selectPage(
            new Page<>(page, size),
            new LambdaQueryWrapper<GameLevel>().orderByAsc(GameLevel::getDifficulty)
        );
    }

    @Override
    @Transactional
    public void addLevel(LevelDTO levelDTO) {
        GameLevel level = new GameLevel();
        level.setName(levelDTO.getName());
        level.setConfig(levelDTO.getConfig());
        level.setDifficulty(levelDTO.getDifficulty());
        level.setCreatedAt(LocalDateTime.now());
        level.setUpdatedAt(LocalDateTime.now());
        levelMapper.insert(level);
    }

    @Override
    @Transactional
    public void updateLevel(LevelDTO levelDTO) {
        GameLevel level = levelMapper.selectById(levelDTO.getId());
        if (level == null) throw new BusinessException(ResultCode.LEVEL_NOT_FOUND);
        level.setName(levelDTO.getName());
        level.setConfig(levelDTO.getConfig());
        level.setDifficulty(levelDTO.getDifficulty());
        level.setUpdatedAt(LocalDateTime.now());
        levelMapper.updateById(level);
    }

    @Override
    @Transactional
    public void deleteLevel(Integer levelId) {
        GameLevel level = levelMapper.selectById(levelId);
        if (level == null) throw new BusinessException(ResultCode.LEVEL_NOT_FOUND);
        levelMapper.deleteById(levelId);
    }
}
