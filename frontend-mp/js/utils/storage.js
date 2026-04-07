const Storage = {
  setUserInfo(userInfo) {
    try {
      tt.setStorageSync('userInfo', JSON.stringify(userInfo));
    } catch (e) {
      console.error('存储用户信息失败:', e);
    }
  },

  getUserInfo() {
    try {
      const data = tt.getStorageSync('userInfo');
      return data ? JSON.parse(data) : null;
    } catch (e) {
      console.error('获取用户信息失败:', e);
      return null;
    }
  },

  clearUserInfo() {
    try {
      tt.removeStorageSync('userInfo');
    } catch (e) {
      console.error('清除用户信息失败:', e);
    }
  },

  setGameSettings(settings) {
    try {
      tt.setStorageSync('gameSettings', JSON.stringify(settings));
    } catch (e) {
      console.error('存储游戏设置失败:', e);
    }
  },

  getGameSettings() {
    try {
      const data = tt.getStorageSync('gameSettings');
      return data ? JSON.parse(data) : { soundEnabled: true };
    } catch (e) {
      return { soundEnabled: true };
    }
  }
};

export default Storage;
