const Config = {
  API_BASE_URL: 'http://localhost:8080/api',
  
  CANVAS: {
    WIDTH: 720,
    HEIGHT: 1280,
    SCALE: 1
  },
  
  COLORS: {
    PRIMARY: '#FF6B6B',
    PRIMARY_LIGHT: '#FF8E8E',
    SECONDARY: '#4ECDC4',
    ACCENT: '#45B7D1',
    SUCCESS: '#67C23A',
    WARNING: '#E6A23C',
    DANGER: '#F56C6C',
    BG_GRADIENT_START: '#667eea',
    BG_GRADIENT_END: '#764ba2',
    CARD_BG: '#FFFFFF',
    TEXT_PRIMARY: '#333333',
    TEXT_SECONDARY: '#666666',
    TEXT_LIGHT: '#999999',
    SELECTED: '#FFD93D',
    LINE: '#FF6B6B'
  },
  
  GAME: {
    GRID_SIZE: 4,
    PAIRS: 8,
    TIME_LIMIT: 120,
    TILE_SIZE: 80,
    TILE_GAP: 8,
    TILE_RADIUS: 12,
    MATCH_SCORE: 100,
    TIME_BONUS: 5,
    LINE_DURATION: 300,
    CLEAR_DURATION: 200,
    
    PATTERNS: [
      '🍎', '🍊', '🍋', '🍇', 
      '🍓', '🍒', '🥝', '🍑', 
      '🍌', '🥭', '🍍', '🥥',
      '🍉', '🥑', '🍈', '🫐'
    ],
    
    FALLBACK_PATTERNS: [
      { type: 'circle', color: '#FF6B6B' },
      { type: 'circle', color: '#4ECDC4' },
      { type: 'square', color: '#45B7D1' },
      { type: 'square', color: '#67C23A' },
      { type: 'triangle', color: '#E6A23C' },
      { type: 'triangle', color: '#F56C6C' },
      { type: 'diamond', color: '#909399' },
      { type: 'diamond', color: '#FFD93D' },
      { type: 'star', color: '#FF6B6B' },
      { type: 'star', color: '#4ECDC4' },
      { type: 'hexagon', color: '#45B7D1' },
      { type: 'hexagon', color: '#67C23A' }
    ]
  },
  
  LEVELS: {
    1: { gridSize: 3, pairs: 4, timeLimit: 60, name: '入门关' },
    2: { gridSize: 4, pairs: 6, timeLimit: 90, name: '简单关' },
    3: { gridSize: 4, pairs: 8, timeLimit: 120, name: '普通关' },
    4: { gridSize: 5, pairs: 10, timeLimit: 150, name: '困难关' },
    5: { gridSize: 6, pairs: 14, timeLimit: 180, name: '挑战关' }
  },
  
  ANIMATION: {
    BUTTON_SCALE: 0.95,
    TRANSITION: 300,
    POPUP_DURATION: 250
  },
  
  STORAGE_KEYS: {
    TOKEN: 'game_token',
    USER_INFO: 'user_info',
    USER_ID: 'user_id',
    SOUND_ENABLED: 'sound_enabled',
    MUSIC_ENABLED: 'music_enabled',
    BEST_SCORES: 'best_scores'
  },
  
  SOUND: {
    ENABLED: true,
    BGM_VOLUME: 0.5,
    SFX_VOLUME: 0.8
  }
};

export default Config;
