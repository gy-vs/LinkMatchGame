package com.game.controller;

import com.game.common.Result;
import com.game.dto.GameSubmitDTO;
import com.game.dto.RankVO;
import com.game.entity.GameLevel;
import com.game.service.GameService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/game")
public class GameController {

    @Autowired
    private GameService gameService;

    @GetMapping("/levels")
    public Result<List<GameLevel>> getLevelList() {
        return Result.success(gameService.getLevelList());
    }

    @GetMapping("/level/{id}")
    public Result<GameLevel> getLevelById(@PathVariable Long id) {
        return Result.success(gameService.getLevelById(id));
    }

    @PostMapping("/submit")
    public Result<Map<String, Object>> submitGame(@Valid @RequestBody GameSubmitDTO submitDTO) {
        return Result.success(gameService.submitGame(submitDTO));
    }

    @GetMapping("/rank/top")
    public Result<List<RankVO>> getTopRank(@RequestParam(defaultValue = "10") int limit) {
        return Result.success(gameService.getTopRank(limit));
    }

    @GetMapping("/rank/user")
    public Result<Map<String, Object>> getUserRank(@RequestParam Long userId) {
        return Result.success(gameService.getUserRank(userId));
    }
}
