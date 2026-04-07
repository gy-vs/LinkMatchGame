import Config from './config';
import Renderer from './render/Renderer';
import HomeScene from './scenes/HomeScene';
import GameScene from './scenes/GameScene';
import EndScene from './scenes/EndScene';
import RankScene from './scenes/RankScene';

export default class Main {
  constructor() {
    this.systemInfo = tt.getSystemInfoSync();
    
    this.canvas = tt.createCanvas();
    this.ctx = this.canvas.getContext('2d');
    
    this.canvas.width = this.systemInfo.windowWidth;
    this.canvas.height = this.systemInfo.windowHeight;
    
    // 计算顶部安全区高度（适配 iPhone 全面屏刘海区域）
    // safeArea.top 是安全区距离屏幕顶部的距离，statusBarHeight 是状态栏高度
    const safeArea = this.systemInfo.safeArea || {};
    this.safeAreaTop = safeArea.top || this.systemInfo.statusBarHeight || 0;
    // 底部安全区（适配 iPhone 底部横条）
    this.safeAreaBottom = this.systemInfo.screenHeight - (safeArea.bottom || this.systemInfo.screenHeight);
    
    this.renderer = new Renderer(this.canvas, this.ctx);
    
    this.userInfo = null;
    
    this.currentScene = null;
    this.currentSceneName = null;
    
    this.scenes = {
      home: new HomeScene(this),
      game: new GameScene(this),
      end: new EndScene(this),
      rank: new RankScene(this)
    };
    
    this.bindEvents();
    
    this.showHome();
  }

  bindEvents() {
    tt.onTouchEnd((e) => {
      if (e.touches.length > 0) return;
      
      const touch = e.changedTouches[0];
      const x = touch.clientX;
      const y = touch.clientY;
      
      if (this.currentScene && typeof this.currentScene.onTouchEnd === 'function') {
        this.currentScene.onTouchEnd(x, y);
      }
    });
  }

  switchScene(sceneName, ...args) {
    if (this.currentScene && typeof this.currentScene.cleanup === 'function') {
      this.currentScene.cleanup();
    }
    
    this.currentSceneName = sceneName;
    this.currentScene = this.scenes[sceneName];
    
    if (this.currentScene && typeof this.currentScene.init === 'function') {
      this.currentScene.init(...args);
    }
  }

  showHome() {
    this.switchScene('home');
  }

  startGame(level) {
    this.switchScene('game', level);
  }

  showEnd(result) {
    this.switchScene('end', result);
  }

  showRank() {
    this.switchScene('rank');
  }
}
