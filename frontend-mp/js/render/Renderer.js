import Config from '../config';

const COLORS = Config.COLORS;
const GAME = Config.GAME;

export default class Renderer {
  constructor(canvas, ctx) {
    this.canvas = canvas;
    this.ctx = ctx;
    this.width = canvas.width;
    this.height = canvas.height;
  }

  clear() {
    this.ctx.clearRect(0, 0, this.width, this.height);
  }

  drawBackground() {
    const gradient = this.ctx.createLinearGradient(0, 0, 0, this.height);
    gradient.addColorStop(0, COLORS.BG_GRADIENT_START);
    gradient.addColorStop(1, COLORS.BG_GRADIENT_END);
    this.ctx.fillStyle = gradient;
    this.ctx.fillRect(0, 0, this.width, this.height);
  }

  drawSolidBackground(color = '#F5F7FA') {
    this.ctx.fillStyle = color;
    this.ctx.fillRect(0, 0, this.width, this.height);
  }

  drawRoundRect(x, y, width, height, radius, fillColor, strokeColor = null) {
    this.ctx.beginPath();
    this.ctx.moveTo(x + radius, y);
    this.ctx.lineTo(x + width - radius, y);
    this.ctx.arcTo(x + width, y, x + width, y + radius, radius);
    this.ctx.lineTo(x + width, y + height - radius);
    this.ctx.arcTo(x + width, y + height, x + width - radius, y + height, radius);
    this.ctx.lineTo(x + radius, y + height);
    this.ctx.arcTo(x, y + height, x, y + height - radius, radius);
    this.ctx.lineTo(x, y + radius);
    this.ctx.arcTo(x, y, x + radius, y, radius);
    this.ctx.closePath();

    if (fillColor) {
      this.ctx.fillStyle = fillColor;
      this.ctx.fill();
    }
    if (strokeColor) {
      this.ctx.strokeStyle = strokeColor;
      this.ctx.lineWidth = 2;
      this.ctx.stroke();
    }
  }

  drawText(text, x, y, options = {}) {
    const {
      fontSize = 16,
      fontWeight = 'normal',
      color = COLORS.TEXT_PRIMARY,
      align = 'left',
      baseline = 'top'
    } = options;

    this.ctx.font = `${fontWeight} ${fontSize}px Arial`;
    this.ctx.fillStyle = color;
    this.ctx.textAlign = align;
    this.ctx.textBaseline = baseline;
    this.ctx.fillText(text, x, y);
  }

  drawButton(x, y, width, height, text, options = {}) {
    const {
      bgColor = COLORS.PRIMARY,
      textColor = '#FFFFFF',
      fontSize = 18,
      radius = 12,
      shadow = true
    } = options;

    if (shadow) {
      this.ctx.shadowColor = 'rgba(0, 0, 0, 0.2)';
      this.ctx.shadowBlur = 8;
      this.ctx.shadowOffsetX = 0;
      this.ctx.shadowOffsetY = 4;
    }

    this.drawRoundRect(x, y, width, height, radius, bgColor);
    
    this.ctx.shadowColor = 'transparent';
    this.ctx.shadowBlur = 0;
    this.ctx.shadowOffsetY = 0;

    this.drawText(text, x + width / 2, y + height / 2, {
      fontSize,
      color: textColor,
      align: 'center',
      baseline: 'middle',
      fontWeight: 'bold'
    });

    return { x, y, width, height };
  }

  drawGradientButton(x, y, width, height, text, options = {}) {
    const {
      startColor = COLORS.PRIMARY,
      endColor = COLORS.PRIMARY_LIGHT,
      textColor = '#FFFFFF',
      fontSize = 18,
      radius = 12
    } = options;

    this.ctx.shadowColor = startColor + '40';
    this.ctx.shadowBlur = 12;
    this.ctx.shadowOffsetY = 6;

    const gradient = this.ctx.createLinearGradient(x, y, x + width, y + height);
    gradient.addColorStop(0, startColor);
    gradient.addColorStop(1, endColor);

    this.drawRoundRect(x, y, width, height, radius, gradient);

    this.ctx.shadowColor = 'transparent';
    this.ctx.shadowBlur = 0;
    this.ctx.shadowOffsetY = 0;

    this.drawText(text, x + width / 2, y + height / 2, {
      fontSize,
      color: textColor,
      align: 'center',
      baseline: 'middle',
      fontWeight: 'bold'
    });

    return { x, y, width, height };
  }

  drawCard(x, y, width, height, options = {}) {
    const { bgColor = COLORS.CARD_BG, radius = 16, shadow = true } = options;
    
    if (shadow) {
      this.ctx.shadowColor = 'rgba(0, 0, 0, 0.1)';
      this.ctx.shadowBlur = 12;
      this.ctx.shadowOffsetX = 0;
      this.ctx.shadowOffsetY = 4;
    }
    
    this.drawRoundRect(x, y, width, height, radius, bgColor);
    
    this.ctx.shadowColor = 'transparent';
    this.ctx.shadowBlur = 0;
  }

  drawCell(x, y, size, pattern, options = {}) {
    const { selected = false, removed = false, scale = 1 } = options;
    if (removed) return;

    const actualSize = size * scale;
    const offset = (size - actualSize) / 2;
    const actualX = x + offset;
    const actualY = y + offset;

    let bgColor = COLORS.CARD_BG;
    let borderColor = null;
    
    if (selected) {
      bgColor = '#FFF5F5';
      borderColor = COLORS.PRIMARY;
    }

    this.ctx.shadowColor = 'rgba(0, 0, 0, 0.08)';
    this.ctx.shadowBlur = 4;
    this.ctx.shadowOffsetY = 2;

    this.drawRoundRect(actualX, actualY, actualSize, actualSize, GAME.TILE_RADIUS, bgColor, borderColor);
    
    this.ctx.shadowColor = 'transparent';
    this.ctx.shadowBlur = 0;

    if (typeof pattern === 'string') {
      this.ctx.font = `${actualSize * 0.55}px Arial`;
      this.ctx.textAlign = 'center';
      this.ctx.textBaseline = 'middle';
      this.ctx.fillText(pattern, actualX + actualSize / 2, actualY + actualSize / 2);
    } else if (typeof pattern === 'object' && pattern.type) {
      this.drawShape(actualX + actualSize / 2, actualY + actualSize / 2, actualSize * 0.35, pattern.type, pattern.color);
    }
  }

  drawShape(cx, cy, size, type, color) {
    this.ctx.fillStyle = color;
    this.ctx.beginPath();

    switch (type) {
      case 'circle':
        this.ctx.arc(cx, cy, size, 0, Math.PI * 2);
        break;
      case 'square':
        this.ctx.rect(cx - size, cy - size, size * 2, size * 2);
        break;
      case 'triangle':
        this.ctx.moveTo(cx, cy - size);
        this.ctx.lineTo(cx - size, cy + size);
        this.ctx.lineTo(cx + size, cy + size);
        break;
      case 'diamond':
        this.ctx.moveTo(cx, cy - size);
        this.ctx.lineTo(cx + size, cy);
        this.ctx.lineTo(cx, cy + size);
        this.ctx.lineTo(cx - size, cy);
        break;
      case 'star':
        this.drawStar(cx, cy, size, 5);
        break;
      case 'hexagon':
        this.drawPolygon(cx, cy, size, 6);
        break;
    }

    this.ctx.closePath();
    this.ctx.fill();
  }

  drawPolygon(cx, cy, size, sides) {
    const angle = (Math.PI * 2) / sides;
    this.ctx.moveTo(cx + size * Math.cos(-Math.PI / 2), cy + size * Math.sin(-Math.PI / 2));
    for (let i = 1; i <= sides; i++) {
      this.ctx.lineTo(
        cx + size * Math.cos(angle * i - Math.PI / 2),
        cy + size * Math.sin(angle * i - Math.PI / 2)
      );
    }
  }

  drawStar(cx, cy, size, points) {
    const innerSize = size * 0.4;
    const angle = Math.PI / points;
    
    this.ctx.moveTo(cx, cy - size);
    for (let i = 0; i < points * 2; i++) {
      const r = i % 2 === 0 ? size : innerSize;
      const a = i * angle - Math.PI / 2;
      this.ctx.lineTo(cx + r * Math.cos(a), cy + r * Math.sin(a));
    }
  }

  drawPath(path, cellSize, gridOffset, cellGap) {
    if (!path || path.length < 2) return;

    this.ctx.beginPath();
    this.ctx.strokeStyle = COLORS.LINE;
    this.ctx.lineWidth = 4;
    this.ctx.lineCap = 'round';
    this.ctx.lineJoin = 'round';
    this.ctx.setLineDash([]);

    this.ctx.shadowColor = COLORS.PRIMARY + '60';
    this.ctx.shadowBlur = 8;

    const getCellCenter = (row, col) => ({
      x: gridOffset.x + (col - 1) * (cellSize + cellGap) + cellSize / 2,
      y: gridOffset.y + (row - 1) * (cellSize + cellGap) + cellSize / 2
    });

    const start = getCellCenter(path[0].row, path[0].col);
    this.ctx.moveTo(start.x, start.y);

    for (let i = 1; i < path.length; i++) {
      const point = getCellCenter(path[i].row, path[i].col);
      this.ctx.lineTo(point.x, point.y);
    }

    this.ctx.stroke();

    this.ctx.shadowColor = 'transparent';
    this.ctx.shadowBlur = 0;
  }

  drawProgressBar(x, y, width, height, progress, options = {}) {
    const { bgColor = '#E8E8E8', fillColor = COLORS.PRIMARY, radius = 4 } = options;
    
    this.drawRoundRect(x, y, width, height, radius, bgColor);
    
    const progressWidth = Math.max(0, Math.min(1, progress)) * width;
    if (progressWidth > radius * 2) {
      const gradient = this.ctx.createLinearGradient(x, y, x + progressWidth, y);
      gradient.addColorStop(0, fillColor);
      gradient.addColorStop(1, fillColor + 'CC');
      this.drawRoundRect(x, y, progressWidth, height, radius, gradient);
    } else if (progressWidth > 0) {
      this.drawRoundRect(x, y, progressWidth, height, radius, fillColor);
    }
  }

  drawCircleProgress(cx, cy, radius, progress, options = {}) {
    const { bgColor = '#E8E8E8', fillColor = COLORS.PRIMARY, lineWidth = 8 } = options;
    
    this.ctx.beginPath();
    this.ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    this.ctx.strokeStyle = bgColor;
    this.ctx.lineWidth = lineWidth;
    this.ctx.stroke();
    
    this.ctx.beginPath();
    this.ctx.arc(cx, cy, radius, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * progress);
    this.ctx.strokeStyle = fillColor;
    this.ctx.lineCap = 'round';
    this.ctx.stroke();
  }

  drawAvatar(x, y, size, text, options = {}) {
    const { bgColor = COLORS.PRIMARY, textColor = '#FFFFFF' } = options;
    
    this.ctx.beginPath();
    this.ctx.arc(x + size / 2, y + size / 2, size / 2, 0, Math.PI * 2);
    this.ctx.fillStyle = bgColor;
    this.ctx.fill();
    
    this.ctx.font = `bold ${size * 0.45}px Arial`;
    this.ctx.fillStyle = textColor;
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';
    this.ctx.fillText(text.charAt(0).toUpperCase(), x + size / 2, y + size / 2);
  }

  drawIcon(emoji, x, y, size) {
    this.ctx.font = `${size}px Arial`;
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';
    this.ctx.fillText(emoji, x, y);
  }
}
