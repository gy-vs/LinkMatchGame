import Config from '../config';
import API from '../api/index';
import Storage from '../utils/storage';

const COLORS = Config.COLORS;

export default class HomeScene {
  constructor(main) {
    this.main = main;
    this.renderer = main.renderer;
    this.canvas = main.canvas;
    this.userInfo = null;
    this.levels = [];
    this.buttons = [];
    this.loading = true;
  }

  async init() {
    this.loading = true;
    this.render();
    
    try {
      await this.loadUserInfo();
      await this.loadLevels();
    } catch (e) {
      console.error('初始化失败:', e);
    }
    
    this.loading = false;
    this.render();
  }

  async loadUserInfo() {
    let userInfo = Storage.getUserInfo();
    
    if (!userInfo) {
      try {
        const loginRes = await new Promise((resolve, reject) => {
          tt.login({ success: resolve, fail: reject });
        });
        
        const openId = loginRes.code || 'test_user_' + Date.now();
        let nickname = '游客' + Math.floor(Math.random() * 10000);
        let avatarUrl = '';
        
        try {
          const profileRes = await new Promise((resolve, reject) => {
            tt.getUserInfo({ success: resolve, fail: reject });
          });
          nickname = profileRes.userInfo?.nickName || nickname;
          avatarUrl = profileRes.userInfo?.avatarUrl || '';
        } catch (e) {
          console.warn('获取用户资料失败，使用默认值');
        }
        
        userInfo = await API.login(openId, nickname, avatarUrl);
        Storage.setUserInfo(userInfo);
      } catch (e) {
        userInfo = { id: 0, nickname: '离线玩家', score: 0, level: 1 };
      }
    }
    
    this.userInfo = userInfo;
    this.main.userInfo = userInfo;
  }

  async loadLevels() {
    try {
      this.levels = await API.getLevels();
    } catch (e) {
      this.levels = Object.entries(Config.GAME.LEVELS).map(([id, config]) => ({
        id: parseInt(id),
        name: config.name,
        config: JSON.stringify(config),
        difficulty: parseInt(id)
      }));
    }
  }

  render() {
    const { width, height } = this.canvas;
    // 顶部安全区偏移
    const safeTop = this.main.safeAreaTop || 0;
    
    this.renderer.clear();
    this.renderer.drawBackground();
    this.buttons = [];
    
    this.renderer.drawText('🎮', width / 2, 60 + safeTop, {
      fontSize: 48, align: 'center', baseline: 'middle'
    });
    this.renderer.drawText('连线消消乐', width / 2, 120 + safeTop, {
      fontSize: 32, fontWeight: 'bold', color: '#FFFFFF', align: 'center'
    });
    this.renderer.drawText('Match & Connect', width / 2, 155 + safeTop, {
      fontSize: 14, color: 'rgba(255,255,255,0.7)', align: 'center'
    });
    
    if (this.userInfo) {
      this.renderer.drawCard(24, 190 + safeTop, width - 48, 90);
      
      this.renderer.drawAvatar(40, 205 + safeTop, 60, this.userInfo.nickname, {
        bgColor: COLORS.PRIMARY
      });
      
      this.renderer.drawText(this.userInfo.nickname, 116, 218 + safeTop, { 
        fontSize: 18, fontWeight: 'bold', color: COLORS.TEXT_PRIMARY 
      });
      this.renderer.drawText(`🏆 最高分: ${this.userInfo.score || 0}`, 116, 248 + safeTop, { 
        fontSize: 14, color: COLORS.TEXT_SECONDARY 
      });
      
      this.renderer.drawRoundRect(width - 90, 220 + safeTop, 50, 28, 14, COLORS.SECONDARY);
      this.renderer.drawText(`Lv.${this.userInfo.level || 1}`, width - 65, 234 + safeTop, { 
        fontSize: 14, fontWeight: 'bold', color: '#FFFFFF', align: 'center', baseline: 'middle' 
      });
    }
    
    if (this.loading) {
      this.renderer.drawText('加载中...', width / 2, height / 2, { 
        fontSize: 18, color: 'rgba(255,255,255,0.8)', align: 'center' 
      });
      return;
    }
    
    const startBtn = this.renderer.drawGradientButton(
      40, 310 + safeTop, width - 80, 60, '🎯 开始游戏', 
      { startColor: COLORS.PRIMARY, endColor: COLORS.PRIMARY_LIGHT, fontSize: 22 }
    );
    this.buttons.push({ ...startBtn, action: 'start' });
    
    this.renderer.drawText('选择关卡', 32, 400 + safeTop, { 
      fontSize: 16, fontWeight: 'bold', color: '#FFFFFF' 
    });
    
    const levelStartY = 430 + safeTop;
    const levelCardHeight = 68;
    const levelGap = 12;
    
    this.levels.slice(0, 5).forEach((level, index) => {
      const y = levelStartY + index * (levelCardHeight + levelGap);
      const config = JSON.parse(level.config);
      
      this.renderer.drawCard(24, y, width - 48, levelCardHeight);
      
      this.renderer.drawText(level.name, 44, y + 18, { 
        fontSize: 17, fontWeight: 'bold', color: COLORS.TEXT_PRIMARY 
      });
      
      this.renderer.drawText(`${config.gridSize}×${config.gridSize} 网格  |  ${config.timeLimit}秒`, 44, y + 44, { 
        fontSize: 13, color: COLORS.TEXT_SECONDARY 
      });
      
      const stars = '⭐'.repeat(level.difficulty || 1);
      this.renderer.drawText(stars, width - 44, y + levelCardHeight / 2, { 
        fontSize: 14, align: 'right', baseline: 'middle' 
      });
      
      this.buttons.push({ 
        x: 24, y, width: width - 48, height: levelCardHeight, 
        action: 'selectLevel', level 
      });
    });
    
    // 底部安全区偏移（适配 iPhone 底部横条）
    const safeBottom = this.main.safeAreaBottom || 0;
    const rankBtnY = height - 90 - safeBottom;
    const rankBtn = this.renderer.drawButton(
      40, rankBtnY, width - 80, 54, '🏅 排行榜', 
      { bgColor: COLORS.SECONDARY, fontSize: 18 }
    );
    this.buttons.push({ ...rankBtn, action: 'rank' });
  }

  onTouchEnd(x, y) {
    for (const btn of this.buttons) {
      if (x >= btn.x && x <= btn.x + btn.width && y >= btn.y && y <= btn.y + btn.height) {
        if (btn.action === 'start' && this.levels.length > 0) {
          this.main.startGame(this.levels[0]);
        } else if (btn.action === 'selectLevel') {
          this.main.startGame(btn.level);
        } else if (btn.action === 'rank') {
          this.main.showRank();
        }
        break;
      }
    }
  }
}
