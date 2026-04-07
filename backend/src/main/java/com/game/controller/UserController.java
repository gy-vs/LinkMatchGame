package com.game.controller;

import com.game.common.Result;
import com.game.dto.LoginDTO;
import com.game.dto.UserInfoVO;
import com.game.entity.GameRecord;
import com.game.service.GameService;
import com.game.service.UserService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/user")
public class UserController {

    @Autowired
    private UserService userService;
    @Autowired
    private GameService gameService;

    @PostMapping("/login")
    public Result<UserInfoVO> login(@Valid @RequestBody LoginDTO loginDTO) {
        return Result.success(userService.login(loginDTO));
    }

    @GetMapping("/info")
    public Result<UserInfoVO> getUserInfo(@RequestParam Long userId) {
        return Result.success(userService.getUserInfo(userId));
    }

    @GetMapping("/records")
    public Result<List<GameRecord>> getUserRecords(@RequestParam Long userId) {
        return Result.success(gameService.getUserRecords(userId));
    }
}
