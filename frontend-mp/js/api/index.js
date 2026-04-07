import Config from '../config';

class API {
  constructor() {
    this.baseUrl = Config.API_BASE_URL;
  }

  request(url, method = 'GET', data = null) {
    return new Promise((resolve, reject) => {
      tt.request({
        url: this.baseUrl + url,
        method: method,
        data: data,
        header: {
          'Content-Type': 'application/json'
        },
        success: (res) => {
          if (res.data.code === 200) {
            resolve(res.data.data);
          } else {
            reject(new Error(res.data.message || '请求失败'));
          }
        },
        fail: (err) => {
          console.error('API请求失败:', err);
          reject(err);
        }
      });
    });
  }

  login(openId, nickname, avatarUrl) {
    return this.request('/user/login', 'POST', {
      openId,
      nickname,
      avatarUrl
    });
  }

  getUserInfo(userId) {
    return this.request(`/user/info?userId=${userId}`);
  }

  getLevels() {
    return this.request('/game/levels');
  }

  getLevelById(levelId) {
    return this.request(`/game/level/${levelId}`);
  }

  submitGame(userId, levelId, score, timeUsed) {
    return this.request('/game/submit', 'POST', {
      userId,
      levelId,
      score,
      timeUsed
    });
  }

  getTopRank(limit = 10) {
    return this.request(`/game/rank/top?limit=${limit}`);
  }

  getUserRank(userId) {
    return this.request(`/game/rank/user?userId=${userId}`);
  }
}

export default new API();
