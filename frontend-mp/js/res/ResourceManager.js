import Config from '../config';

class ResourceManager {
  constructor() {
    this.images = {};
    this.audios = {};
    this.loaded = false;
    this.loadProgress = 0;
    
    this.imageList = [];
    
    this.audioList = [];
  }

  async preload(onProgress) {
    const totalCount = this.imageList.length + this.audioList.length;
    
    if (totalCount === 0) {
      this.loaded = true;
      this.loadProgress = 100;
      return;
    }
    
    let loadedCount = 0;
    
    const updateProgress = () => {
      loadedCount++;
      this.loadProgress = Math.floor((loadedCount / totalCount) * 100);
      if (onProgress) onProgress(this.loadProgress);
    };
    
    const imagePromises = this.imageList.map(item => {
      return new Promise((resolve) => {
        const img = tt.createImage();
        img.onload = () => {
          this.images[item.key] = img;
          updateProgress();
          resolve();
        };
        img.onerror = () => {
          console.warn(`图片加载失败: ${item.src}`);
          updateProgress();
          resolve();
        };
        img.src = item.src;
      });
    });
    
    const audioPromises = this.audioList.map(item => {
      return new Promise((resolve) => {
        const audio = tt.createInnerAudioContext();
        audio.src = item.src;
        audio.onCanplay(() => {
          this.audios[item.key] = audio;
          updateProgress();
          resolve();
        });
        audio.onError(() => {
          console.warn(`音频加载失败: ${item.src}`);
          updateProgress();
          resolve();
        });
      });
    });
    
    await Promise.all([...imagePromises, ...audioPromises]);
    this.loaded = true;
  }

  getImage(key) {
    return this.images[key] || null;
  }

  getAudio(key) {
    return this.audios[key] || null;
  }

  playSound(key) {
    const audio = this.audios[key];
    if (audio) {
      audio.stop();
      audio.play();
    }
  }

  playBGM() {
    const bgm = this.audios['bgm'];
    if (bgm) {
      bgm.loop = true;
      bgm.play();
    }
  }

  stopBGM() {
    const bgm = this.audios['bgm'];
    if (bgm) {
      bgm.stop();
    }
  }

  getPatterns() {
    return Config.GAME.PATTERNS;
  }

  drawPattern(ctx, pattern, x, y, size) {
    const img = this.images[pattern];
    
    if (img) {
      ctx.drawImage(img, x, y, size, size);
    } else {
      ctx.font = `${size * 0.6}px Arial`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(pattern, x + size / 2, y + size / 2);
    }
  }
}

export default new ResourceManager();
