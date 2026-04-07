import Config from '../config';
import GameEngine from '../game/GameEngine';
import API from '../api/index';

const COLORS = Config.COLORS;
const GAME = Config.GAME;
const ANIMATION = Config.ANIMATION;

export default class GameScene {
  constructor(main) {
    this.main = main;
    this.renderer = main.renderer;
    this.canvas = main.canvas;
    this.engine = null;
    this.level = null;
    this.levelConfig = null;
    this.timeLimit = 0;
    this.timeRemaining = 0;
    this.timer = null;
    this.isPaused = false;
    this.isGameOver = false;
    this.cellSize = 0;
    this.gridOffset = { x: 0, y: 0 };
    this.cellGap = GAME.TILE_GAP;
    this.animatingPath = null;
    this.animatingCells = [];
    this.buttons = [];
  }

  init(level) {
    this.level = level;
    this.levelConfig = JSON.parse(level.config);
    const { gridSize, pairs, timeLimit } = this.levelConfig;
    
    this.engine = new GameEngine(gridSize, pairs, GAME.PATTERNS);
    this.engine.initGrid();
    
    this.timeLimit = timeLimit;
    this.timeRemaining = timeLimit;
    this.isGameOver = false;
    this.isPaused = false;
    this.animatingPath = null;
    this.animatingCells = [];
    
    this.calculateLayout();
    this.startTimer();
    this.render();
  }

  calculateLayout() {
    const { width, height } = this.canvas;
    const { gridSize } = this.levelConfig;
    const padding = 24;
    // 顶部安全区偏移（适配 iPhone 全面屏）
    this.safeAreaTop = this.main.safeAreaTop || 0;
    const topBarHeight = 130 + this.safeAreaTop;
    const bottomPadding = 80;
    
    const availableWidth = width - padding * 2;
    const availableHeight = height - topBarHeight - padding - bottomPadding;
    
    const maxCellSizeByWidth = (availableWidth - this.cellGap * (gridSize - 1)) / gridSize;
    const maxCellSizeByHeight = (availableHeight - this.cellGap * (gridSize - 1)) / gridSize;
    this.cellSize = Math.floor(Math.min(maxCellSizeByWidth, maxCellSizeByHeight, GAME.TILE_SIZE));
    
    const gridWidth = gridSize * this.cellSize + (gridSize - 1) * this.cellGap;
    const gridHeight = gridSize * this.cellSize + (gridSize - 1) * this.cellGap;
    
    this.gridOffset = {
      x: (width - gridWidth) / 2,
      y: topBarHeight + (availableHeight - gridHeight) / 2
    };
  }

  startTimer() {
    if (this.timer) clearInterval(this.timer);
    this.timer = setInterval(() => {
      if (this.isPaused || this.isGameOver) return;
      this.timeRemaining--;
      this.render();
      if (this.timeRemaining <= 0) {
        this.gameOver(false);
      }
    }, 1000);
  }

  render() {
    const { width, height } = this.canvas;
    const state = this.engine.getState();
    const safeTop = this.safeAreaTop || 0;
    
    this.renderer.clear();
    this.renderer.drawSolidBackground('#F0F4F8');
    this.buttons = [];
    
    // 顶部卡片位置随安全区偏移
    const cardY = 16 + safeTop;
    this.renderer.drawCard(16, cardY, width - 32, 100);
    
    const backBtn = { x: 28, y: cardY + 20, width: 70, height: 36, action: 'back' };
    this.renderer.drawRoundRect(backBtn.x, backBtn.y, backBtn.width, backBtn.height, 8, '#F5F5F5');
    this.renderer.drawText('← 返回', backBtn.x + 35, backBtn.y + 18, { 
      fontSize: 14, align: 'center', baseline: 'middle', color: COLORS.TEXT_SECONDARY 
    });
    this.buttons.push(backBtn);
    
    this.renderer.drawText(this.level.name, width / 2, cardY + 24, { 
      fontSize: 20, fontWeight: 'bold', align: 'center', color: COLORS.TEXT_PRIMARY 
    });
    
    this.renderer.drawText(`🏆 ${state.score}`, 28, cardY + 66, { 
      fontSize: 16, color: COLORS.PRIMARY 
    });
    this.renderer.drawText(`剩余 ${state.remainingPairs} 对`, width / 2, cardY + 66, { 
      fontSize: 16, color: COLORS.SECONDARY, align: 'center' 
    });
    
    const timeColor = this.timeRemaining <= 10 ? COLORS.DANGER : COLORS.TEXT_PRIMARY;
    const timeText = `⏱️${Math.floor(this.timeRemaining / 60)}:${String(this.timeRemaining % 60).padStart(2, '0')}`;
    this.renderer.drawText(timeText, width - 28, cardY + 66, { 
      fontSize: 16, color: timeColor, align: 'right' 
    });
    
    const progress = this.timeRemaining / this.timeLimit;
    const progressColor = this.timeRemaining <= 10 ? COLORS.DANGER : COLORS.PRIMARY;
    this.renderer.drawProgressBar(28, cardY + 88, width - 56, 6, progress, { fillColor: progressColor });
    
    const pauseBtn = { x: width - 90, y: cardY + 20, width: 56, height: 36, action: 'pause' };
    this.renderer.drawRoundRect(pauseBtn.x, pauseBtn.y, pauseBtn.width, pauseBtn.height, 8, '#F5F5F5');
    this.renderer.drawText(this.isPaused ? '▶️' : '⏸️', pauseBtn.x + 28, pauseBtn.y + 18, { 
      fontSize: 18, align: 'center', baseline: 'middle' 
    });
    this.buttons.push(pauseBtn);
    
    this.renderGrid(state);
    
    if (this.animatingPath) {
      this.renderer.drawPath(this.animatingPath, this.cellSize, this.gridOffset, this.cellGap);
    }
    
    if (this.isPaused) {
      this.renderPauseOverlay();
    }
  }

  renderGrid(state) {
    const { grid, gridSize, selected } = state;
    
    for (let row = 1; row <= gridSize; row++) {
      for (let col = 1; col <= gridSize; col++) {
        const cell = grid[row][col];
        if (!cell) continue;
        
        const x = this.gridOffset.x + (col - 1) * (this.cellSize + this.cellGap);
        const y = this.gridOffset.y + (row - 1) * (this.cellSize + this.cellGap);
        const isSelected = selected && selected.row === row && selected.col === col;
        const isAnimating = this.animatingCells.some(c => c.row === row && c.col === col);
        
        this.renderer.drawCell(x, y, this.cellSize, cell.pattern, { 
          selected: isSelected, 
          removed: cell.removed,
          scale: isAnimating ? 0 : 1
        });
      }
    }
  }

  renderPauseOverlay() {
    const { width, height } = this.canvas;
    
    this.renderer.ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
    this.renderer.ctx.fillRect(0, 0, width, height);
    
    const cardWidth = 260;
    const cardHeight = 200;
    const cardX = (width - cardWidth) / 2;
    const cardY = (height - cardHeight) / 2;
    
    this.renderer.drawCard(cardX, cardY, cardWidth, cardHeight);
    
    this.renderer.drawText('⏸️', width / 2, cardY + 40, { 
      fontSize: 40, align: 'center', baseline: 'middle' 
    });
    
    this.renderer.drawText('游戏暂停', width / 2, cardY + 90, { 
      fontSize: 24, fontWeight: 'bold', align: 'center', color: COLORS.TEXT_PRIMARY 
    });
    
    const resumeBtn = this.renderer.drawGradientButton(
      cardX + 30, cardY + 130, cardWidth - 60, 50, '继续游戏'
    );
    this.buttons.push({ ...resumeBtn, action: 'resume' });
  }

  onTouchEnd(x, y) {
    for (const btn of this.buttons) {
      if (x >= btn.x && x <= btn.x + btn.width && y >= btn.y && y <= btn.y + btn.height) {
        this.handleButtonClick(btn.action);
        return;
      }
    }
    
    if (this.isPaused || this.isGameOver) return;
    
    const { gridSize } = this.levelConfig;
    for (let row = 1; row <= gridSize; row++) {
      for (let col = 1; col <= gridSize; col++) {
        const cellX = this.gridOffset.x + (col - 1) * (this.cellSize + this.cellGap);
        const cellY = this.gridOffset.y + (row - 1) * (this.cellSize + this.cellGap);
        if (x >= cellX && x <= cellX + this.cellSize && y >= cellY && y <= cellY + this.cellSize) {
          this.handleCellClick(row, col);
          return;
        }
      }
    }
  }

  handleButtonClick(action) {
    switch (action) {
      case 'back':
        this.cleanup();
        this.main.showHome();
        break;
      case 'pause':
        this.isPaused = !this.isPaused;
        this.render();
        break;
      case 'resume':
        this.isPaused = false;
        this.render();
        break;
    }
  }

  handleCellClick(row, col) {
    const result = this.engine.selectCell(row, col);
    
    if (result.type === 'select' || result.type === 'deselect' || result.type === 'mismatch') {
      this.render();
    } else if (result.type === 'match') {
      this.animatingPath = result.path;
      this.animatingCells = [result.path[0], result.path[result.path.length - 1]];
      this.render();
      
      setTimeout(() => {
        this.animatingPath = null;
        this.animatingCells = [];
        
        if (result.isGameOver) {
          this.gameOver(true);
        } else {
          this.render();
        }
      }, ANIMATION.TRANSITION);
    }
  }

  async gameOver(isWin) {
    this.isGameOver = true;
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
    
    const state = this.engine.getState();
    const timeUsed = this.timeLimit - this.timeRemaining;
    
    let finalScore = state.score;
    if (isWin) {
      finalScore += this.timeRemaining * GAME.TIME_BONUS;
    }
    
    let rank = null;
    if (this.main.userInfo && this.main.userInfo.id) {
      try {
        const result = await API.submitGame(
          this.main.userInfo.id, 
          this.level.id, 
          finalScore, 
          timeUsed
        );
        rank = result.rank;
      } catch (e) {
        console.error('提交成绩失败:', e);
      }
    }
    
    this.main.showEnd({ 
      isWin, 
      score: finalScore, 
      baseScore: state.score,
      timeBonus: isWin ? this.timeRemaining * GAME.TIME_BONUS : 0,
      timeUsed, 
      rank, 
      level: this.level 
    });
  }

  cleanup() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }
}
