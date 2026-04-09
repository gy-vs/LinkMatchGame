package com.game.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.game.common.BusinessException;
import com.game.common.ResultCode;
import com.game.dto.GameSubmitDTO;
import com.game.dto.RankVO;
import com.game.entity.GameLevel;
import com.game.entity.GameRecord;
import com.game.entity.Leaderboard;
import com.game.mapper.GameLevelMapper;
import com.game.mapper.GameRecordMapper;
import com.game.mapper.LeaderboardMapper;
import com.game.service.GameService;
import com.game.service.UserService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Slf4j
@Service
public class GameServiceImpl implements GameService {

    @Autowired
    private GameLevelMapper levelMapper;

    @Autowired
    private GameRecordMapper recordMapper;

    @Autowired
    private LeaderboardMapper leaderboardMapper;

    @Autowired
    private UserService userService;

    @Override
    public List<GameLevel> getLevelList() {
        return levelMapper.selectList(
            new LambdaQueryWrapper<GameLevel>().orderByAsc(GameLevel::getDifficulty)
        );
    }

    @Override
    public GameLevel getLevelById(Long levelId) {
        GameLevel level = levelMapper.selectById(levelId);
        if (level == null) throw new BusinessException(ResultCode.LEVEL_NOT_FOUND);
        return level;
    }

    @Override
    @Transactional
    public Map<String, Object> submitGame(GameSubmitDTO submitDTO) {
        GameRecord record = new GameRecord();
        record.setUserId(submitDTO.getUserId());
        record.setLevelId(submitDTO.getLevelId());
        record.setScore(submitDTO.getScore());
        record.setTimeUsed(submitDTO.getTimeUsed());
        record.setCreatedAt(LocalDateTime.now());
        recordMapper.insert(record);
        
        userService.updateScore(submitDTO.getUserId(), submitDTO.getScore());
        Integer currentMaxScore = leaderboardMapper.selectUserMaxScore(submitDTO.getUserId());
        if (submitDTO.getScore() > currentMaxScore) {
            leaderboardMapper.delete(
                new LambdaQueryWrapper<Leaderboard>().eq(Leaderboard::getUserId, submitDTO.getUserId())
            );
            Leaderboard leaderboard = new Leaderboard();
            leaderboard.setUserId(submitDTO.getUserId());
            leaderboard.setScore(submitDTO.getScore());
            leaderboard.setUpdatedAt(LocalDateTime.now());
            leaderboardMapper.insert(leaderboard);
        }
        Integer rank = leaderboardMapper.selectUserRank(submitDTO.getUserId());
        
        Map<String, Object> result = new HashMap<>();
        result.put("recordId", record.getId());
        result.put("rank", rank);
        result.put("isNewRecord", submitDTO.getScore() > currentMaxScore);
        return result;
    }

    @Override
    public List<RankVO> getTopRank(int limit) {
        List<RankVO> rankList = leaderboardMapper.selectTopN(limit);
        int rankNum = 1;
        for (int i = 0; i < rankList.size(); i++) {
            RankVO current = rankList.get(i);
            if (i > 0) {
                RankVO prev = rankList.get(i - 1);
                if (current.getScore() < prev.getScore()) {
                    rankNum = i + 1;
                }
            }
            current.setRank(rankNum);
        }
        return rankList;
    }

    @Override
    public Map<String, Object> getUserRank(Long userId) {
        Integer rank = leaderboardMapper.selectUserRank(userId);
        Integer score = leaderboardMapper.selectUserMaxScore(userId);
        Map<String, Object> result = new HashMap<>();
        result.put("rank", rank);
        result.put("score", score);
        return result;
    }

    @Override
    public List<GameRecord> getUserRecords(Long userId) {
        return recordMapper.selectList(
            new LambdaQueryWrapper<GameRecord>()
                .eq(GameRecord::getUserId, userId)
                .orderByDesc(GameRecord::getCreatedAt)
                .last("LIMIT 20")
        );
    }

    @Override
    public Page<GameRecord> getRecordPage(int page, int size) {
        return recordMapper.selectPage(
            new Page<>(page, size),
            new LambdaQueryWrapper<GameRecord>().orderByDesc(GameRecord::getCreatedAt)
        );
    }
}
