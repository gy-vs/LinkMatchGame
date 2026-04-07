package com.game.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.game.entity.GameRecord;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Select;

@Mapper
public interface GameRecordMapper extends BaseMapper<GameRecord> {
    
    @Select("SELECT COUNT(*) FROM game_records WHERE DATE(created_at) = CURDATE()")
    Long countTodayRecords();
}
