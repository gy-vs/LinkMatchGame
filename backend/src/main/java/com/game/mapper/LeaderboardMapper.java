package com.game.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.game.dto.RankVO;
import com.game.entity.Leaderboard;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

import java.util.List;

@Mapper
public interface LeaderboardMapper extends BaseMapper<Leaderboard> {
    
    @Select("SELECT l.score, u.id as userId, u.nickname, u.avatar_url as avatarUrl " +
            "FROM leaderboard l " +
            "LEFT JOIN users u ON l.user_id = u.id " +
            "ORDER BY l.score DESC " +
            "LIMIT #{limit}")
    List<RankVO> selectTopN(@Param("limit") int limit);
    
    @Select("SELECT COUNT(DISTINCT score) + 1 FROM leaderboard WHERE score > " +
            "(SELECT COALESCE(MAX(score), 0) FROM leaderboard WHERE user_id = #{userId})")
    Integer selectUserRank(@Param("userId") Long userId);
    
    @Select("SELECT COALESCE(MAX(score), 0) FROM leaderboard WHERE user_id = #{userId}")
    Integer selectUserMaxScore(@Param("userId") Long userId);
}
