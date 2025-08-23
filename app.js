        // إدارة التنقل بين الصفحات
        class GameManager {
            constructor() {
                this.currentGame = 'home';
                this.darkMode = localStorage.getItem('darkMode') === 'true';
                this.init();
                // مراجع دوال منع التمرير
                this.boundKeyPrevent = (e) => this.preventGlobalScrollKeys(e);
                this.boundWheelPrevent = (e) => this.preventWheel(e);
                this.boundTouchMovePrevent = (e) => this.preventTouchMove(e);
            }

            init() {
                // إعداد الوضع الليلي
                this.initTheme();
                
                // إعداد أزرار التنقل
                document.querySelectorAll('.play-btn').forEach(btn => {
                    btn.addEventListener('click', (e) => {
                        const gameCard = e.target.closest('.game-card');
                        const gameName = gameCard.dataset.game;
                        this.showGame(gameName);
                    });
                });

                document.getElementById('homeBtn').addEventListener('click', () => {
                    this.showGame('home');
                });

                // زر تبديل الوضع الليلي
                document.getElementById('themeToggle').addEventListener('click', () => {
                    this.toggleTheme();
                });

                // تهيئة الألعاب
                this.initGames();
            }

            initTheme() {
                if (this.darkMode) {
                    document.documentElement.setAttribute('data-theme', 'dark');
                    document.getElementById('themeToggle').innerHTML = '☀️ الوضع النهاري';
                } else {
                    document.documentElement.removeAttribute('data-theme');
                    document.getElementById('themeToggle').innerHTML = '🌙 الوضع الليلي';
                }
            }

            toggleTheme() {
                this.darkMode = !this.darkMode;
                localStorage.setItem('darkMode', this.darkMode);
                this.initTheme();
                
                // إضافة تأثير انتقال سلس
                document.body.style.transition = 'all 0.3s ease';
                setTimeout(() => {
                    document.body.style.transition = '';
                }, 300);
            }

            showGame(gameName) {
                // إخفاء جميع الأقسام
                document.querySelectorAll('.section').forEach(section => {
                    section.classList.remove('active');
                });

                // إظهار القسم المطلوب
                document.getElementById(gameName).classList.add('active');

                // إظهار/إخفاء زر الرئيسية
                const homeBtn = document.getElementById('homeBtn');
                if (gameName === 'home') {
                    homeBtn.classList.add('hidden');
                } else {
                    homeBtn.classList.remove('hidden');
                }

                this.currentGame = gameName;

                // تهيئة اللعبة عند فتحها
                if (gameName !== 'home') {
                    this.resetGame(gameName);
                    this.lockScrollToGame(gameName);
                } else {
                    this.unlockScroll();
                }
            }

            initGames() {
                window.spaceInvaders = new SpaceInvaders();
                window.hangman = new HangmanGame();
                window.mathGame = new MathGame();
                window.flappyBird = new FlappyBird();
                window.game2048 = new Game2048();
                window.slidingPuzzle = new SlidingPuzzle();
                window.ticTacToe = new TicTacToe();
                window.snakeGame = new SnakeGame();
                window.memoryGame = new MemoryGame();
            }

            resetGame(gameName) {
                switch (gameName) {
                    case 'space':
                        window.spaceInvaders.reset();
                        break;
                    case 'hangman':
                        window.hangman.reset();
                        break;
                    case 'math':
                        window.mathGame.reset();
                        break;
                    case 'flappy':
                        window.flappyBird.reset();
                        break;
                    case 'game2048':
                        window.game2048.reset();
                        break;
                    case 'puzzle':
                        window.slidingPuzzle.shuffle();
                        break;
                    case 'tictactoe':
                        window.ticTacToe.reset();
                        break;
                    case 'snake':
                        window.snakeGame.reset();
                        break;
                    case 'memory':
                        window.memoryGame.reset();
                        break;
                }
            }

            // قفل تمرير الصفحة وتمركز اللعبة
            lockScrollToGame(gameName) {
                document.body.classList.add('game-locked');
                window.addEventListener('keydown', this.boundKeyPrevent, { passive: false });
                window.addEventListener('wheel', this.boundWheelPrevent, { passive: false });
                window.addEventListener('touchmove', this.boundTouchMovePrevent, { passive: false });

                const section = document.getElementById(gameName);
                if (section) {
                    section.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
            }

            // فك القفل
            unlockScroll() {
                document.body.classList.remove('game-locked');
                window.removeEventListener('keydown', this.boundKeyPrevent);
                window.removeEventListener('wheel', this.boundWheelPrevent);
                window.removeEventListener('touchmove', this.boundTouchMovePrevent);
            }

            preventGlobalScrollKeys(e) {
                const keys = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' ', 'PageUp', 'PageDown', 'Home', 'End'];
                if (keys.includes(e.key)) {
                    e.preventDefault();
                }
            }

            preventWheel(e) { e.preventDefault(); }
            preventTouchMove(e) { e.preventDefault(); }
        }

        // لعبة الكلمات المشنوقة
        class HangmanGame {
            constructor() {
                this.words = [
                    'برمجة', 'حاسوب', 'انترنت', 'تطبيق', 'موقع', 'العاب', 'تحدي', 'ذكاء',
                    'تعلم', 'مدرسة', 'كتاب', 'قلم', 'ورقة', 'صورة', 'فيديو', 'صوت'
                ];
                this.currentWord = '';
                this.guessedWord = '';
                this.wrongGuesses = 0;
                this.maxWrongGuesses = 6;
                this.score = 0;
                this.guessedLetters = new Set();
                
                this.hangmanStages = [
                    '',
                    '  |\n  |\n  |\n  |',
                    '  +---+\n  |   |\n  |\n  |\n  |',
                    '  +---+\n  |   |\n  |   O\n  |\n  |',
                    '  +---+\n  |   |\n  |   O\n  |   |\n  |',
                    '  +---+\n  |   |\n  |   O\n  |  /|\n  |',
                    '  +---+\n  |   |\n  |   O\n  |  /|\\\n  |',
                    '  +---+\n  |   |\n  |   O\n  |  /|\\\n  |  / \\\n  |'
                ];
                
                this.init();
            }

            init() {
                this.createAlphabet();
                document.getElementById('hangmanReset').addEventListener('click', () => this.newWord());
                this.newWord();
            }

            createAlphabet() {
                const arabicLetters = 'أبتثجحخدذرزسشصضطظعغفقكلمنهويى';
                const grid = document.getElementById('alphabetGrid');
                grid.innerHTML = '';
                
                for (let letter of arabicLetters) {
                    const btn = document.createElement('button');
                    btn.className = 'letter-btn';
                    btn.textContent = letter;
                    btn.addEventListener('click', () => this.guessLetter(letter, btn));
                    grid.appendChild(btn);
                }
            }

            newWord() {
                this.currentWord = this.words[Math.floor(Math.random() * this.words.length)];
                this.guessedWord = '_'.repeat(this.currentWord.length);
                this.wrongGuesses = 0;
                this.guessedLetters.clear();
                this.updateDisplay();
                this.enableAllLetters();
                document.getElementById('hangmanResult').textContent = '';
                document.getElementById('hangmanLives').textContent = this.maxWrongGuesses;
            }

            guessLetter(letter, btn) {
                if (this.guessedLetters.has(letter)) return;
                
                this.guessedLetters.add(letter);
                btn.disabled = true;
                
                if (this.currentWord.includes(letter)) {
                    // صحيح
                    let newGuessedWord = '';
                    for (let i = 0; i < this.currentWord.length; i++) {
                        if (this.currentWord[i] === letter) {
                            newGuessedWord += letter;
                        } else {
                            newGuessedWord += this.guessedWord[i];
                        }
                    }
                    this.guessedWord = newGuessedWord;
                    
                    if (this.guessedWord === this.currentWord) {
                        this.win();
                    }
                } else {
                    // خطأ
                    this.wrongGuesses++;
                    document.getElementById('hangmanLives').textContent = this.maxWrongGuesses - this.wrongGuesses;
                    
                    if (this.wrongGuesses >= this.maxWrongGuesses) {
                        this.lose();
                    }
                }
                
                this.updateDisplay();
            }

            updateDisplay() {
                document.getElementById('wordDisplay').textContent = this.guessedWord.split('').join(' ');
                document.getElementById('hangmanDrawing').textContent = this.hangmanStages[this.wrongGuesses];
            }

            win() {
                this.score += (this.maxWrongGuesses - this.wrongGuesses + 1) * 10;
                document.getElementById('hangmanScore').textContent = this.score;
                document.getElementById('hangmanResult').innerHTML = '<div class="game-result win">🎉 رائع! الكلمة هي: ' + this.currentWord + '</div>';
                this.disableAllLetters();
                setTimeout(() => this.newWord(), 2000);
            }

            lose() {
                document.getElementById('hangmanResult').innerHTML = '<div class="game-result lose">💔 للأسف! الكلمة كانت: ' + this.currentWord + '</div>';
                this.disableAllLetters();
                setTimeout(() => this.newWord(), 3000);
            }

            enableAllLetters() {
                document.querySelectorAll('.letter-btn').forEach(btn => {
                    btn.disabled = false;
                });
            }

            disableAllLetters() {
                document.querySelectorAll('.letter-btn').forEach(btn => {
                    btn.disabled = true;
                });
            }

            reset() {
                this.score = 0;
                document.getElementById('hangmanScore').textContent = this.score;
                this.newWord();
            }
        }

        // لعبة الرياضيات
        class MathGame {
            constructor() {
                this.score = 0;
                this.streak = 0;
                this.timeLeft = 30;
                this.gameRunning = false;
                this.timer = null;
                this.currentProblem = null;
                this.correctAnswer = 0;
                
                this.init();
            }

            init() {
                document.getElementById('mathStart').addEventListener('click', () => this.start());
                document.getElementById('mathPause').addEventListener('click', () => this.pause());
                this.generateProblem();
            }

            start() {
                if (!this.gameRunning) {
                    this.gameRunning = true;
                    this.timeLeft = 30;
                    this.timer = setInterval(() => this.updateTimer(), 1000);
                    this.generateProblem();
                }
            }

            pause() {
                this.gameRunning = false;
                if (this.timer) {
                    clearInterval(this.timer);
                }
            }

            updateTimer() {
                this.timeLeft--;
                document.getElementById('mathTime').textContent = this.timeLeft;
                
                if (this.timeLeft <= 0) {
                    this.endGame();
                }
            }

            generateProblem() {
                const operations = ['+', '-', '×', '÷'];
                const operation = operations[Math.floor(Math.random() * operations.length)];
                
                let num1, num2;
                
                switch (operation) {
                    case '+':
                        num1 = Math.floor(Math.random() * 50) + 1;
                        num2 = Math.floor(Math.random() * 50) + 1;
                        this.correctAnswer = num1 + num2;
                        break;
                    case '-':
                        num1 = Math.floor(Math.random() * 50) + 20;
                        num2 = Math.floor(Math.random() * num1);
                        this.correctAnswer = num1 - num2;
                        break;
                    case '×':
                        num1 = Math.floor(Math.random() * 12) + 1;
                        num2 = Math.floor(Math.random() * 12) + 1;
                        this.correctAnswer = num1 * num2;
                        break;
                    case '÷':
                        this.correctAnswer = Math.floor(Math.random() * 12) + 1;
                        num2 = Math.floor(Math.random() * 10) + 1;
                        num1 = this.correctAnswer * num2;
                        break;
                }

                document.getElementById('mathProblem').textContent = `${num1} ${operation} ${num2} = ?`;
                this.createOptions();
            }

            createOptions() {
                const options = [this.correctAnswer];
                
                // إضافة خيارات خاطئة
                while (options.length < 4) {
                    const wrongAnswer = this.correctAnswer + Math.floor(Math.random() * 20) - 10;
                    if (wrongAnswer > 0 && !options.includes(wrongAnswer)) {
                        options.push(wrongAnswer);
                    }
                }
                
                // خلط الخيارات
                options.sort(() => Math.random() - 0.5);
                
                const optionsContainer = document.getElementById('mathOptions');
                optionsContainer.innerHTML = '';
                
                options.forEach(option => {
                    const btn = document.createElement('button');
                    btn.className = 'math-option';
                    btn.textContent = option;
                    btn.addEventListener('click', () => this.checkAnswer(option, btn));
                    optionsContainer.appendChild(btn);
                });
            }

            checkAnswer(answer, btn) {
                if (!this.gameRunning) return;
                
                if (answer === this.correctAnswer) {
                    btn.classList.add('correct');
                    this.score += (this.streak + 1) * 10;
                    this.streak++;
                    
                    // إضافة نقاط إضافية
                    const popup = document.createElement('div');
                    popup.className = 'score-popup';
                    popup.textContent = '+' + ((this.streak) * 10);
                    popup.style.left = btn.offsetLeft + 'px';
                    popup.style.top = btn.offsetTop + 'px';
                    btn.parentElement.appendChild(popup);
                    setTimeout(() => popup.remove(), 1000);
                    
                    setTimeout(() => this.generateProblem(), 1000);
                } else {
                    btn.classList.add('wrong');
                    this.streak = 0;
                    
                    // إظهار الإجابة الصحيحة
                    document.querySelectorAll('.math-option').forEach(option => {
                        if (parseInt(option.textContent) === this.correctAnswer) {
                            option.classList.add('correct');
                        }
                        option.disabled = true;
                    });
                    
                    setTimeout(() => this.generateProblem(), 2000);
                }
                
                document.getElementById('mathScore').textContent = this.score;
                document.getElementById('mathStreak').textContent = this.streak;
            }

            endGame() {
                this.gameRunning = false;
                clearInterval(this.timer);
                document.getElementById('mathResult').innerHTML = 
                    `<div class="game-result win">🎊 انتهت اللعبة! النقاط النهائية: ${this.score}</div>`;
                
                setTimeout(() => this.reset(), 3000);
            }

            reset() {
                this.score = 0;
                this.streak = 0;
                this.timeLeft = 30;
                document.getElementById('mathScore').textContent = this.score;
                document.getElementById('mathStreak').textContent = this.streak;
                document.getElementById('mathTime').textContent = this.timeLeft;
                document.getElementById('mathResult').innerHTML = '';
                this.generateProblem();
            }
        }

        // لعبة الفضاء المحسنة
        class SpaceInvaders {
            constructor() {
                this.canvas = document.getElementById('spaceCanvas');
                this.ctx = this.canvas.getContext('2d');
                
                // تحسين حجم Canvas
                this.canvas.width = 800;
                this.canvas.height = 600;
                this.canvas.style.maxWidth = '100%';
                this.canvas.style.height = 'auto';
                
                this.score = 0;
                this.lives = 3;
                this.level = 1;
                this.gameRunning = false;
                this.animationId = null;
        
                        this.player = {
                    x: this.canvas.width / 2 - 25,
                    y: this.canvas.height - 60,
                    width: 50,
                    height: 30,
                    speed: 6,
                    vx: 0 // سرعة أفقية
                };
        
        this.bullets = [];
        this.enemies = [];
        this.enemyBullets = [];
        this.particles = [];
        this.keys = {};
        
        this.init();
    }

    init() {
        document.getElementById('spaceStart').addEventListener('click', () => this.start());
        document.getElementById('spacePause').addEventListener('click', () => this.pause());
        
        document.addEventListener('keydown', (e) => this.keys[e.key] = true);
        document.addEventListener('keyup', (e) => this.keys[e.key] = false);
        
        this.createEnemies();
        this.draw();
    }

    start() {
        if (!this.gameRunning) {
            this.gameRunning = true;
            this.gameLoop();
        }
    }

    pause() {
        this.gameRunning = false;
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
    }

    createEnemies() {
        this.enemies = [];
        const cols = 8 + this.level;
        const rows = 3 + Math.floor(this.level / 2);
        
        for (let row = 0; row < rows; row++) {
            for (let col = 0; col < cols; col++) {
                this.enemies.push({
                    x: col * 60 + 50,
                    y: row * 50 + 50,
                    width: 40,
                    height: 30,
                    alive: true,
                    type: row % 3
                });
            }
        }
    }

    update() {
        if (!this.gameRunning) return;

                        // حركة اللاعب المحسنة مع تسارع
                const acceleration = 0.8;
                const maxSpeed = this.player.speed;
                
                if ((this.keys['ArrowLeft'] || this.keys['a'] || this.keys['A']) && this.player.x > 0) {
                    this.player.vx = Math.max(this.player.vx - acceleration, -maxSpeed);
                } else if ((this.keys['ArrowRight'] || this.keys['d'] || this.keys['D']) && this.player.x < this.canvas.width - this.player.width) {
                    this.player.vx = Math.min(this.player.vx + acceleration, maxSpeed);
                } else {
                    this.player.vx *= 0.9; // احتكاك
                }
                
                this.player.x += this.player.vx;
                
                // منع الخروج من الحدود
                this.player.x = Math.max(0, Math.min(this.canvas.width - this.player.width, this.player.x));
                
                // إطلاق النار المحسن
                if (this.keys[' '] || this.keys['ArrowUp'] || this.keys['w'] || this.keys['W']) {
                    this.shoot();
                    this.keys[' '] = false;
                }

        // تحديث الرصاصات
        this.bullets = this.bullets.filter(bullet => {
            bullet.y -= 8;
            return bullet.y > 0;
        });

        this.enemyBullets = this.enemyBullets.filter(bullet => {
            bullet.y += 4 + this.level * 0.5;
            return bullet.y < this.canvas.height;
        });

        // تحديث الجسيمات
        this.particles = this.particles.filter(particle => {
            particle.x += particle.vx;
            particle.y += particle.vy;
            particle.life--;
            return particle.life > 0;
        });

        this.checkCollisions();
        this.updateEnemies();
    }

    shoot() {
        if (this.bullets.length < 3) { // حد أقصى 3 رصاصات
            this.bullets.push({
                x: this.player.x + this.player.width / 2 - 2,
                y: this.player.y,
                width: 4,
                height: 10
            });
        }
    }

                updateEnemies() {
                // حركة تموج للأعداء
                const time = Date.now() * 0.002;
                this.enemies.forEach((enemy, index) => {
                    if (enemy.alive) {
                        enemy.y += Math.sin(time + index * 0.5) * 0.5;
                    }
                });

                // إطلاق نار عشوائي من الأعداء
                if (Math.random() < 0.02 + this.level * 0.005) {
                    const aliveEnemies = this.enemies.filter(enemy => enemy.alive);
                    if (aliveEnemies.length > 0) {
                        const enemy = aliveEnemies[Math.floor(Math.random() * aliveEnemies.length)];
                        this.enemyBullets.push({
                            x: enemy.x + enemy.width / 2 - 2,
                            y: enemy.y + enemy.height,
                            width: 4,
                            height: 10
                        });
                    }
                }
            }

    checkCollisions() {
        // تصادم رصاصات اللاعب مع الأعداء
        this.bullets.forEach((bullet, bulletIndex) => {
            this.enemies.forEach((enemy, enemyIndex) => {
                if (enemy.alive && 
                    bullet.x < enemy.x + enemy.width &&
                    bullet.x + bullet.width > enemy.x &&
                    bullet.y < enemy.y + enemy.height &&
                    bullet.y + bullet.height > enemy.y) {
                    
                    this.enemies[enemyIndex].alive = false;
                    this.bullets.splice(bulletIndex, 1);
                    
                    const points = (enemy.type + 1) * 10;
                    this.score += points;
                    document.getElementById('spaceScore').textContent = this.score;
                    
                    // إضافة تأثيرات بصرية
                                            this.createExplosion(enemy.x + enemy.width/2, enemy.y + enemy.height/2, 'enemy');
                }
            });
        });

        // تصادم رصاصات الأعداء مع اللاعب
        this.enemyBullets.forEach((bullet, bulletIndex) => {
            if (bullet.x < this.player.x + this.player.width &&
                bullet.x + bullet.width > this.player.x &&
                bullet.y < this.player.y + this.player.height &&
                bullet.y + bullet.height > this.player.y) {
                
                this.enemyBullets.splice(bulletIndex, 1);
                this.lives--;
                document.getElementById('spaceLives').textContent = this.lives;
                
                                        this.createExplosion(this.player.x + this.player.width/2, this.player.y + this.player.height/2, 'player');
                
                if (this.lives <= 0) {
                    this.gameOver();
                }
            }
        });

        // فحص الفوز
        if (this.enemies.every(enemy => !enemy.alive)) {
            this.nextLevel();
        }
    }

                createExplosion(x, y, type = 'enemy') {
                const particleCount = type === 'player' ? 20 : 15;
                const colors = type === 'player' ? 
                    ['#ff0000', '#ff4400', '#ff8800', '#ffaa00'] : 
                    ['#ffff00', '#ffaa00', '#ff8800', '#ff4400'];
                
                for (let i = 0; i < particleCount; i++) {
                    const angle = (Math.PI * 2 * i) / particleCount;
                    const speed = Math.random() * 5 + 3;
                    this.particles.push({
                        x: x,
                        y: y,
                        vx: Math.cos(angle) * speed,
                        vy: Math.sin(angle) * speed,
                        life: 40 + Math.random() * 20,
                        maxLife: 60,
                        color: colors[Math.floor(Math.random() * colors.length)],
                        size: Math.random() * 4 + 2
                    });
                }
                
                // شرارات إضافية
                for (let i = 0; i < 8; i++) {
                    this.particles.push({
                        x: x,
                        y: y,
                        vx: (Math.random() - 0.5) * 12,
                        vy: (Math.random() - 0.5) * 12,
                        life: 20,
                        maxLife: 20,
                        color: '#ffffff',
                        size: 1
                    });
                }
            }

    nextLevel() {
        this.level++;
        document.getElementById('spaceLevel').textContent = this.level;
        this.gameRunning = false;
        
        setTimeout(() => {
            this.createEnemies();
            this.bullets = [];
            this.enemyBullets = [];
            alert(`مستوى جديد! المستوى ${this.level}`);
            this.gameRunning = true;
        }, 1000);
    }

    gameOver() {
        this.gameRunning = false;
        alert(`انتهت اللعبة! النقاط النهائية: ${this.score} - المستوى: ${this.level}`);
        this.reset();
    }

                reset() {
                this.score = 0;
                this.lives = 3;
                this.level = 1;
                this.bullets = [];
                this.enemyBullets = [];
                this.particles = [];
                this.player.x = this.canvas.width / 2 - 25;
                this.player.vx = 0;
                this.createEnemies();
                
                document.getElementById('spaceScore').textContent = this.score;
                document.getElementById('spaceLives').textContent = this.lives;
                document.getElementById('spaceLevel').textContent = this.level;
                
                // تنظيف الذاكرة
                if (this.animationId) {
                    cancelAnimationFrame(this.animationId);
                }
            }

                // دوال رسم الأشكال المحسنة
            drawSpaceship(x, y, width, height) {
                this.ctx.fillStyle = '#00ff88';
                this.ctx.beginPath();
                // جسم المركبة
                this.ctx.moveTo(x + width/2, y);
                this.ctx.lineTo(x + width, y + height);
                this.ctx.lineTo(x + width*0.8, y + height*0.8);
                this.ctx.lineTo(x + width*0.2, y + height*0.8);
                this.ctx.lineTo(x, y + height);
                this.ctx.closePath();
                this.ctx.fill();
                
                // محرك المركبة
                this.ctx.fillStyle = '#ff4444';
                this.ctx.fillRect(x + width*0.3, y + height*0.8, width*0.15, height*0.2);
                this.ctx.fillRect(x + width*0.55, y + height*0.8, width*0.15, height*0.2);
                
                // نافذة المركبة
                this.ctx.fillStyle = '#88ffff';
                this.ctx.beginPath();
                this.ctx.arc(x + width/2, y + height*0.4, width*0.15, 0, Math.PI * 2);
                this.ctx.fill();
            }

            drawEnemy(x, y, width, height, type) {
                const colors = [
                    { body: '#ff3333', detail: '#aa0000' },
                    { body: '#ff8833', detail: '#cc4400' },
                    { body: '#ffff33', detail: '#cccc00' }
                ];
                const color = colors[type];
                
                this.ctx.fillStyle = color.body;
                this.ctx.beginPath();
                
                if (type === 0) {
                    // عدو مثلثي
                    this.ctx.moveTo(x + width/2, y + height);
                    this.ctx.lineTo(x, y);
                    this.ctx.lineTo(x + width, y);
                    this.ctx.closePath();
                } else if (type === 1) {
                    // عدو دائري
                    this.ctx.arc(x + width/2, y + height/2, width/2, 0, Math.PI * 2);
                } else {
                    // عدو مربع بأطراف مدورة
                    this.ctx.roundRect(x, y, width, height, 8);
                }
                
                this.ctx.fill();
                
                // تفاصيل العدو
                this.ctx.fillStyle = color.detail;
                if (type === 0) {
                    this.ctx.fillRect(x + width*0.4, y + height*0.2, width*0.2, height*0.6);
                } else if (type === 1) {
                    this.ctx.beginPath();
                    this.ctx.arc(x + width/2, y + height/2, width/4, 0, Math.PI * 2);
                    this.ctx.fill();
                } else {
                    this.ctx.fillRect(x + width*0.2, y + height*0.2, width*0.6, height*0.2);
                    this.ctx.fillRect(x + width*0.2, y + height*0.6, width*0.6, height*0.2);
                }
            }

            drawBullet(x, y, width, height, isPlayer = true) {
                if (isPlayer) {
                    // رصاصة اللاعب - ليزر أزرق
                    this.ctx.fillStyle = '#00ddff';
                    this.ctx.fillRect(x, y, width, height);
                    this.ctx.fillStyle = '#ffffff';
                    this.ctx.fillRect(x + 1, y, width - 2, height);
                } else {
                    // رصاصة العدو - ليزر أحمر
                    this.ctx.fillStyle = '#ff0044';
                    this.ctx.fillRect(x, y, width, height);
                    this.ctx.fillStyle = '#ff8888';
                    this.ctx.fillRect(x + 1, y, width - 2, height);
                }
            }

            draw() {
                // مسح الشاشة مع تدرج الفضاء
                const gradient = this.ctx.createLinearGradient(0, 0, 0, this.canvas.height);
                gradient.addColorStop(0, '#000511');
                gradient.addColorStop(0.5, '#001122');
                gradient.addColorStop(1, '#000000');
                this.ctx.fillStyle = gradient;
                this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

                // رسم النجوم المتحركة
                this.ctx.fillStyle = '#ffffff';
                for (let i = 0; i < 100; i++) {
                    const x = (i * 37) % this.canvas.width;
                    const y = (i * 23 + Date.now() * 0.02) % this.canvas.height;
                    const size = (i % 3) + 1;
                    this.ctx.fillRect(x, y, size, size);
                }

                // رسم اللاعب المحسن
                this.drawSpaceship(this.player.x, this.player.y, this.player.width, this.player.height);

                // رسم الأعداء المحسنين
                this.enemies.forEach(enemy => {
                    if (enemy.alive) {
                        this.drawEnemy(enemy.x, enemy.y, enemy.width, enemy.height, enemy.type);
                    }
                });

                // رسم الرصاصات المحسنة
                this.bullets.forEach(bullet => {
                    this.drawBullet(bullet.x, bullet.y, bullet.width, bullet.height, true);
                });

                this.enemyBullets.forEach(bullet => {
                    this.drawBullet(bullet.x, bullet.y, bullet.width, bullet.height, false);
                });

                // رسم الجسيمات المحسنة
                this.particles.forEach(particle => {
                    const alpha = particle.life / particle.maxLife;
                    const size = particle.size || 3;
                    
                    // تأثير التلاشي
                    this.ctx.globalAlpha = alpha;
                    this.ctx.fillStyle = particle.color;
                    this.ctx.beginPath();
                    this.ctx.arc(particle.x, particle.y, size * alpha, 0, Math.PI * 2);
                    this.ctx.fill();
                });
                this.ctx.globalAlpha = 1;
            }

    gameLoop() {
        this.update();
        this.draw();
        
        if (this.gameRunning) {
            this.animationId = requestAnimationFrame(() => this.gameLoop());
        }
    }
}

// باقي الألعاب (نسخ محسنة)
        class FlappyBird {
            constructor() {
                this.canvas = document.getElementById('flappyCanvas');
                this.ctx = this.canvas.getContext('2d');
                
                // تحسين حجم Canvas
                this.canvas.width = 600;
                this.canvas.height = 400;
                this.canvas.style.maxWidth = '100%';
                this.canvas.style.height = 'auto';
                
                this.score = 0;
                this.bestScore = localStorage.getItem('flappyBest') || 0;
        this.gameRunning = false;
        this.bird = { x: 50, y: 200, velocity: 0, size: 20 };
        this.pipes = [];
        this.gravity = 0.5;
        this.jump = -8;
        this.pipeWidth = 60;
        this.pipeGap = 150;
        
        document.getElementById('flappyBest').textContent = this.bestScore;
        this.init();
    }

    init() {
        document.getElementById('flappyStart').addEventListener('click', () => this.start());
        document.getElementById('flappyPause').addEventListener('click', () => this.pause());
        document.addEventListener('keydown', (e) => {
            if (e.code === 'Space' && this.gameRunning) {
                this.bird.velocity = this.jump;
            }
        });
        this.canvas.addEventListener('click', () => {
            if (this.gameRunning) this.bird.velocity = this.jump;
        });
        this.draw();
    }

    start() {
        if (!this.gameRunning) {
            this.gameRunning = true;
            this.pipes = [];
            this.bird = { x: 50, y: 200, velocity: 0, size: 20 };
            this.score = 0;
            document.getElementById('flappyScore').textContent = this.score;
            this.gameLoop();
        }
    }

    pause() {
        this.gameRunning = false;
    }

    update() {
        if (!this.gameRunning) return;

        this.bird.velocity += this.gravity;
        this.bird.y += this.bird.velocity;

        // إضافة أنابيب جديدة
        if (this.pipes.length === 0 || this.pipes[this.pipes.length - 1].x < this.canvas.width - 200) {
            const pipeY = Math.random() * (this.canvas.height - this.pipeGap - 100) + 50;
            this.pipes.push({
                x: this.canvas.width,
                topHeight: pipeY,
                bottomY: pipeY + this.pipeGap,
                scored: false
            });
        }

        // تحريك الأنابيب
        this.pipes = this.pipes.filter(pipe => {
            pipe.x -= 3;
            
            if (!pipe.scored && pipe.x + this.pipeWidth < this.bird.x) {
                this.score++;
                pipe.scored = true;
                document.getElementById('flappyScore').textContent = this.score;
                
                if (this.score > this.bestScore) {
                    this.bestScore = this.score;
                    localStorage.setItem('flappyBest', this.bestScore);
                    document.getElementById('flappyBest').textContent = this.bestScore;
                }
            }
            
            return pipe.x > -this.pipeWidth;
        });

        this.checkCollisions();
    }

    checkCollisions() {
        if (this.bird.y < 0 || this.bird.y + this.bird.size > this.canvas.height) {
            this.gameOver();
            return;
        }

        this.pipes.forEach(pipe => {
            if (this.bird.x + this.bird.size > pipe.x && 
                this.bird.x < pipe.x + this.pipeWidth) {
                if (this.bird.y < pipe.topHeight || 
                    this.bird.y + this.bird.size > pipe.bottomY) {
                    this.gameOver();
                }
            }
        });
    }

    gameOver() {
        this.gameRunning = false;
        alert(`انتهت اللعبة! النقاط: ${this.score}`);
    }

    reset() {
        this.score = 0;
        document.getElementById('flappyScore').textContent = this.score;
        this.bird = { x: 50, y: 200, velocity: 0, size: 20 };
        this.pipes = [];
    }

                drawBird(x, y, size, velocity) {
                // حساب زاوية الطائر حسب السرعة
                const angle = Math.min(Math.max(velocity * 0.1, -0.5), 0.5);
                
                this.ctx.save();
                this.ctx.translate(x + size/2, y + size/2);
                this.ctx.rotate(angle);
                
                // جسم الطائر
                this.ctx.fillStyle = '#FFD700';
                this.ctx.beginPath();
                this.ctx.ellipse(0, 0, size/2, size/2.5, 0, 0, Math.PI * 2);
                this.ctx.fill();
                
                // الجناح
                this.ctx.fillStyle = '#FFA500';
                this.ctx.beginPath();
                this.ctx.ellipse(-size/4, 0, size/3, size/6, Math.sin(Date.now() * 0.01) * 0.3, 0, Math.PI * 2);
                this.ctx.fill();
                
                // العين
                this.ctx.fillStyle = '#FFF';
                this.ctx.beginPath();
                this.ctx.arc(size/6, -size/6, size/6, 0, Math.PI * 2);
                this.ctx.fill();
                
                this.ctx.fillStyle = '#000';
                this.ctx.beginPath();
                this.ctx.arc(size/6, -size/6, size/12, 0, Math.PI * 2);
                this.ctx.fill();
                
                // المنقار
                this.ctx.fillStyle = '#FF8C00';
                this.ctx.beginPath();
                this.ctx.moveTo(size/2, 0);
                this.ctx.lineTo(size/1.5, -size/8);
                this.ctx.lineTo(size/1.5, size/8);
                this.ctx.closePath();
                this.ctx.fill();
                
                this.ctx.restore();
            }

            drawPipe(x, y, width, height, isTop = false) {
                // الأنبوب الرئيسي
                this.ctx.fillStyle = '#228B22';
                this.ctx.fillRect(x, y, width, height);
                
                // حدود الأنبوب
                this.ctx.fillStyle = '#32CD32';
                this.ctx.fillRect(x + 5, y, width - 10, height);
                
                // فوهة الأنبوب
                const capHeight = 30;
                const capWidth = width + 10;
                const capY = isTop ? y + height - capHeight : y;
                
                this.ctx.fillStyle = '#228B22';
                this.ctx.fillRect(x - 5, capY, capWidth, capHeight);
                
                this.ctx.fillStyle = '#32CD32';
                this.ctx.fillRect(x, capY + 5, capWidth - 10, capHeight - 10);
                
                // خطوط الأنبوب
                this.ctx.strokeStyle = '#1F5F1F';
                this.ctx.lineWidth = 2;
                for (let i = 0; i < height; i += 20) {
                    this.ctx.beginPath();
                    this.ctx.moveTo(x, y + i);
                    this.ctx.lineTo(x + width, y + i);
                    this.ctx.stroke();
                }
            }

            drawClouds() {
                // غيوم متحركة
                this.ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
                for (let i = 0; i < 5; i++) {
                    const x = (i * 150 + Date.now() * 0.02) % (this.canvas.width + 100) - 50;
                    const y = 50 + i * 40;
                    
                    // رسم شكل الغيمة
                    this.ctx.beginPath();
                    this.ctx.arc(x, y, 20, 0, Math.PI * 2);
                    this.ctx.arc(x + 25, y, 25, 0, Math.PI * 2);
                    this.ctx.arc(x + 50, y, 20, 0, Math.PI * 2);
                    this.ctx.arc(x + 25, y - 15, 15, 0, Math.PI * 2);
                    this.ctx.fill();
                }
            }

            draw() {
                // خلفية متدرجة (سماء)
                const gradient = this.ctx.createLinearGradient(0, 0, 0, this.canvas.height);
                gradient.addColorStop(0, '#87CEEB');
                gradient.addColorStop(0.7, '#98D8E8');
                gradient.addColorStop(1, '#B0E0E6');
                this.ctx.fillStyle = gradient;
                this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

                // رسم الغيوم
                this.drawClouds();

                // رسم الأنابيب المحسنة
                this.pipes.forEach(pipe => {
                    this.drawPipe(pipe.x, 0, this.pipeWidth, pipe.topHeight, true);
                    this.drawPipe(pipe.x, pipe.bottomY, this.pipeWidth, this.canvas.height - pipe.bottomY, false);
                });

                // رسم الطائر المحسن
                this.drawBird(this.bird.x, this.bird.y, this.bird.size, this.bird.velocity);

                if (this.gameRunning) {
                    requestAnimationFrame(() => this.gameLoop());
                }
            }

    gameLoop() {
        this.update();
        this.draw();
    }
}

// باقي الألعاب المحسنة (SlidingPuzzle, TicTacToe, SnakeGame, MemoryGame, Game2048)
class SlidingPuzzle {
    constructor() {
        this.size = 4;
        this.tiles = [];
        this.emptyPos = { row: 3, col: 3 };
        this.moves = 0;
        this.startTime = null;
        this.timer = null;
        
        this.init();
        window.slidingPuzzle = this;
    }

    init() {
        this.createBoard();
        document.getElementById('puzzleShuffle').addEventListener('click', () => this.shuffle());
    }

    createBoard() {
        const board = document.getElementById('puzzleBoard');
        board.innerHTML = '';
        
        this.tiles = [];
        for (let i = 0; i < this.size; i++) {
            this.tiles[i] = [];
            for (let j = 0; j < this.size; j++) {
                const value = i * this.size + j + 1;
                this.tiles[i][j] = value <= 15 ? value : 0;
            }
        }
        
        this.renderBoard();
    }

    renderBoard() {
        const board = document.getElementById('puzzleBoard');
        board.innerHTML = '';
        
        for (let i = 0; i < this.size; i++) {
            for (let j = 0; j < this.size; j++) {
                const tile = document.createElement('button');
                tile.className = 'puzzle-tile';
                tile.dataset.row = i;
                tile.dataset.col = j;
                
                if (this.tiles[i][j] === 0) {
                    tile.classList.add('empty');
                    tile.textContent = '';
                } else {
                    tile.textContent = this.tiles[i][j];
                    tile.addEventListener('click', () => this.moveTile(i, j));
                }
                
                board.appendChild(tile);
            }
        }
    }

    moveTile(row, col) {
        if (!this.startTime) {
            this.startTime = Date.now();
            this.timer = setInterval(() => this.updateTimer(), 1000);
        }

        if (this.canMove(row, col)) {
            this.tiles[this.emptyPos.row][this.emptyPos.col] = this.tiles[row][col];
            this.tiles[row][col] = 0;
            this.emptyPos = { row, col };
            
            this.moves++;
            document.getElementById('puzzleMoves').textContent = this.moves;
            
            this.renderBoard();
            
            if (this.checkWin()) {
                clearInterval(this.timer);
                const time = Math.floor((Date.now() - this.startTime) / 1000);
                setTimeout(() => {
                    alert(`تهانينا! حللت الأحجية في ${this.moves} حركة و ${time} ثانية!`);
                }, 100);
            }
        }
    }

    updateTimer() {
        if (this.startTime) {
            const elapsed = Math.floor((Date.now() - this.startTime) / 1000);
            const minutes = Math.floor(elapsed / 60);
            const seconds = elapsed % 60;
            document.getElementById('puzzleTime').textContent = 
                `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        }
    }

    canMove(row, col) {
        const rowDiff = Math.abs(row - this.emptyPos.row);
        const colDiff = Math.abs(col - this.emptyPos.col);
        return (rowDiff === 1 && colDiff === 0) || (rowDiff === 0 && colDiff === 1);
    }

    checkWin() {
        for (let i = 0; i < this.size; i++) {
            for (let j = 0; j < this.size; j++) {
                const expectedValue = i * this.size + j + 1;
                if (i === 3 && j === 3) {
                    if (this.tiles[i][j] !== 0) return false;
                } else {
                    if (this.tiles[i][j] !== expectedValue) return false;
                }
            }
        }
        return true;
    }

    shuffle() {
        for (let i = 0; i < 1000; i++) {
            const possibleMoves = [];
            
            for (let row = 0; row < this.size; row++) {
                for (let col = 0; col < this.size; col++) {
                    if (this.canMove(row, col)) {
                        possibleMoves.push({ row, col });
                    }
                }
            }
            
            if (possibleMoves.length > 0) {
                const randomMove = possibleMoves[Math.floor(Math.random() * possibleMoves.length)];
                this.tiles[this.emptyPos.row][this.emptyPos.col] = this.tiles[randomMove.row][randomMove.col];
                this.tiles[randomMove.row][randomMove.col] = 0;
                this.emptyPos = randomMove;
            }
        }
        
        this.moves = 0;
        this.startTime = null;
        if (this.timer) {
            clearInterval(this.timer);
        }
        document.getElementById('puzzleMoves').textContent = this.moves;
        document.getElementById('puzzleTime').textContent = '00:00';
        this.renderBoard();
    }
}

// الألعاب الأخرى (TicTacToe, SnakeGame, MemoryGame, Game2048) - نسخ مبسطة
class TicTacToe {
    constructor() {
        this.board = Array(9).fill('');
        this.currentPlayer = 'X';
        this.gameActive = true;
        this.xWins = 0;
        this.oWins = 0;
        
        this.init();
        window.ticTacToe = this;
    }

    init() {
        this.createBoard();
        document.getElementById('tictactoeReset').addEventListener('click', () => this.reset());
    }

    createBoard() {
        const board = document.getElementById('tictactoeBoard');
        board.innerHTML = '';

        for (let i = 0; i < 9; i++) {
            const cell = document.createElement('button');
            cell.className = 'tictactoe-cell';
            cell.dataset.index = i;
            cell.addEventListener('click', () => this.makeMove(i));
            board.appendChild(cell);
        }
        this.updateBoard();
    }

    makeMove(index) {
        if (this.board[index] === '' && this.gameActive) {
            this.board[index] = this.currentPlayer;
            this.updateBoard();

            if (this.checkWinner()) {
                if (this.currentPlayer === 'X') {
                    this.xWins++;
                    document.getElementById('xWins').textContent = this.xWins;
                } else {
                    this.oWins++;
                    document.getElementById('oWins').textContent = this.oWins;
                }
                document.getElementById('gameResult').innerHTML =
                    `<div class="game-result win">🎉 الفائز هو ${this.currentPlayer}!</div>`;
                this.gameActive = false;
                setTimeout(() => this.reset(), 2000);
            } else if (this.board.every(cell => cell !== '')) {
                document.getElementById('gameResult').innerHTML =
                    '<div class="game-result draw">🤝 تعادل!</div>';
                setTimeout(() => this.reset(), 2000);
            } else {
                this.currentPlayer = this.currentPlayer === 'X' ? 'O' : 'X';
                document.getElementById('currentPlayer').textContent = this.currentPlayer;
            }
        }
    }

    updateBoard() {
        const cells = document.querySelectorAll('.tictactoe-cell');
        cells.forEach((cell, index) => {
            cell.textContent = this.board[index];
            cell.disabled = this.board[index] !== '' || !this.gameActive;
        });
    }

    checkWinner() {
        const winPatterns = [
            [0, 1, 2], [3, 4, 5], [6, 7, 8],
            [0, 3, 6], [1, 4, 7], [2, 5, 8],
            [0, 4, 8], [2, 4, 6]
        ];

        return winPatterns.some(pattern => {
            const [a, b, c] = pattern;
            return this.board[a] && this.board[a] === this.board[b] && this.board[a] === this.board[c];
        });
    }

    reset() {
        this.board = Array(9).fill('');
        this.currentPlayer = 'X';
        this.gameActive = true;
        document.getElementById('currentPlayer').textContent = this.currentPlayer;
        document.getElementById('gameResult').innerHTML = '';
        this.updateBoard();
    }
}

// لعبة الثعبان
        class SnakeGame {
            constructor() {
                this.canvas = document.getElementById('snakeCanvas');
                this.ctx = this.canvas.getContext('2d');
                
                // تحسين حجم Canvas
                this.canvas.width = 600;
                this.canvas.height = 400;
                this.canvas.style.maxWidth = '100%';
                this.canvas.style.height = 'auto';
                
                this.gridSize = 20;
        this.snake = [{ x: 200, y: 200 }];
        this.direction = { x: 0, y: 0 };
        this.nextDirection = { x: 0, y: 0 };
        this.food = this.generateFood();
        this.score = 0;
        this.bestScore = localStorage.getItem('snakeBest') || 0;
        this.gameRunning = false;
        this.speed = 1;

        document.getElementById('snakeBest').textContent = this.bestScore;
        this.init();
    }

    init() {
        document.getElementById('snakeStart').addEventListener('click', () => this.start());
        document.getElementById('snakePause').addEventListener('click', () => this.pause());

                        document.addEventListener('keydown', (e) => {
                    if (!this.gameRunning) return;
                    
                    e.preventDefault(); // منع السلوك الافتراضي
                    
                    switch (e.key.toLowerCase()) {
                        case 'arrowup':
                        case 'w':
                            if (this.direction.y === 0) {
                                this.nextDirection = { x: 0, y: -this.gridSize };
                            }
                            break;
                        case 'arrowdown':
                        case 's':
                            if (this.direction.y === 0) {
                                this.nextDirection = { x: 0, y: this.gridSize };
                            }
                            break;
                        case 'arrowleft':
                        case 'a':
                            if (this.direction.x === 0) {
                                this.nextDirection = { x: -this.gridSize, y: 0 };
                            }
                            break;
                        case 'arrowright':
                        case 'd':
                            if (this.direction.x === 0) {
                                this.nextDirection = { x: this.gridSize, y: 0 };
                            }
                            break;
                    }
                });

        this.draw();
    }

    generateFood() {
        const x = Math.floor(Math.random() * (this.canvas.width / this.gridSize)) * this.gridSize;
        const y = Math.floor(Math.random() * (this.canvas.height / this.gridSize)) * this.gridSize;
        return { x, y };
    }

    start() {
        if (!this.gameRunning) {
            this.gameRunning = true;
            this.gameLoop();
        }
    }

    pause() {
        this.gameRunning = false;
    }

                update() {
                if (!this.gameRunning) return;

                // تطبيق الاتجاه التالي
                if (this.nextDirection.x !== 0 || this.nextDirection.y !== 0) {
                    this.direction = this.nextDirection;
                }

                const head = { x: this.snake[0].x + this.direction.x, y: this.snake[0].y + this.direction.y };

        // الحدود
        if (head.x < 0 || head.x >= this.canvas.width || head.y < 0 || head.y >= this.canvas.height) {
            this.gameOver();
            return;
        }

        // اصطدام بالجسم
        if (this.snake.some(segment => segment.x === head.x && segment.y === head.y)) {
            this.gameOver();
            return;
        }

        this.snake.unshift(head);

                        // أكل الطعام
                if (head.x === this.food.x && head.y === this.food.y) {
                    const bonus = Math.max(10, 20 - Math.floor(this.snake.length / 5));
                    this.score += bonus;
                    this.speed = Math.min(5, Math.floor(this.score / 50) + 1);
                    
                    // تأثير بصري للنقاط
                    this.showScoreEffect(head.x, head.y, `+${bonus}`);
                    
                    document.getElementById('snakeScore').textContent = this.score;
                    document.getElementById('snakeSpeed').textContent = this.speed;

                    if (this.score > this.bestScore) {
                        this.bestScore = this.score;
                        localStorage.setItem('snakeBest', this.bestScore);
                        document.getElementById('snakeBest').textContent = this.bestScore;
                        
                        // تأثير خاص للرقم القياسي الجديد
                        this.showScoreEffect(head.x, head.y + 30, 'رقم قياسي!', '#FFD700');
                    }

                    this.food = this.generateFood();
                } else {
                    this.snake.pop();
                }
    }

                drawSnakeHead(x, y, size) {
                // رأس الثعبان مع عيون
                this.ctx.fillStyle = '#228B22';
                this.ctx.beginPath();
                this.ctx.roundRect(x, y, size - 2, size - 2, 6);
                this.ctx.fill();
                
                // العيون
                this.ctx.fillStyle = '#000';
                this.ctx.beginPath();
                this.ctx.arc(x + size * 0.3, y + size * 0.3, 2, 0, Math.PI * 2);
                this.ctx.arc(x + size * 0.7, y + size * 0.3, 2, 0, Math.PI * 2);
                this.ctx.fill();
                
                // الفم
                this.ctx.strokeStyle = '#000';
                this.ctx.lineWidth = 1;
                this.ctx.beginPath();
                this.ctx.arc(x + size * 0.5, y + size * 0.6, 3, 0, Math.PI);
                this.ctx.stroke();
            }

            drawSnakeBody(x, y, size, index) {
                // جسم الثعبان مع نمط متدرج
                const greenShade = Math.max(100, 255 - index * 10);
                this.ctx.fillStyle = `rgb(0, ${greenShade}, 0)`;
                this.ctx.beginPath();
                this.ctx.roundRect(x + 1, y + 1, size - 4, size - 4, 4);
                this.ctx.fill();
                
                // خط في المنتصف
                this.ctx.fillStyle = `rgb(0, ${Math.max(50, greenShade - 50)}, 0)`;
                this.ctx.fillRect(x + size * 0.4, y + 2, size * 0.2, size - 4);
            }

            drawFood(x, y, size) {
                // تفاحة أو فاكهة
                this.ctx.fillStyle = '#FF0000';
                this.ctx.beginPath();
                this.ctx.arc(x + size/2, y + size/2, size/2 - 2, 0, Math.PI * 2);
                this.ctx.fill();
                
                // بريق على التفاحة
                this.ctx.fillStyle = '#FF6666';
                this.ctx.beginPath();
                this.ctx.arc(x + size * 0.3, y + size * 0.3, 3, 0, Math.PI * 2);
                this.ctx.fill();
                
                // عود التفاحة
                this.ctx.fillStyle = '#8B4513';
                this.ctx.fillRect(x + size/2 - 1, y + 2, 2, 6);
                
                // ورقة
                this.ctx.fillStyle = '#228B22';
                this.ctx.beginPath();
                this.ctx.ellipse(x + size * 0.6, y + 4, 4, 2, Math.PI / 4, 0, Math.PI * 2);
                this.ctx.fill();
            }

            draw() {
                // خلفية مع نمط شبكي
                const gradient = this.ctx.createLinearGradient(0, 0, this.canvas.width, this.canvas.height);
                gradient.addColorStop(0, '#1a1a2e');
                gradient.addColorStop(1, '#16213e');
                this.ctx.fillStyle = gradient;
                this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
                
                // رسم شبكة خفيفة
                this.ctx.strokeStyle = '#0f3460';
                this.ctx.lineWidth = 0.5;
                for (let x = 0; x < this.canvas.width; x += this.gridSize) {
                    this.ctx.beginPath();
                    this.ctx.moveTo(x, 0);
                    this.ctx.lineTo(x, this.canvas.height);
                    this.ctx.stroke();
                }
                for (let y = 0; y < this.canvas.height; y += this.gridSize) {
                    this.ctx.beginPath();
                    this.ctx.moveTo(0, y);
                    this.ctx.lineTo(this.canvas.width, y);
                    this.ctx.stroke();
                }

                // رسم الثعبان المحسن
                this.snake.forEach((segment, index) => {
                    if (index === 0) {
                        this.drawSnakeHead(segment.x, segment.y, this.gridSize);
                    } else {
                        this.drawSnakeBody(segment.x, segment.y, this.gridSize, index);
                    }
                });

                // رسم الطعام المحسن
                this.drawFood(this.food.x, this.food.y, this.gridSize);
            }

                gameLoop() {
                this.update();
                this.draw();

                if (this.gameRunning) {
                    setTimeout(() => this.gameLoop(), 200 - (this.speed - 1) * 20);
                }
            }

            showScoreEffect(x, y, text, color = '#00ff00') {
                // إنشاء تأثير نص متحرك
                const effect = document.createElement('div');
                effect.style.position = 'absolute';
                effect.style.left = `${x}px`;
                effect.style.top = `${y}px`;
                effect.style.color = color;
                effect.style.fontSize = '20px';
                effect.style.fontWeight = 'bold';
                effect.style.pointerEvents = 'none';
                effect.style.zIndex = '1000';
                effect.style.transition = 'all 1s ease-out';
                effect.textContent = text;
                
                document.body.appendChild(effect);
                
                // حركة الاختفاء
                setTimeout(() => {
                    effect.style.transform = 'translateY(-30px)';
                    effect.style.opacity = '0';
                }, 100);
                
                setTimeout(() => {
                    if (effect.parentElement) {
                        effect.parentElement.removeChild(effect);
                    }
                }, 1100);
            }

            gameOver() {
                this.gameRunning = false;
                setTimeout(() => {
                    alert(`انتهت اللعبة! النقاط: ${this.score}\nأفضل نتيجة: ${this.bestScore}`);
                }, 100);
            }

    reset() {
        this.snake = [{ x: 200, y: 200 }];
        this.direction = { x: 0, y: 0 };
        this.nextDirection = { x: 0, y: 0 };
        this.food = this.generateFood();
        this.score = 0;
        this.speed = 1;
        this.gameRunning = false;
        document.getElementById('snakeScore').textContent = this.score;
        document.getElementById('snakeSpeed').textContent = this.speed;
        this.draw();
    }
}

// لعبة الذاكرة
class MemoryGame {
    constructor() {
        this.cards = [];
        this.flippedCards = [];
        this.matchedPairs = 0;
        this.score = 0;
        this.startTime = null;
        this.timer = null;
        this.symbols = ['🎭', '🎨', '🎪', '🎯', '🎲', '🎸', '🎺', '🎻'];

        this.init();
    }

    init() {
        this.createBoard();
        document.getElementById('memoryReset').addEventListener('click', () => this.reset());
    }

    createBoard() {
        const board = document.getElementById('memoryBoard');
        board.innerHTML = '';

        this.cards = [];
        const symbols = [...this.symbols, ...this.symbols];
        symbols.sort(() => Math.random() - 0.5);

        symbols.forEach((symbol, index) => {
            const card = document.createElement('div');
            card.className = 'memory-card';
            card.dataset.symbol = symbol;
            card.dataset.index = index;
            card.addEventListener('click', () => this.flipCard(card));
            board.appendChild(card);
            this.cards.push({ element: card, symbol, flipped: false, matched: false });
        });
    }

    flipCard(cardElement) {
        const index = parseInt(cardElement.dataset.index);
        const card = this.cards[index];

        if (card.flipped || card.matched || this.flippedCards.length >= 2) return;

        if (!this.startTime) {
            this.startTime = Date.now();
            this.timer = setInterval(() => this.updateTimer(), 1000);
        }

        card.flipped = true;
        cardElement.classList.add('flipped');
        cardElement.textContent = card.symbol;
        this.flippedCards.push(card);

        if (this.flippedCards.length === 2) {
            setTimeout(() => this.checkMatch(), 600);
        }
    }

    checkMatch() {
        const [card1, card2] = this.flippedCards;

        if (card1.symbol === card2.symbol) {
            card1.matched = true;
            card2.matched = true;
            card1.element.classList.add('matched');
            card2.element.classList.add('matched');

            this.matchedPairs++;
            this.score += 100;

            document.getElementById('memoryScore').textContent = this.score;
            document.getElementById('memoryPairs').textContent = `${this.matchedPairs}/8`;

            if (this.matchedPairs === 8) {
                clearInterval(this.timer);
                const time = Math.floor((Date.now() - this.startTime) / 1000);
                setTimeout(() => {
                    alert(`مبروك! أكملت اللعبة في ${time} ثانية بنقاط ${this.score}!`);
                }, 500);
            }
        } else {
            setTimeout(() => {
                card1.flipped = false;
                card2.flipped = false;
                card1.element.classList.remove('flipped');
                card2.element.classList.remove('flipped');
                card1.element.textContent = '';
                card2.element.textContent = '';
            }, 500);
        }

        this.flippedCards = [];
    }

    updateTimer() {
        if (this.startTime) {
            const elapsed = Math.floor((Date.now() - this.startTime) / 1000);
            const minutes = Math.floor(elapsed / 60);
            const seconds = elapsed % 60;
            document.getElementById('memoryTime').textContent =
                `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        }
    }

    reset() {
        this.matchedPairs = 0;
        this.score = 0;
        this.flippedCards = [];
        this.startTime = null;

        if (this.timer) {
            clearInterval(this.timer);
        }

        document.getElementById('memoryScore').textContent = this.score;
        document.getElementById('memoryPairs').textContent = '0/8';
        document.getElementById('memoryTime').textContent = '00:00';

        this.createBoard();
    }
}

// لعبة 2048
class Game2048 {
    constructor() {
        this.size = 4;
        this.board = [];
        this.score = 0;
        this.bestScore = localStorage.getItem('2048Best') || 0;
        this.gameOver = false;

        document.getElementById('game2048Best').textContent = this.bestScore;
        this.init();
    }

    init() {
        this.initBoard();
        this.addRandomTile();
        this.addRandomTile();
        this.render();

        document.getElementById('game2048Reset').addEventListener('click', () => this.reset());
        document.addEventListener('keydown', (e) => this.handleKeyPress(e));
    }

    initBoard() {
        this.board = [];
        for (let i = 0; i < this.size; i++) {
            this.board[i] = new Array(this.size).fill(0);
        }
    }

    addRandomTile() {
        const emptyCells = [];
        for (let i = 0; i < this.size; i++) {
            for (let j = 0; j < this.size; j++) {
                if (this.board[i][j] === 0) {
                    emptyCells.push({ row: i, col: j });
                }
            }
        }

        if (emptyCells.length > 0) {
            const randomCell = emptyCells[Math.floor(Math.random() * emptyCells.length)];
            this.board[randomCell.row][randomCell.col] = Math.random() < 0.9 ? 2 : 4;
        }
    }

    handleKeyPress(e) {
        if (this.gameOver) return;

        let moved = false;

        switch (e.key) {
            case 'ArrowUp':
                moved = this.moveUp();
                break;
            case 'ArrowDown':
                moved = this.moveDown();
                break;
            case 'ArrowLeft':
                moved = this.moveLeft();
                break;
            case 'ArrowRight':
                moved = this.moveRight();
                break;
        }

        if (moved) {
            this.addRandomTile();
            this.render();
            this.updateScore();

            if (this.checkGameOver()) {
                this.gameOver = true;
                setTimeout(() => alert('انتهت اللعبة!'), 100);
            } else if (this.checkWin()) {
                setTimeout(() => alert('تهانينا! وصلت إلى 2048!'), 100);
            }
        }
    }

    moveLeft() {
        let moved = false;
        for (let i = 0; i < this.size; i++) {
            const row = this.board[i].filter(val => val !== 0);
            for (let j = 0; j < row.length - 1; j++) {
                if (row[j] === row[j + 1]) {
                    row[j] *= 2;
                    this.score += row[j];
                    row.splice(j + 1, 1);
                }
            }
            while (row.length < this.size) {
                row.push(0);
            }
            if (JSON.stringify(row) !== JSON.stringify(this.board[i])) {
                moved = true;
            }
            this.board[i] = row;
        }
        return moved;
    }

    moveRight() {
        let moved = false;
        for (let i = 0; i < this.size; i++) {
            const row = this.board[i].filter(val => val !== 0);
            for (let j = row.length - 1; j > 0; j--) {
                if (row[j] === row[j - 1]) {
                    row[j] *= 2;
                    this.score += row[j];
                    row.splice(j - 1, 1);
                    j--;
                }
            }
            while (row.length < this.size) {
                row.unshift(0);
            }
            if (JSON.stringify(row) !== JSON.stringify(this.board[i])) {
                moved = true;
            }
            this.board[i] = row;
        }
        return moved;
    }

    moveUp() {
        this.transpose();
        const moved = this.moveLeft();
        this.transpose();
        return moved;
    }

    moveDown() {
        this.transpose();
        const moved = this.moveRight();
        this.transpose();
        return moved;
    }

    transpose() {
        const newBoard = [];
        for (let i = 0; i < this.size; i++) {
            newBoard[i] = [];
            for (let j = 0; j < this.size; j++) {
                newBoard[i][j] = this.board[j][i];
            }
        }
        this.board = newBoard;
    }

    checkWin() {
        for (let i = 0; i < this.size; i++) {
            for (let j = 0; j < this.size; j++) {
                if (this.board[i][j] === 2048) {
                    return true;
                }
            }
        }
        return false;
    }

    checkGameOver() {
        // خلايا فارغة
        for (let i = 0; i < this.size; i++) {
            for (let j = 0; j < this.size; j++) {
                if (this.board[i][j] === 0) {
                    return false;
                }
            }
        }

        // إمكانية الدمج
        for (let i = 0; i < this.size; i++) {
            for (let j = 0; j < this.size - 1; j++) {
                if (this.board[i][j] === this.board[i][j + 1] ||
                    this.board[j][i] === this.board[j + 1][i]) {
                    return false;
                }
            }
        }

        return true;
    }

    updateScore() {
        document.getElementById('game2048Score').textContent = this.score;
        if (this.score > this.bestScore) {
            this.bestScore = this.score;
            localStorage.setItem('2048Best', this.bestScore);
            document.getElementById('game2048Best').textContent = this.bestScore;
        }
    }

    render() {
        const board = document.getElementById('game2048Board');
        board.innerHTML = '';
        board.style.display = 'grid';
        board.style.gridTemplateColumns = 'repeat(4, 1fr)';
        board.style.gap = '10px';
        board.style.padding = '20px';
        board.style.backgroundColor = '#bbada0';
        board.style.borderRadius = '15px';
        board.style.maxWidth = '400px';

        for (let i = 0; i < this.size; i++) {
            for (let j = 0; j < this.size; j++) {
                const tile = document.createElement('div');
                tile.style.width = '70px';
                tile.style.height = '70px';
                tile.style.borderRadius = '8px';
                tile.style.display = 'flex';
                tile.style.alignItems = 'center';
                tile.style.justifyContent = 'center';
                tile.style.fontSize = '24px';
                tile.style.fontWeight = 'bold';

                const value = this.board[i][j];
                if (value !== 0) {
                    tile.textContent = value;
                    tile.style.backgroundColor = this.getTileColor(value);
                    tile.style.color = value <= 4 ? '#776e65' : '#f9f6f2';
                } else {
                    tile.style.backgroundColor = '#cdc1b4';
                }

                board.appendChild(tile);
            }
        }
    }

    getTileColor(value) {
        const colors = {
            2: '#eee4da',
            4: '#ede0c8',
            8: '#f2b179',
            16: '#f59563',
            32: '#f67c5f',
            64: '#f65e3b',
            128: '#edcf72',
            256: '#edcc61',
            512: '#edc850',
            1024: '#edc53f',
            2048: '#edc22e'
        };
        return colors[value] || '#3c3a32';
    }

    reset() {
        this.score = 0;
        this.gameOver = false;
        document.getElementById('game2048Score').textContent = this.score;
        this.initBoard();
        this.addRandomTile();
        this.addRandomTile();
        this.render();
    }
}

// تهيئة مدير الألعاب عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', () => {
    window.gameManager = new GameManager();

    // حركة بسيطة لأيقونة العنوان فقط (بدون التجول)
    try {
        const icon = document.getElementById('siteLogoIcon');
        const cat = document.getElementById('cat');
        const header = document.querySelector('.header');
        if (icon && typeof gsap !== 'undefined') {
            const bob = gsap.timeline({ repeat: -1, yoyo: true });
            bob.to(icon, { y: -6, duration: 0, ease: 'power1.inOut' })
               .to(icon, { y: 0, duration: 0, ease: 'power1.inOut' });

            const pulse = () => {
                gsap.fromTo(icon, { scale: 1 }, { scale: 1.08, duration: 0.18, yoyo: true, repeat: 1, ease: 'power2.out' });
            };
            gsap.delayedCall(1.2, function repeater(){ pulse(); gsap.delayedCall(2.4, repeater); });
        }

        // ضع القطة في منتصف الشريط (navbar) وثبّت تموضعها مع التمرير وتغيير الحجم
        if (cat && header && typeof gsap !== 'undefined') {
            const placeCatCenter = () => {
                const r = header.getBoundingClientRect();
                const x = r.left + r.width / 2 - cat.offsetWidth / 2 + window.scrollX;
                const y = r.top  + r.height / 2 - cat.offsetHeight / 2 + window.scrollY;
                gsap.set(cat, { x, y });
            };
            placeCatCenter();
            window.addEventListener('resize', placeCatCenter);
            window.addEventListener('scroll', placeCatCenter, { passive: true });

            // ارتداد خفيف دوري
            const tl = gsap.timeline({ repeat: -1, yoyo: true });
            tl.to(cat, { y: "-=6", duration: 0, ease: 'power1.inOut' })
              .to(cat, { y: "+=6", duration: 0, ease: 'power1.inOut' });
        }
    } catch {}
});
