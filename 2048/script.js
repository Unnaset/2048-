class Game2048 {
    constructor() {
        this.board = [];
        this.score = 0;
        this.bestScore = localStorage.getItem('bestScore') || 0;
        this.gameWon = false;
        this.gameOver = false;
        this.size = 4;
        
        this.init();
        this.setupEventListeners();
        this.updateDisplay();
    }
    
    init() {
        // 初始化游戏板
        this.board = Array(this.size).fill().map(() => Array(this.size).fill(0));
        this.score = 0;
        this.gameWon = false;
        this.gameOver = false;
        
        // 添加两个初始方块
        this.addRandomTile();
        this.addRandomTile();
        
        this.renderBoard();
    }
    
    setupEventListeners() {
        // 键盘事件
        document.addEventListener('keydown', (e) => {
            if (this.gameOver && !this.gameWon) return;
            
            let moved = false;
            switch(e.key) {
                case 'ArrowUp':
                    e.preventDefault();
                    moved = this.move('up');
                    break;
                case 'ArrowDown':
                    e.preventDefault();
                    moved = this.move('down');
                    break;
                case 'ArrowLeft':
                    e.preventDefault();
                    moved = this.move('left');
                    break;
                case 'ArrowRight':
                    e.preventDefault();
                    moved = this.move('right');
                    break;
            }
            
            if (moved) {
                this.addRandomTile();
                this.updateDisplay();
                this.checkGameState();
            }
        });
        
        // 触摸事件（移动端支持）
        let startX, startY;
        const gameBoard = document.getElementById('game-board');
        
        gameBoard.addEventListener('touchstart', (e) => {
            startX = e.touches[0].clientX;
            startY = e.touches[0].clientY;
        });
        
        gameBoard.addEventListener('touchend', (e) => {
            if (!startX || !startY) return;
            
            const endX = e.changedTouches[0].clientX;
            const endY = e.changedTouches[0].clientY;
            
            const diffX = startX - endX;
            const diffY = startY - endY;
            
            let moved = false;
            
            if (Math.abs(diffX) > Math.abs(diffY)) {
                if (diffX > 0) {
                    moved = this.move('left');
                } else {
                    moved = this.move('right');
                }
            } else {
                if (diffY > 0) {
                    moved = this.move('up');
                } else {
                    moved = this.move('down');
                }
            }
            
            if (moved) {
                this.addRandomTile();
                this.updateDisplay();
                this.checkGameState();
            }
            
            startX = startY = null;
        });
        
        // 按钮事件
        document.getElementById('new-game-btn').addEventListener('click', () => {
            this.init();
            this.updateDisplay();
        });
        
        document.getElementById('restart-btn').addEventListener('click', () => {
            document.getElementById('game-over').style.display = 'none';
            this.init();
            this.updateDisplay();
        });
        
        document.getElementById('continue-btn').addEventListener('click', () => {
            document.getElementById('win-message').style.display = 'none';
        });
    }
    
    move(direction) {
        let moved = false;
        const oldBoard = JSON.stringify(this.board);
        
        switch(direction) {
            case 'up':
                moved = this.moveUp();
                break;
            case 'down':
                moved = this.moveDown();
                break;
            case 'left':
                moved = this.moveLeft();
                break;
            case 'right':
                moved = this.moveRight();
                break;
        }
        
        if (moved) {
            this.renderBoard();
        }
        
        return moved;
    }
    
    moveLeft() {
        let moved = false;
        for (let i = 0; i < this.size; i++) {
            const row = this.board[i].filter(x => x !== 0);
            for (let j = 0; j < row.length - 1; j++) {
                if (row[j] === row[j + 1]) {
                    row[j] *= 2;
                    this.score += row[j];
                    row.splice(j + 1, 1);
                    moved = true;
                }
            }
            const newRow = row.concat(Array(this.size - row.length).fill(0));
            if (JSON.stringify(this.board[i]) !== JSON.stringify(newRow)) {
                moved = true;
            }
            this.board[i] = newRow;
        }
        return moved;
    }
    
    moveRight() {
        let moved = false;
        for (let i = 0; i < this.size; i++) {
            const row = this.board[i].filter(x => x !== 0);
            for (let j = row.length - 1; j > 0; j--) {
                if (row[j] === row[j - 1]) {
                    row[j] *= 2;
                    this.score += row[j];
                    row.splice(j - 1, 1);
                    moved = true;
                }
            }
            const newRow = Array(this.size - row.length).fill(0).concat(row);
            if (JSON.stringify(this.board[i]) !== JSON.stringify(newRow)) {
                moved = true;
            }
            this.board[i] = newRow;
        }
        return moved;
    }
    
    moveUp() {
        let moved = false;
        for (let j = 0; j < this.size; j++) {
            let column = [];
            for (let i = 0; i < this.size; i++) {
                if (this.board[i][j] !== 0) {
                    column.push(this.board[i][j]);
                }
            }
            
            for (let i = 0; i < column.length - 1; i++) {
                if (column[i] === column[i + 1]) {
                    column[i] *= 2;
                    this.score += column[i];
                    column.splice(i + 1, 1);
                    moved = true;
                }
            }
            
            const newColumn = column.concat(Array(this.size - column.length).fill(0));
            for (let i = 0; i < this.size; i++) {
                if (this.board[i][j] !== newColumn[i]) {
                    moved = true;
                }
                this.board[i][j] = newColumn[i];
            }
        }
        return moved;
    }
    
    moveDown() {
        let moved = false;
        for (let j = 0; j < this.size; j++) {
            let column = [];
            for (let i = 0; i < this.size; i++) {
                if (this.board[i][j] !== 0) {
                    column.push(this.board[i][j]);
                }
            }
            
            for (let i = column.length - 1; i > 0; i--) {
                if (column[i] === column[i - 1]) {
                    column[i] *= 2;
                    this.score += column[i];
                    column.splice(i - 1, 1);
                    moved = true;
                }
            }
            
            const newColumn = Array(this.size - column.length).fill(0).concat(column);
            for (let i = 0; i < this.size; i++) {
                if (this.board[i][j] !== newColumn[i]) {
                    moved = true;
                }
                this.board[i][j] = newColumn[i];
            }
        }
        return moved;
    }
    
    addRandomTile() {
        const emptyCells = [];
        for (let i = 0; i < this.size; i++) {
            for (let j = 0; j < this.size; j++) {
                if (this.board[i][j] === 0) {
                    emptyCells.push([i, j]);
                }
            }
        }
        
        if (emptyCells.length > 0) {
            const [i, j] = emptyCells[Math.floor(Math.random() * emptyCells.length)];
            this.board[i][j] = Math.random() < 0.9 ? 2 : 4;
        }
    }
    
    renderBoard() {
        const gameBoard = document.getElementById('game-board');
        gameBoard.innerHTML = '';
        
        for (let i = 0; i < this.size; i++) {
            for (let j = 0; j < this.size; j++) {
                const tile = document.createElement('div');
                tile.className = 'tile';
                
                if (this.board[i][j] !== 0) {
                    tile.textContent = this.board[i][j];
                    tile.classList.add(`tile-${this.board[i][j]}`);
                }
                
                gameBoard.appendChild(tile);
            }
        }
    }
    
    updateDisplay() {
        document.getElementById('score').textContent = this.score;
        document.getElementById('best-score').textContent = this.bestScore;
        
        if (this.score > this.bestScore) {
            this.bestScore = this.score;
            localStorage.setItem('bestScore', this.bestScore);
        }
    }
    
    checkGameState() {
        // 检查是否达到2048
        if (!this.gameWon) {
            for (let i = 0; i < this.size; i++) {
                for (let j = 0; j < this.size; j++) {
                    if (this.board[i][j] === 2048) {
                        this.gameWon = true;
                        document.getElementById('win-message').style.display = 'flex';
                        return;
                    }
                }
            }
        }
        
        // 检查游戏是否结束
        if (this.isGameOver()) {
            this.gameOver = true;
            document.getElementById('final-score').textContent = this.score;
            document.getElementById('game-over').style.display = 'flex';
        }
    }
    
    isGameOver() {
        // 检查是否有空格
        for (let i = 0; i < this.size; i++) {
            for (let j = 0; j < this.size; j++) {
                if (this.board[i][j] === 0) {
                    return false;
                }
            }
        }
        
        // 检查是否可以合并
        for (let i = 0; i < this.size; i++) {
            for (let j = 0; j < this.size; j++) {
                const current = this.board[i][j];
                
                // 检查右边
                if (j < this.size - 1 && this.board[i][j + 1] === current) {
                    return false;
                }
                
                // 检查下边
                if (i < this.size - 1 && this.board[i + 1][j] === current) {
                    return false;
                }
            }
        }
        
        return true;
    }
}

// 游戏启动
document.addEventListener('DOMContentLoaded', () => {
    new Game2048();
});
