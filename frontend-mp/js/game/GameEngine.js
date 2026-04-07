import Config from '../config';

export default class GameEngine {
  constructor(gridSize, pairsCount, patterns) {
    this.gridSize = gridSize;
    this.pairsCount = pairsCount;
    this.patterns = patterns;
    this.grid = [];
    this.selected = null;
    this.score = 0;
    this.remainingPairs = pairsCount;
  }

  initGrid() {
    const size = this.gridSize + 2;
    this.grid = Array(size).fill(null).map(() => Array(size).fill(null));
    
    const usedPatterns = this.patterns.slice(0, Math.min(this.pairsCount, this.patterns.length));
    
    let patternPool = [];
    for (let i = 0; i < this.pairsCount; i++) {
      const pattern = usedPatterns[i % usedPatterns.length];
      patternPool.push(pattern, pattern);
    }
    
    this.shuffleArray(patternPool);
    
    let index = 0;
    for (let row = 1; row <= this.gridSize; row++) {
      for (let col = 1; col <= this.gridSize; col++) {
        if (index < patternPool.length) {
          this.grid[row][col] = {
            pattern: patternPool[index],
            row: row,
            col: col,
            removed: false
          };
          index++;
        }
      }
    }
    
    return this.grid;
  }

  shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
  }

  selectCell(row, col) {
    const cell = this.grid[row][col];
    if (!cell || cell.removed) return { type: 'invalid' };
    
    if (!this.selected) {
      this.selected = { row, col };
      return { type: 'select', cell };
    }
    
    if (this.selected.row === row && this.selected.col === col) {
      this.selected = null;
      return { type: 'deselect', cell };
    }
    
    const firstCell = this.grid[this.selected.row][this.selected.col];
    const secondCell = cell;
    
    if (firstCell.pattern === secondCell.pattern) {
      const path = this.findPath(this.selected.row, this.selected.col, row, col);
      if (path) {
        firstCell.removed = true;
        secondCell.removed = true;
        this.remainingPairs--;
        this.score += this.calculateScore(path.length);
        this.selected = null;
        
        return {
          type: 'match',
          path: path,
          cell1: firstCell,
          cell2: secondCell,
          score: this.score,
          remaining: this.remainingPairs,
          isGameOver: this.remainingPairs === 0
        };
      }
    }
    
    const prevSelected = this.selected;
    this.selected = null;
    return { type: 'mismatch', cell1: firstCell, cell2: secondCell, prevSelected };
  }

  calculateScore(pathLength) {
    return Math.max(100 - (pathLength - 2) * 10, 10);
  }

  findPath(startRow, startCol, endRow, endCol) {
    const directions = [
      { dr: -1, dc: 0 },
      { dr: 1, dc: 0 },
      { dr: 0, dc: -1 },
      { dr: 0, dc: 1 }
    ];
    
    const queue = [];
    const visited = new Map();
    
    for (let i = 0; i < 4; i++) {
      queue.push({
        row: startRow,
        col: startCol,
        turns: 0,
        direction: i,
        path: [{ row: startRow, col: startCol }]
      });
    }
    
    while (queue.length > 0) {
      const current = queue.shift();
      const { row, col, turns, direction, path } = current;
      
      const { dr, dc } = directions[direction];
      let newRow = row + dr;
      let newCol = col + dc;
      
      while (this.isInBounds(newRow, newCol)) {
        const newPath = [...path, { row: newRow, col: newCol }];
        
        if (newRow === endRow && newCol === endCol) {
          return newPath;
        }
        
        const cell = this.grid[newRow][newCol];
        if (cell && !cell.removed && !(newRow === endRow && newCol === endCol)) {
          break;
        }
        
        if (turns < 2) {
          for (let i = 0; i < 4; i++) {
            if (i !== direction && i !== (direction + 2) % 4) {
              const key = `${newRow},${newCol},${turns + 1},${i}`;
              if (!visited.has(key)) {
                visited.set(key, true);
                queue.push({
                  row: newRow,
                  col: newCol,
                  turns: turns + 1,
                  direction: i,
                  path: newPath
                });
              }
            }
          }
        }
        
        const straightKey = `${newRow},${newCol},${turns},${direction}`;
        if (visited.has(straightKey)) break;
        visited.set(straightKey, true);
        
        newRow += dr;
        newCol += dc;
      }
    }
    
    return null;
  }

  isInBounds(row, col) {
    return row >= 0 && row < this.grid.length && col >= 0 && col < this.grid[0].length;
  }

  getState() {
    return {
      grid: this.grid,
      gridSize: this.gridSize,
      score: this.score,
      remainingPairs: this.remainingPairs,
      selected: this.selected
    };
  }
}
