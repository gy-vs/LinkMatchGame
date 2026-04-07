package com.game.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.game.entity.User;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

@Mapper
public interface UserMapper extends BaseMapper<User> {
    
    @Select("SELECT * FROM users WHERE open_id = #{openId}")
    User selectByOpenId(@Param("openId") String openId);
    
    @Select("SELECT COUNT(*) FROM users WHERE DATE(created_at) = CURDATE()")
    Long countTodayUsers();
}
