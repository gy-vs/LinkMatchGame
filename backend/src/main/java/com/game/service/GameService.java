package com.game.service;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.game.dto.GameSubmitDTO;
import com.game.dto.RankVO;
import com.game.entity.GameLevel;
import com.game.entity.GameRecord;

import java.util.List;
import java.util.Map;

public interface GameService {
    
    List<GameLevel> getLevelList();
    
    GameLevel getLevelById(Long levelId);
    
    Map<String, Object> submitGame(GameSubmitDTO submitDTO);
    
    List<RankVO> getTopRank(int limit);
    
    Map<String, Object> getUserRank(Long userId);
    
    List<GameRecord> getUserRecords(Long userId);
    
    Page<GameRecord> getRecordPage(int page, int size);
}
