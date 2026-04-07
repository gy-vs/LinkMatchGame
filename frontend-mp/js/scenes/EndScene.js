import Config from '../config';

const COLORS = Config.COLORS;

export default class EndScene {
  constructor(main) {
    this.main = main;
    this.renderer = main.renderer;
    this.canvas = main.canvas;
    this.result = null;
    this.buttons = [];
  }

  init(result) {
    this.result = result;
    this.render();
  }

  render() {
    const { width, height } = this.canvas;
    const { isWin, score, baseScore, timeBonus, timeUsed, rank, level } = this.result;
    // 顶部安全区偏移
    const safeTop = this.main.safeAreaTop || 0;
    
    this.renderer.clear();
    this.renderer.drawBackground();
    this.buttons = [];
    
    const titleY = 80 + safeTop;
    if (isWin) {
      this.renderer.drawText('🎉', width / 2, titleY, { 
        fontSize: 64, align: 'center', baseline: 'middle' 
      });
      this.renderer.drawText('恭喜过关！', width / 2, titleY + 60, { 
        fontSize: 32, fontWeight: 'bold', color: '#FFFFFF', align: 'center' 
      });
    } else {
      this.renderer.drawText('⏰', width / 2, titleY, { 
        fontSize: 64, align: 'center', baseline: 'middle' 
      });
      this.renderer.drawText('时间到！', width / 2, titleY + 60, { 
        fontSize: 32, fontWeight: 'bold', color: '#FFFFFF', align: 'center' 
      });
    }
    
    this.renderer.drawText(level.name, width / 2, titleY + 100, { 
      fontSize: 16, color: 'rgba(255,255,255,0.7)', align: 'center' 
    });
    
    const cardY = 220;
    const cardHeight = timeBonus > 0 ? 240 : 180;
    this.renderer.drawCard(32, cardY, width - 64, cardHeight);
    
    this.renderer.drawText('本局得分', width / 2, cardY + 28, { 
      fontSize: 15, color: COLORS.TEXT_SECONDARY, align: 'center' 
    });
    this.renderer.drawText(String(score), width / 2, cardY + 80, { 
      fontSize: 56, fontWeight: 'bold', color: COLORS.PRIMARY, align: 'center' 
    });
    
    if (timeBonus > 0) {
      this.renderer.drawText(`基础分: ${baseScore}`, width / 2 - 60, cardY + 130, { 
        fontSize: 14, color: COLORS.TEXT_SECONDARY, align: 'center' 
      });
      this.renderer.drawText(`时间奖励: +${timeBonus}`, width / 2 + 60, cardY + 130, { 
        fontSize: 14, color: COLORS.SUCCESS, align: 'center' 
      });
    }
    
    const minutes = Math.floor(timeUsed / 60);
    const seconds = timeUsed % 60;
    const timeStr = minutes > 0 ? `${minutes}分${seconds}秒` : `${seconds}秒`;
    this.renderer.drawText(`⏱️ 用时: ${timeStr}`, width / 2, cardY + (timeBonus > 0 ? 170 : 130), { 
      fontSize: 16, color: COLORS.TEXT_SECONDARY, align: 'center' 
    });
    
    if (rank) {
      this.renderer.drawText(`🏆 当前排名: 第${rank}名`, width / 2, cardY + (timeBonus > 0 ? 205 : 165), { 
        fontSize: 16, color: COLORS.SECONDARY, align: 'center' 
      });
    }
    
    const btnStartY = cardY + cardHeight + 32;
    const btnHeight = 52;
    const btnGap = 16;
    
    const replayBtn = this.renderer.drawGradientButton(
      40, btnStartY, width - 80, btnHeight, '🔄 再玩一次', 
      { startColor: COLORS.PRIMARY, endColor: COLORS.PRIMARY_LIGHT, fontSize: 18 }
    );
    this.buttons.push({ ...replayBtn, action: 'replay' });
    
    const homeBtn = this.renderer.drawButton(
      40, btnStartY + btnHeight + btnGap, width - 80, btnHeight, '🏠 返回首页', 
      { bgColor: COLORS.SECONDARY, fontSize: 18 }
    );
    this.buttons.push({ ...homeBtn, action: 'home' });
    
    const rankBtn = this.renderer.drawButton(
      40, btnStartY + (btnHeight + btnGap) * 2, width - 80, btnHeight, '🏅 查看排行榜', 
      { bgColor: COLORS.ACCENT, fontSize: 18 }
    );
    this.buttons.push({ ...rankBtn, action: 'rank' });
  }

  onTouchEnd(x, y) {
    for (const btn of this.buttons) {
      if (x >= btn.x && x <= btn.x + btn.width && y >= btn.y && y <= btn.y + btn.height) {
        if (btn.action === 'replay') {
          this.main.startGame(this.result.level);
        } else if (btn.action === 'home') {
          this.main.showHome();
        } else if (btn.action === 'rank') {
          this.main.showRank();
        }
        break;
      }
    }
  }
}
