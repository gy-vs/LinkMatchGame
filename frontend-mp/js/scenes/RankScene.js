import Config from '../config';
import API from '../api/index';

const COLORS = Config.COLORS;

export default class RankScene {
  constructor(main) {
    this.main = main;
    this.renderer = main.renderer;
    this.canvas = main.canvas;
    this.rankList = [];
    this.userRank = null;
    this.loading = true;
    this.buttons = [];
  }

  async init() {
    this.loading = true;
    this.render();
    
    try {
      this.rankList = await API.getTopRank(20);
      
      if (this.main.userInfo && this.main.userInfo.id) {
        this.userRank = await API.getUserRank(this.main.userInfo.id);
      }
    } catch (e) {
      console.error('获取排行榜失败:', e);
    }
    
    this.loading = false;
    this.render();
  }

  render() {
    const { width, height } = this.canvas;
    // 顶部安全区偏移
    const safeTop = this.main.safeAreaTop || 0;
    
    this.renderer.clear();
    this.renderer.drawBackground();
    this.buttons = [];
    
    // 顶部导航栏：高度包含安全区
    const navBarHeight = 90 + safeTop;
    this.renderer.drawCard(0, 0, width, navBarHeight, { radius: 0, shadow: false });
    
    const backBtn = { x: 20, y: 30 + safeTop, width: 70, height: 36, action: 'back' };
    this.renderer.drawRoundRect(backBtn.x, backBtn.y, backBtn.width, backBtn.height, 8, '#F5F5F5');
    this.renderer.drawText('← 返回', backBtn.x + 35, backBtn.y + 18, { 
      fontSize: 14, align: 'center', baseline: 'middle', color: COLORS.TEXT_SECONDARY 
    });
    this.buttons.push(backBtn);
    
    this.renderer.drawText('🏆 排行榜', width / 2, 48 + safeTop, { 
      fontSize: 22, fontWeight: 'bold', align: 'center', color: COLORS.TEXT_PRIMARY 
    });
    
    if (this.loading) {
      this.renderer.drawText('加载中...', width / 2, height / 2, { 
        fontSize: 18, color: COLORS.TEXT_SECONDARY, align: 'center' 
      });
      return;
    }
    
    let listStartY = 110 + safeTop;
    if (this.userRank && this.main.userInfo) {
      this.renderer.drawCard(20, 110 + safeTop, width - 40, 80);
      
      this.renderer.drawAvatar(36, 126 + safeTop, 48, this.main.userInfo.nickname);
      
      this.renderer.drawText('我的排名', 96, 130 + safeTop, { 
        fontSize: 13, color: COLORS.TEXT_SECONDARY 
      });
      this.renderer.drawText(`第 ${this.userRank.rank} 名`, 96, 156 + safeTop, { 
        fontSize: 22, fontWeight: 'bold', color: COLORS.PRIMARY 
      });
      
      this.renderer.drawText(`${this.userRank.score} 分`, width - 40, 150 + safeTop, { 
        fontSize: 20, fontWeight: 'bold', color: COLORS.SECONDARY, align: 'right' 
      });
      
      listStartY = 210 + safeTop;
    }
    
    const itemHeight = 64;
    const itemGap = 8;
    
    if (this.rankList.length === 0) {
      this.renderer.drawText('暂无排行数据', width / 2, listStartY + 60, { 
        fontSize: 16, color: COLORS.TEXT_SECONDARY, align: 'center' 
      });
      return;
    }
    
    const maxItems = Math.floor((height - listStartY - 20) / (itemHeight + itemGap));
    const displayItems = this.rankList.slice(0, Math.min(maxItems, 10));
    
    displayItems.forEach((item, index) => {
      const y = listStartY + index * (itemHeight + itemGap);
      
      let bgColor = COLORS.CARD_BG;
      if (index === 0) bgColor = '#FFFBEB';
      else if (index === 1) bgColor = '#F8F9FA';
      else if (index === 2) bgColor = '#FFF5EB';
      
      this.renderer.drawCard(20, y, width - 40, itemHeight, { bgColor });
      
      let rankDisplay = `${item.rank}`;
      let rankFontSize = 18;
      let rankColor = COLORS.TEXT_SECONDARY;
      
      if (index === 0) { rankDisplay = '🥇'; rankFontSize = 26; }
      else if (index === 1) { rankDisplay = '🥈'; rankFontSize = 26; }
      else if (index === 2) { rankDisplay = '🥉'; rankFontSize = 26; }
      
      this.renderer.drawText(rankDisplay, 50, y + itemHeight / 2, { 
        fontSize: rankFontSize, fontWeight: 'bold', align: 'center', baseline: 'middle', color: rankColor 
      });
      
      const avatarColors = [COLORS.PRIMARY, COLORS.SECONDARY, COLORS.ACCENT, COLORS.WARNING];
      this.renderer.drawAvatar(78, y + 10, 44, item.nickname || '?', {
        bgColor: avatarColors[index % avatarColors.length]
      });
      
      const nickname = item.nickname || '匿名玩家';
      const displayName = nickname.length > 8 ? nickname.substring(0, 8) + '...' : nickname;
      this.renderer.drawText(displayName, 134, y + itemHeight / 2, { 
        fontSize: 16, fontWeight: '600', color: COLORS.TEXT_PRIMARY, baseline: 'middle' 
      });
      
      this.renderer.drawText(`${item.score}`, width - 40, y + itemHeight / 2, { 
        fontSize: 20, fontWeight: 'bold', color: COLORS.PRIMARY, align: 'right', baseline: 'middle' 
      });
    });
  }

  onTouchEnd(x, y) {
    for (const btn of this.buttons) {
      if (x >= btn.x && x <= btn.x + btn.width && y >= btn.y && y <= btn.y + btn.height) {
        if (btn.action === 'back') {
          this.main.showHome();
        }
        break;
      }
    }
  }
}
