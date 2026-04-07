package com.game.controller;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.game.common.Result;
import com.game.dto.AdminLoginDTO;
import com.game.dto.DashboardVO;
import com.game.dto.LevelDTO;
import com.game.entity.GameLevel;
import com.game.entity.GameRecord;
import com.game.entity.User;
import com.game.service.AdminService;
import com.game.service.GameService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/admin")
public class AdminController {

    @Autowired
    private AdminService adminService;

    @Autowired
    private GameService gameService;

    @PostMapping("/login")
    public Result<Map<String, Object>> login(@Valid @RequestBody AdminLoginDTO loginDTO) {
        Map<String, Object> result = adminService.login(loginDTO);
        return Result.success(result);
    }

    @GetMapping("/dashboard")
    public Result<DashboardVO> getDashboard() {
        DashboardVO dashboard = adminService.getDashboard();
        return Result.success(dashboard);
    }

    @GetMapping("/users")
    public Result<Page<User>> getUserPage(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String keyword) {
        Page<User> userPage = adminService.getUserPage(page, size, keyword);
        return Result.success(userPage);
    }

    @GetMapping("/levels")
    public Result<Page<GameLevel>> getLevelPage(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size) {
        Page<GameLevel> levelPage = adminService.getLevelPage(page, size);
        return Result.success(levelPage);
    }

    @PostMapping("/levels")
    public Result<Void> addLevel(@Valid @RequestBody LevelDTO levelDTO) {
        adminService.addLevel(levelDTO);
        return Result.success();
    }

    @PutMapping("/levels/{id}")
    public Result<Void> updateLevel(@PathVariable Integer id, @Valid @RequestBody LevelDTO levelDTO) {
        levelDTO.setId(id);
        adminService.updateLevel(levelDTO);
        return Result.success();
    }

    @DeleteMapping("/levels/{id}")
    public Result<Void> deleteLevel(@PathVariable Integer id) {
        adminService.deleteLevel(id);
        return Result.success();
    }

    @GetMapping("/records")
    public Result<Page<GameRecord>> getRecordPage(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size) {
        Page<GameRecord> recordPage = gameService.getRecordPage(page, size);
        return Result.success(recordPage);
    }
}
