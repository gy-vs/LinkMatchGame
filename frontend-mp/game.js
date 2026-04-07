var API_BASE = 'http://localhost:8080/api';
var DEFAULT_LEVELS = [
  { id: 1, name: '第一关', grid: 3, pairs: 4, time: 60 },
  { id: 2, name: '第二关', grid: 4, pairs: 6, time: 90 },
  { id: 3, name: '第三关', grid: 4, pairs: 8, time: 120 },
  { id: 4, name: '第四关', grid: 5, pairs: 10, time: 150 },
  { id: 5, name: '第五关', grid: 6, pairs: 14, time: 180 }
];
var CONFIG = {
  LEVELS: DEFAULT_LEVELS.slice(),
  ICONS: [
    '🍎','🍊','🍋','🍇','🍓','🍒','🥝','🍑','🍌','🥭','🍍','🥥','🍉','🥑','🍈','🫐','🍏','🍐',
    '🌸','🌺','🌻','🌹','🌷','💐','🪷','🌼','🏵️','💮',
    '⭐','🌟','✨','💫','⚡','🔥','❄️','💧','🌈','☀️',
    '🎈','🎁','🎀','🎄','🎃','🎯','🎪','🎨','🎭','🎵',
    '💎','💰','👑','🏆','🎖️','🥇','🥈','🥉','🔮','💝'
  ],
  AVATARS: ['😊','😎','🤩','😍','🥳','😋','🤓','😇','🦊','🐱','🐶','🐼'],
  NAMES: ['快乐玩家','消消乐达人','连线高手','游戏大师','幸运星','闪电手','挑战王者','萌萌哒','小可爱'],
  COLORS: {
    BG1: '#1a1a2e', BG2: '#16213e', BG3: '#0f3460',
    PRIMARY: '#FF6B6B', PRIMARY2: '#FF8E8E',
    ACCENT: '#4ECDC4', ACCENT2: '#45B7D1',
    WHITE: '#FFFFFF', CARD: '#FFFFFF', TEXT: '#333333', TEXT2: '#999999',
    SELECTED: '#FFF5F5', BORDER: '#EEEEEE', SUCCESS: '#67C23A',
    GOLD: '#FFD700', SILVER: '#C0C0C0', BRONZE: '#CD7F32'
  }
};

var canvas, ctx, W, H;
var safeTop = 0;  // 顶部安全区高度（适配 iPhone 全面屏刘海）
var safeBottom = 0;  // 底部安全区高度
var scene = 'menu';
var user = null;
var currentLevel = null;
var board = [];
var selected = null;
var score = 0;
var pairs = 0;
var timeLeft = 0;
var startTime = 0;
var timer = null;
var buttons = [];
var rankList = [];
var particles = [];
var shakeOffset = { x: 0, y: 0 };
var comboCount = 0;
var lastMatchTime = 0;
var floatingTexts = [];
var menuBgAngle = 0;
var linkLine = null;
var showHelp = false;

function init() {
  try {
    canvas = tt.createCanvas();
    ctx = canvas.getContext('2d');
    var info = tt.getSystemInfoSync();
    W = canvas.width = info.windowWidth;
    H = canvas.height = info.windowHeight;
    // 计算安全区高度（适配 iPhone 全面屏）
    var sa = info.safeArea || {};
    safeTop = sa.top || info.statusBarHeight || 0;
    safeBottom = info.screenHeight - (sa.bottom || info.screenHeight);
    loadUser();
    tt.onTouchEnd(onTouch);
    render();
    fetchLevels();
    startAnimationLoop();
  } catch(e) {
    console.error('init error:', e);
  }
}

function startAnimationLoop() {
  setInterval(function() {
    menuBgAngle += 0.5;
    if (menuBgAngle >= 360) menuBgAngle = 0;
    updateParticles();
    updateFloatingTexts();
    updateShake();
    updateLinkLine();
    if (scene === 'menu' || scene === 'home' || particles.length > 0 || floatingTexts.length > 0 || linkLine) {
      render();
    }
  }, 1000/30);
}

function playSound(type) {
  try {
    var audio = tt.createInnerAudioContext();
    if (type === 'match') {
      audio.src = 'https://cdn.jsdelivr.net/gh/nickyye/assets@main/match.mp3';
    } else if (type === 'click') {
      audio.src = 'https://cdn.jsdelivr.net/gh/nickyye/assets@main/click.mp3';
    } else if (type === 'win') {
      audio.src = 'https://cdn.jsdelivr.net/gh/nickyye/assets@main/win.mp3';
    } else if (type === 'fail') {
      audio.src = 'https://cdn.jsdelivr.net/gh/nickyye/assets@main/fail.mp3';
    }
    audio.volume = 0.5;
    audio.play();
    setTimeout(function() { audio.destroy(); }, 2000);
  } catch(e) {}
}

function addParticles(x, y, color, count) {
  for (var i = 0; i < count; i++) {
    particles.push({
      x: x, y: y,
      vx: (Math.random() - 0.5) * 8,
      vy: (Math.random() - 0.5) * 8 - 3,
      color: color,
      life: 1,
      size: Math.random() * 8 + 4
    });
  }
}

function updateParticles() {
  for (var i = particles.length - 1; i >= 0; i--) {
    var p = particles[i];
    p.x += p.vx;
    p.y += p.vy;
    p.vy += 0.3;
    p.life -= 0.03;
    if (p.life <= 0) particles.splice(i, 1);
  }
}

function renderParticles() {
  for (var i = 0; i < particles.length; i++) {
    var p = particles[i];
    ctx.globalAlpha = p.life;
    ctx.fillStyle = p.color;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
}

function addFloatingText(x, y, text, color) {
  floatingTexts.push({ x: x, y: y, text: text, color: color, life: 1, vy: -2 });
}

function updateFloatingTexts() {
  for (var i = floatingTexts.length - 1; i >= 0; i--) {
    var ft = floatingTexts[i];
    ft.y += ft.vy;
    ft.life -= 0.02;
    if (ft.life <= 0) floatingTexts.splice(i, 1);
  }
}

function renderFloatingTexts() {
  for (var i = 0; i < floatingTexts.length; i++) {
    var ft = floatingTexts[i];
    ctx.globalAlpha = ft.life;
    ctx.fillStyle = ft.color;
    ctx.font = 'bold 20px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(ft.text, ft.x, ft.y);
  }
  ctx.globalAlpha = 1;
}

function addLinkLine(x1, y1, x2, y2) {
  linkLine = { x1: x1, y1: y1, x2: x2, y2: y2, life: 1 };
}

function updateLinkLine() {
  if (linkLine) {
    linkLine.life -= 0.08;
    if (linkLine.life <= 0) linkLine = null;
  }
}

function renderLinkLine() {
  if (!linkLine) return;
  ctx.globalAlpha = linkLine.life;
  ctx.strokeStyle = CONFIG.COLORS.PRIMARY;
  ctx.lineWidth = 4;
  ctx.lineCap = 'round';
  ctx.shadowColor = CONFIG.COLORS.PRIMARY;
  ctx.shadowBlur = 10;
  ctx.beginPath();
  ctx.moveTo(linkLine.x1, linkLine.y1);
  ctx.lineTo(linkLine.x2, linkLine.y2);
  ctx.stroke();
  ctx.shadowBlur = 0;
  ctx.globalAlpha = 1;
}

function triggerShake() {
  shakeOffset = { x: (Math.random() - 0.5) * 10, y: (Math.random() - 0.5) * 10 };
}

function updateShake() {
  shakeOffset.x *= 0.8;
  shakeOffset.y *= 0.8;
  if (Math.abs(shakeOffset.x) < 0.5) shakeOffset.x = 0;
  if (Math.abs(shakeOffset.y) < 0.5) shakeOffset.y = 0;
}

function parseConfig(cfg) {
  if (!cfg) return {grid:4, pairs:6, time:60};
  try {
    var c = JSON.parse(cfg);
    return {grid: c.gridSize||4, pairs: c.pairs||6, time: c.timeLimit||60};
  } catch(e) {
    return {grid:4, pairs:6, time:60};
  }
}

function fetchLevels() {
  try {
    tt.request({
      url: API_BASE + '/game/levels',
      method: 'GET',
      success: function(res) {
        try {
          if (res.data && res.data.code === 200 && res.data.data && res.data.data.length > 0) {
            CONFIG.LEVELS = res.data.data.map(function(item) {
              var cfg = parseConfig(item.config);
              return {id: item.id, name: item.name, grid: cfg.grid, pairs: cfg.pairs, time: cfg.time, difficulty: item.difficulty};
            });
            CONFIG.LEVELS.sort(function(a,b){return (a.difficulty||0)-(b.difficulty||0)});
            render();
          }
        } catch(e) {}
      },
      fail: function(e) {}
    });
  } catch(e) {}
}

function fetchRank() {
  try {
    tt.request({
      url: API_BASE + '/game/rank/top?limit=10',
      method: 'GET',
      success: function(res) {
        try {
          if (res.data && res.data.code === 200 && res.data.data) {
            rankList = res.data.data.map(function(item) {
              return {
                name: item.nickname || '玩家',
                avatar: item.avatarUrl || '😊',
                score: item.score || 0,
                rank: item.rank,
                userId: item.userId
              };
            });
            if (scene === 'rank') render();
          }
        } catch(e) {}
      },
      fail: function() { rankList = []; }
    });
  } catch(e) {}
}

function loadUser() {
  try {
    var data = tt.getStorageSync('linkUser');
    if (data) user = JSON.parse(data);
  } catch (e) {}
  if (!user) {
    user = {
      id: null,
      openId: 'test_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
      name: CONFIG.NAMES[Math.floor(Math.random() * CONFIG.NAMES.length)],
      avatar: CONFIG.AVATARS[Math.floor(Math.random() * CONFIG.AVATARS.length)],
      score: 0,
      level: 1
    };
  }
  loginToServer();
}

function loginToServer() {
  try {
    tt.request({
      url: API_BASE + '/user/login',
      method: 'POST',
      header: {'Content-Type': 'application/json'},
      data: { openId: user.openId, nickname: user.name, avatarUrl: user.avatar },
      success: function(res) {
        if (res.data && res.data.code === 200 && res.data.data) {
          user.id = res.data.data.id;
          user.score = res.data.data.score || 0;
          user.level = res.data.data.level || 1;
          saveUser();
          render();
        }
      },
      fail: function() {}
    });
  } catch(e) {}
}

function saveUser() {
  try { tt.setStorageSync('linkUser', JSON.stringify(user)); } catch (e) {}
}

function submitGameRecord(levelId, gameScore, timeUsed, isWin) {
  if (!user.id) return;
  try {
    tt.request({
      url: API_BASE + '/game/submit',
      method: 'POST',
      header: {'Content-Type': 'application/json'},
      data: { userId: user.id, levelId: levelId, score: gameScore, timeUsed: timeUsed },
      success: function(res) {
        if (res.data && res.data.code === 200) {
          user.score += gameScore;
          user.level = Math.floor(user.score / 1000) + 1;
          saveUser();
        }
      },
      fail: function() {}
    });
  } catch(e) {}
}

function onTouch(e) {
  try {
    if (e.touches && e.touches.length > 0) return;
    var touch = e.changedTouches[0];
    var x = touch.clientX, y = touch.clientY;
    for (var i = 0; i < buttons.length; i++) {
      var btn = buttons[i];
      if (x >= btn.x && x <= btn.x + btn.w && y >= btn.y && y <= btn.y + btn.h) {
        playSound('click');
        btn.action();
        return;
      }
    }
    if (scene === 'game' && currentLevel && !showHelp) handleGameClick(x, y);
    if (showHelp) { showHelp = false; render(); }
  } catch(e) {}
}

function getCellCenter(r, c) {
  var grid = currentLevel.grid;
  var topBarHeight = 130 + safeTop;
  var maxGridSize = Math.min(W - 40, H - 280 - safeTop);
  var cellSize = Math.floor((maxGridSize - (grid - 1) * 6) / grid);
  var gridW = grid * cellSize + (grid - 1) * 6;
  var gridH = gridW;
  var offsetX = (W - gridW) / 2;
  var offsetY = (H - topBarHeight - gridH) / 2 + topBarHeight;
  var cx = offsetX + c * (cellSize + 6) + cellSize / 2;
  var cy = offsetY + r * (cellSize + 6) + cellSize / 2;
  return { x: cx, y: cy };
}

function handleGameClick(x, y) {
  var grid = currentLevel.grid;
  var topBarHeight = 130 + safeTop;
  var maxGridSize = Math.min(W - 40, H - 280 - safeTop);
  var cellSize = Math.floor((maxGridSize - (grid - 1) * 6) / grid);
  var gridW = grid * cellSize + (grid - 1) * 6;
  var gridH = gridW;
  var offsetX = (W - gridW) / 2 + shakeOffset.x;
  var offsetY = (H - topBarHeight - gridH) / 2 + topBarHeight + shakeOffset.y;
  for (var r = 0; r < grid; r++) {
    for (var c = 0; c < grid; c++) {
      var cx = offsetX + c * (cellSize + 6), cy = offsetY + r * (cellSize + 6);
      if (x >= cx && x <= cx + cellSize && y >= cy && y <= cy + cellSize) {
        clickCell(r, c);
        return;
      }
    }
  }
}

function clickCell(r, c) {
  var cell = board[r][c];
  if (!cell.icon || cell.removed) return;
  playSound('click');
  if (!selected) { 
    selected = {r:r, c:c}; 
    cell.scale = 1.1;
    render(); 
    return; 
  }
  if (selected.r === r && selected.c === c) { 
    selected = null; 
    cell.scale = 1;
    render(); 
    return; 
  }
  var first = board[selected.r][selected.c];
  if (first.icon === cell.icon) {
    var now = Date.now();
    if (now - lastMatchTime < 1500) {
      comboCount++;
    } else {
      comboCount = 1;
    }
    lastMatchTime = now;
    var bonus = 100 * comboCount;
    score += bonus;
    pairs--;
    first.removed = true;
    cell.removed = true;
    first.scale = 1;
    var firstCenter = getCellCenter(selected.r, selected.c);
    var secondCenter = getCellCenter(r, c);
    addLinkLine(firstCenter.x, firstCenter.y, secondCenter.x, secondCenter.y);
    addParticles(firstCenter.x, firstCenter.y, CONFIG.COLORS.PRIMARY, 10);
    addParticles(secondCenter.x, secondCenter.y, CONFIG.COLORS.PRIMARY, 10);
    if (comboCount > 1) {
      addFloatingText(W/2, 200, 'COMBO x' + comboCount + '!', CONFIG.COLORS.GOLD);
    }
    addFloatingText(secondCenter.x, secondCenter.y - 20, '+' + bonus, CONFIG.COLORS.SUCCESS);
    playSound('match');
    triggerShake();
    selected = null;
    render();
    if (pairs === 0) setTimeout(function(){endGame(true)}, 500);
  } else {
    selected = null;
    first.scale = 1;
    render();
  }
}

function startGame(level) {
  currentLevel = level;
  score = 0;
  pairs = level.pairs;
  timeLeft = level.time;
  startTime = Date.now();
  selected = null;
  comboCount = 0;
  linkLine = null;
  scene = 'game';
  initBoard();
  if (timer) clearInterval(timer);
  timer = setInterval(function() {
    timeLeft--;
    render();
    if (timeLeft <= 0) endGame(false);
  }, 1000);
  render();
}

function initBoard() {
  var grid = currentLevel.grid;
  var totalCells = grid * grid;
  var actualPairs = Math.floor(totalCells / 2);
  var pool = [];
  for (var i = 0; i < actualPairs; i++) {
    var icon = CONFIG.ICONS[i % CONFIG.ICONS.length];
    pool.push(icon, icon);
  }
  for (var j = pool.length - 1; j > 0; j--) {
    var k = Math.floor(Math.random() * (j + 1));
    var t = pool[j]; pool[j] = pool[k]; pool[k] = t;
  }
  board = [];
  var idx = 0;
  for (var r = 0; r < grid; r++) {
    board[r] = [];
    for (var c = 0; c < grid; c++) {
      board[r][c] = {icon: pool[idx++] || null, removed: false, scale: 1};
    }
  }
}

function endGame(win) {
  if (timer) { clearInterval(timer); timer = null; }
  var timeUsed = Math.floor((Date.now() - startTime) / 1000);
  submitGameRecord(currentLevel.id, score, timeUsed, win);
  if (win) {
    playSound('win');
    for (var i = 0; i < 50; i++) {
      setTimeout(function() {
        addParticles(Math.random() * W, Math.random() * H * 0.5, 
          [CONFIG.COLORS.GOLD, CONFIG.COLORS.PRIMARY, CONFIG.COLORS.ACCENT, CONFIG.COLORS.ACCENT2][Math.floor(Math.random()*4)], 5);
      }, i * 50);
    }
  } else {
    playSound('fail');
  }
  scene = 'end';
  render();
}

function goHome() {
  if (timer) { clearInterval(timer); timer = null; }
  scene = 'home';
  render();
}

function goMenu() {
  if (timer) { clearInterval(timer); timer = null; }
  scene = 'menu';
  render();
}

function showRank() {
  scene = 'rank';
  fetchRank();
  render();
}

function showSettings() {
  scene = 'settings';
  render();
}

function toggleHelp() {
  showHelp = !showHelp;
  render();
}

function render() {
  try {
    buttons = [];
    ctx.save();
    ctx.translate(shakeOffset.x, shakeOffset.y);
    drawBackground();
    switch (scene) {
      case 'menu': renderMenu(); break;
      case 'home': renderHome(); break;
      case 'game': renderGame(); break;
      case 'end': renderEnd(); break;
      case 'rank': renderRank(); break;
      case 'settings': renderSettings(); break;
    }
    renderLinkLine();
    renderParticles();
    renderFloatingTexts();
    if (showHelp) renderHelpOverlay();
    ctx.restore();
  } catch(e) {}
}

function drawBackground() {
  var grad = ctx.createLinearGradient(0, 0, W, H);
  grad.addColorStop(0, CONFIG.COLORS.BG1);
  grad.addColorStop(0.5, CONFIG.COLORS.BG2);
  grad.addColorStop(1, CONFIG.COLORS.BG3);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, W, H);
  for (var i = 0; i < 15; i++) {
    var angle = (menuBgAngle + i * 24) * Math.PI / 180;
    var x = W/2 + Math.cos(angle) * (80 + i * 8);
    var y = H * 0.3 + Math.sin(angle) * (40 + i * 4);
    ctx.globalAlpha = 0.05;
    ctx.fillStyle = CONFIG.COLORS.PRIMARY;
    ctx.beginPath();
    ctx.arc(x, y, 4 + i * 0.4, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
}

function renderMenu() {
  ctx.fillStyle = CONFIG.COLORS.WHITE;
  ctx.font = 'bold 50px sans-serif';
  ctx.textAlign = 'center';
  ctx.shadowColor = CONFIG.COLORS.PRIMARY;
  ctx.shadowBlur = 25;
  ctx.fillText('🎮', W/2, H * 0.18 + safeTop * 0.5);
  ctx.shadowBlur = 0;
  ctx.font = 'bold 34px sans-serif';
  ctx.fillStyle = CONFIG.COLORS.WHITE;
  ctx.fillText('连线消消乐', W/2, H * 0.28 + safeTop * 0.5);
  ctx.font = '15px sans-serif';
  ctx.fillStyle = 'rgba(255,255,255,0.7)';
  ctx.fillText('找到相同图案，连线消除！', W/2, H * 0.34 + safeTop * 0.5);
  var btnY = H * 0.42 + safeTop * 0.5;
  var btnH = 56;
  var btnGap = 18;
  drawMenuButton(40, btnY, W - 80, btnH, '🚀 开始游戏', CONFIG.COLORS.PRIMARY, CONFIG.COLORS.PRIMARY2);
  buttons.push({x: 40, y: btnY, w: W - 80, h: btnH, action: goHome});
  btnY += btnH + btnGap;
  drawMenuButton(40, btnY, W - 80, btnH, '🏆 排行榜', CONFIG.COLORS.ACCENT, '#6ED5CE');
  buttons.push({x: 40, y: btnY, w: W - 80, h: btnH, action: showRank});
  btnY += btnH + btnGap;
  drawMenuButton(40, btnY, W - 80, btnH, '📖 游戏玩法', CONFIG.COLORS.ACCENT2, '#6BC5D8');
  buttons.push({x: 40, y: btnY, w: W - 80, h: btnH, action: toggleHelp});
  btnY += btnH + btnGap;
  drawMenuButton(40, btnY, W - 80, btnH, '⚙️ 设置', '#7B68EE', '#9370DB');
  buttons.push({x: 40, y: btnY, w: W - 80, h: btnH, action: showSettings});
  ctx.fillStyle = 'rgba(255,255,255,0.4)';
  ctx.font = '12px sans-serif';
  ctx.fillText('v1.0.0', W/2, H - 25);
}

function renderHelpOverlay() {
  ctx.fillStyle = 'rgba(0,0,0,0.85)';
  ctx.fillRect(0, 0, W, H);
  var cardY = H * 0.12;
  var cardH = H * 0.7;
  ctx.fillStyle = 'rgba(255,255,255,0.98)';
  ctx.shadowColor = 'rgba(0,0,0,0.3)';
  ctx.shadowBlur = 30;
  roundRect(30, cardY, W - 60, cardH, 20);
  ctx.fill();
  ctx.shadowBlur = 0;
  ctx.fillStyle = CONFIG.COLORS.PRIMARY;
  ctx.font = 'bold 24px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('📖 游戏玩法', W/2, cardY + 50);
  ctx.fillStyle = CONFIG.COLORS.TEXT;
  ctx.font = '15px sans-serif';
  ctx.textAlign = 'left';
  var lineH = 32;
  var startY = cardY + 100;
  var tips = [
    '🎯 游戏目标',
    '   在限定时间内消除所有配对图案',
    '',
    '🎮 操作方式',
    '   点击两个相同的图案即可消除',
    '   消除成功会在两者间画出连线',
    '',
    '⭐ 得分规则',
    '   基础得分：每对 100 分',
    '   连击加成：连续消除得分翻倍',
    '',
    '💡 小技巧',
    '   眼疾手快，连击得高分！'
  ];
  for (var i = 0; i < tips.length; i++) {
    var txt = tips[i];
    if (txt.indexOf('🎯') >= 0 || txt.indexOf('🎮') >= 0 || txt.indexOf('⭐') >= 0 || txt.indexOf('💡') >= 0) {
      ctx.fillStyle = CONFIG.COLORS.PRIMARY;
      ctx.font = 'bold 16px sans-serif';
    } else {
      ctx.fillStyle = CONFIG.COLORS.TEXT;
      ctx.font = '14px sans-serif';
    }
    ctx.fillText(txt, 55, startY + i * lineH);
  }
  ctx.fillStyle = CONFIG.COLORS.TEXT2;
  ctx.font = '13px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('点击任意位置关闭', W/2, cardY + cardH - 25);
}

function drawMenuButton(x, y, w, h, text, color1, color2) {
  var grad = ctx.createLinearGradient(x, y, x + w, y + h);
  grad.addColorStop(0, color1);
  grad.addColorStop(1, color2);
  ctx.fillStyle = grad;
  ctx.shadowColor = color1;
  ctx.shadowBlur = 15;
  ctx.shadowOffsetY = 4;
  roundRect(x, y, w, h, 14);
  ctx.fill();
  ctx.shadowBlur = 0;
  ctx.shadowOffsetY = 0;
  ctx.fillStyle = CONFIG.COLORS.WHITE;
  ctx.font = 'bold 18px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(text, x + w/2, y + h/2 + 7);
}

function renderSettings() {
  ctx.fillStyle = CONFIG.COLORS.WHITE;
  ctx.font = 'bold 26px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('⚙️ 设置', W/2, 55 + safeTop);
  drawCard(25, 90 + safeTop, W - 50, 250);
  ctx.fillStyle = CONFIG.COLORS.TEXT;
  ctx.font = 'bold 16px sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText('玩家信息', 45, 125 + safeTop);
  ctx.font = '45px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(user.avatar, W/2, 185 + safeTop);
  ctx.font = 'bold 18px sans-serif';
  ctx.fillStyle = CONFIG.COLORS.TEXT;
  ctx.fillText(user.name, W/2, 225 + safeTop);
  ctx.font = '14px sans-serif';
  ctx.fillStyle = CONFIG.COLORS.TEXT2;
  ctx.fillText('ID: ' + (user.id || '未登录'), W/2, 255 + safeTop);
  ctx.fillText('累计得分: ' + user.score + '  |  等级: ' + user.level + '级', W/2, 285 + safeTop);
  drawCard(25, 360 + safeTop, W - 50, 90);
  ctx.fillStyle = CONFIG.COLORS.TEXT;
  ctx.font = 'bold 16px sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText('关于游戏', 45, 395 + safeTop);
  ctx.font = '13px sans-serif';
  ctx.fillStyle = CONFIG.COLORS.TEXT2;
  ctx.fillText('连线消消乐 v1.0.0', 45, 425 + safeTop);
  var btnY = H - 75;
  drawButton(40, btnY, W - 80, 52, '← 返回主菜单');
  buttons.push({x: 40, y: btnY, w: W - 80, h: 52, action: goMenu});
}

function renderHome() {
  drawBackBtn(goMenu);
  ctx.fillStyle = CONFIG.COLORS.WHITE;
  ctx.font = 'bold 24px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('选择关卡', W/2, 55 + safeTop);
  drawCard(25, 80 + safeTop, W - 50, 65);
  ctx.font = '28px sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText(user.avatar, 42, 124 + safeTop);
  ctx.font = 'bold 16px sans-serif';
  ctx.fillStyle = CONFIG.COLORS.TEXT;
  ctx.fillText(user.name, 80, 108 + safeTop);
  ctx.font = '13px sans-serif';
  ctx.fillStyle = CONFIG.COLORS.TEXT2;
  ctx.fillText('总分: ' + user.score + '  |  ' + user.level + '级', 80, 130 + safeTop);
  var startY = 165 + safeTop;
  var cardH = 58;
  var gap = 10;
  var maxVisible = Math.min(CONFIG.LEVELS.length, Math.floor((H - startY - 80) / (cardH + gap)));
  for (var i = 0; i < maxVisible; i++) {
    var lv = CONFIG.LEVELS[i];
    var y = startY + i * (cardH + gap);
    drawCard(25, y, W - 50, cardH);
    ctx.fillStyle = CONFIG.COLORS.TEXT;
    ctx.font = 'bold 16px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(lv.name, 42, y + 24);
    ctx.fillStyle = CONFIG.COLORS.TEXT2;
    ctx.font = '12px sans-serif';
    ctx.fillText(lv.grid + '×' + lv.grid + ' 格子  |  ' + lv.time + '秒', 42, y + 45);
    ctx.textAlign = 'right';
    var stars = '';
    var starCount = Math.min(i + 1, 5);
    for (var j = 0; j < starCount; j++) stars += '⭐';
    ctx.fillText(stars, W - 42, y + 35);
    (function(level) {
      buttons.push({x: 25, y: y, w: W - 50, h: cardH, action: function(){startGame(level)}});
    })(lv);
  }
}

function renderGame() {
  var topY = 15 + safeTop;
  ctx.fillStyle = 'rgba(255,255,255,0.95)';
  roundRect(15, topY, W - 30, 110, 16);
  ctx.fill();
  ctx.fillStyle = 'rgba(200,200,200,0.6)';
  roundRect(25, topY + 10, 60, 34, 8);
  ctx.fill();
  ctx.fillStyle = CONFIG.COLORS.TEXT2;
  ctx.font = '14px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('← 返回', 55, topY + 32);
  buttons.push({x: 25, y: topY + 10, w: 60, h: 34, action: goHome});
  ctx.fillStyle = CONFIG.COLORS.TEXT;
  ctx.font = 'bold 20px sans-serif';
  ctx.fillText(currentLevel.name, W / 2, topY + 35);
  ctx.textAlign = 'left';
  ctx.fillStyle = CONFIG.COLORS.PRIMARY;
  ctx.font = 'bold 17px sans-serif';
  ctx.fillText('🏆 ' + score, 28, topY + 73);
  ctx.textAlign = 'center';
  ctx.fillStyle = CONFIG.COLORS.TEXT2;
  ctx.font = '14px sans-serif';
  ctx.fillText('剩余 ' + pairs + ' 对', W / 2, topY + 73);
  ctx.textAlign = 'right';
  var timeColor = timeLeft <= 10 ? '#FF4444' : CONFIG.COLORS.TEXT;
  ctx.fillStyle = timeColor;
  ctx.font = 'bold 17px sans-serif';
  var min = Math.floor(timeLeft / 60), sec = timeLeft % 60;
  ctx.fillText('⏱️ ' + min + ':' + (sec < 10 ? '0' : '') + sec, W - 28, topY + 73);
  var progress = timeLeft / currentLevel.time;
  ctx.fillStyle = '#E0E0E0';
  roundRect(28, topY + 87, W - 56, 8, 4);
  ctx.fill();
  var progGrad = ctx.createLinearGradient(28, 0, 28 + (W - 56) * progress, 0);
  progGrad.addColorStop(0, timeLeft <= 10 ? '#FF4444' : CONFIG.COLORS.PRIMARY);
  progGrad.addColorStop(1, timeLeft <= 10 ? '#FF6666' : CONFIG.COLORS.PRIMARY2);
  ctx.fillStyle = progGrad;
  roundRect(28, topY + 87, (W - 56) * progress, 8, 4);
  ctx.fill();
  var grid = currentLevel.grid;
  var topBarHeight = 130 + safeTop;
  var maxGridSize = Math.min(W - 40, H - 280 - safeTop);
  var cellSize = Math.floor((maxGridSize - (grid - 1) * 6) / grid);
  var gridW = grid * cellSize + (grid - 1) * 6;
  var gridH = gridW;
  var offsetX = (W - gridW) / 2;
  var offsetY = (H - topBarHeight - gridH) / 2 + topBarHeight;
  for (var r = 0; r < grid; r++) {
    for (var c = 0; c < grid; c++) {
      var cell = board[r][c];
      var x = offsetX + c * (cellSize + 6), y = offsetY + r * (cellSize + 6);
      var scale = cell.scale || 1;
      var scaledSize = cellSize * scale;
      var offset = (scaledSize - cellSize) / 2;
      if (!cell.icon) {
        ctx.fillStyle = 'rgba(255,255,255,0.3)';
        roundRect(x, y, cellSize, cellSize, 10);
        ctx.fill();
      } else if (cell.removed) {
        ctx.fillStyle = 'rgba(103,194,58,0.2)';
        roundRect(x, y, cellSize, cellSize, 10);
        ctx.fill();
        ctx.fillStyle = CONFIG.COLORS.SUCCESS;
        ctx.font = (cellSize * 0.35) + 'px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('✓', x + cellSize / 2, y + cellSize / 2);
      } else {
        var isSelected = selected && selected.r === r && selected.c === c;
        ctx.fillStyle = isSelected ? CONFIG.COLORS.SELECTED : CONFIG.COLORS.WHITE;
        ctx.shadowColor = isSelected ? CONFIG.COLORS.PRIMARY : 'rgba(0,0,0,0.15)';
        ctx.shadowBlur = isSelected ? 12 : 6;
        roundRect(x - offset, y - offset, scaledSize, scaledSize, 12);
        ctx.fill();
        ctx.shadowBlur = 0;
        ctx.strokeStyle = isSelected ? CONFIG.COLORS.PRIMARY : CONFIG.COLORS.BORDER;
        ctx.lineWidth = isSelected ? 3 : 1;
        roundRect(x - offset, y - offset, scaledSize, scaledSize, 12);
        ctx.stroke();
        ctx.font = (cellSize * 0.5 * scale) + 'px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = CONFIG.COLORS.TEXT;
        ctx.fillText(cell.icon, x + cellSize / 2, y + cellSize / 2);
      }
    }
  }
  ctx.textBaseline = 'alphabetic';
}

function renderEnd() {
  var cardW = W - 60;
  var cardH = 350;
  var cardY = (H - cardH) / 2;
  drawCard(30, cardY, cardW, cardH);
  ctx.font = '70px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(timeLeft > 0 ? '🎉' : '⏰', W / 2, cardY + 85);
  ctx.fillStyle = CONFIG.COLORS.TEXT;
  ctx.font = 'bold 28px sans-serif';
  ctx.fillText(timeLeft > 0 ? '太棒了！' : '时间到！', W / 2, cardY + 140);
  ctx.fillStyle = CONFIG.COLORS.PRIMARY;
  ctx.font = 'bold 56px sans-serif';
  ctx.fillText(score, W / 2, cardY + 215);
  ctx.fillStyle = CONFIG.COLORS.TEXT2;
  ctx.font = '16px sans-serif';
  ctx.fillText('本局得分', W / 2, cardY + 250);
  var btnY = cardY + 280;
  var btnW = (cardW - 50) / 2;
  var btnGap = 20;
  var totalBtnW = btnW * 2 + btnGap;
  var btnStartX = (W - totalBtnW) / 2;
  drawSmallButton(btnStartX, btnY, btnW, 48, '🏠 返回', '#666');
  buttons.push({x: btnStartX, y: btnY, w: btnW, h: 48, action: goHome});
  drawSmallButton(btnStartX + btnW + btnGap, btnY, btnW, 48, '🔄 再玩', CONFIG.COLORS.PRIMARY);
  buttons.push({x: btnStartX + btnW + btnGap, y: btnY, w: btnW, h: 48, action: function(){startGame(currentLevel)}});
}

function renderRank() {
  drawBackBtn(goMenu);
  ctx.fillStyle = CONFIG.COLORS.WHITE;
  ctx.font = 'bold 24px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('🏆 排行榜', W / 2, 55 + safeTop);
  var list = rankList.length > 0 ? rankList.slice() : [];
  var myInList = false;
  for (var i = 0; i < list.length; i++) {
    if (user.id && list[i].userId === user.id) {
      list[i].isMe = true;
      myInList = true;
    }
  }
  if (!myInList && user.id) {
    list.push({name: user.name, avatar: user.avatar, score: user.score, isMe: true});
    list.sort(function(a, b){return b.score - a.score});
  }
  if (list.length === 0) {
    list.push({name: user.name, avatar: user.avatar, score: user.score, isMe: true});
  }
  var myRank = -1;
  for (var i = 0; i < list.length; i++) { if (list[i].isMe) { myRank = i; break; } }
  if (myRank >= 10) {
    var temp = list.slice(0, 9);
    temp.push({name: user.name, avatar: user.avatar, score: user.score, isMe: true, rank: myRank + 1});
    list = temp;
  } else {
    list = list.slice(0, 10);
  }
  for (var i = 0; i < list.length; i++) {
    var item = list[i];
    var y = 85 + safeTop + i * 52;
    var displayRank = item.rank || (i + 1);
    if (item.isMe) {
      ctx.fillStyle = 'rgba(255,107,107,0.25)';
      roundRect(25, y, W - 50, 46, 12);
      ctx.fill();
      ctx.strokeStyle = CONFIG.COLORS.PRIMARY;
      ctx.lineWidth = 2;
      roundRect(25, y, W - 50, 46, 12);
      ctx.stroke();
    } else {
      ctx.fillStyle = 'rgba(255,255,255,0.95)';
      roundRect(25, y, W - 50, 46, 12);
      ctx.fill();
    }
    var numColors = [CONFIG.COLORS.GOLD, CONFIG.COLORS.SILVER, CONFIG.COLORS.BRONZE];
    ctx.fillStyle = displayRank <= 3 ? numColors[displayRank - 1] : (item.isMe ? CONFIG.COLORS.PRIMARY : '#E0E0E0');
    ctx.beginPath();
    ctx.arc(55, y + 23, 15, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = displayRank <= 3 || item.isMe ? '#FFF' : '#999';
    ctx.font = 'bold 13px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(displayRank, 55, y + 28);
    ctx.font = '20px sans-serif';
    ctx.fillText(item.avatar || '😊', 92, y + 30);
    ctx.textAlign = 'left';
    ctx.fillStyle = item.isMe ? CONFIG.COLORS.PRIMARY : CONFIG.COLORS.TEXT;
    ctx.font = item.isMe ? 'bold 14px sans-serif' : '14px sans-serif';
    ctx.fillText(item.isMe ? (item.name || '我') + ' (我)' : (item.name || '玩家'), 118, y + 30);
    ctx.textAlign = 'right';
    ctx.fillStyle = CONFIG.COLORS.PRIMARY;
    ctx.font = 'bold 16px sans-serif';
    ctx.fillText(item.score || 0, W - 40, y + 30);
  }
  var btnY = H - 70;
  drawButton(40, btnY, W - 80, 50, '← 返回主菜单');
  buttons.push({x: 40, y: btnY, w: W - 80, h: 50, action: goMenu});
}

function drawBackBtn(action) {
  var btnY = 18 + safeTop;
  ctx.fillStyle = 'rgba(255,255,255,0.2)';
  roundRect(20, btnY, 55, 36, 10);
  ctx.fill();
  ctx.fillStyle = CONFIG.COLORS.WHITE;
  ctx.font = '13px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('← 返回', 47, btnY + 23);
  buttons.push({x: 20, y: btnY, w: 55, h: 36, action: action});
}

function drawCard(x, y, w, h) {
  ctx.fillStyle = CONFIG.COLORS.CARD;
  ctx.shadowColor = 'rgba(0,0,0,0.2)';
  ctx.shadowBlur = 18;
  ctx.shadowOffsetY = 5;
  roundRect(x, y, w, h, 16);
  ctx.fill();
  ctx.shadowColor = 'transparent';
  ctx.shadowBlur = 0;
  ctx.shadowOffsetY = 0;
}

function drawButton(x, y, w, h, text) {
  ctx.fillStyle = 'rgba(255,255,255,0.2)';
  ctx.shadowColor = 'rgba(0,0,0,0.1)';
  ctx.shadowBlur = 8;
  roundRect(x, y, w, h, 12);
  ctx.fill();
  ctx.shadowBlur = 0;
  ctx.fillStyle = CONFIG.COLORS.WHITE;
  ctx.font = 'bold 16px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(text, x + w / 2, y + h / 2 + 6);
}

function drawSmallButton(x, y, w, h, text, color) {
  ctx.fillStyle = color;
  ctx.shadowColor = color;
  ctx.shadowBlur = 8;
  ctx.shadowOffsetY = 3;
  roundRect(x, y, w, h, 10);
  ctx.fill();
  ctx.shadowBlur = 0;
  ctx.shadowOffsetY = 0;
  ctx.fillStyle = CONFIG.COLORS.WHITE;
  ctx.font = 'bold 15px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(text, x + w / 2, y + h / 2 + 5);
}

function roundRect(x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

init();
