class World extends WorldBase {
    canvas;
    ctx;
    keyboard;
    level;
    character;
    statusBar;
    camera_x = -100;
    characterScreenX = 100;
    debugMode = false;
    isDisposed = false;
    isGameOver = false;
    isWin = false;
    isPaused = false;
    throwChargeStart = null;
    bottleCount = 0;
    coinValue = 0;
    coinsCollected = 0;
    coinInventory = 0;
    minibossSoundIds = new WeakSet();
    minibossDeadIds = new WeakSet();
    bossUnlocked = false;
    bossSoundPlayed = false;
    levelIntroActive = true;
    bottles = [];
    coins = [];
    thrownBottles = [];
    lastUpdate = performance.now();

    /**
     * DE: Erstellt ein neues Objekt und legt seine Startwerte fest.
     * EN: Creates a new object and sets its initial values.
     * @param {HTMLCanvasElement} canvas - DE: canvas. EN: canvas.
     * @param {Keyboard} keyboard - DE: keyboard. EN: keyboard.
     * @param {Function} onGameOver - DE: onGameOver. EN: onGameOver.
     * @param {number} levelNumber - DE: levelNumber. EN: levelNumber.
     */
    constructor(canvas, keyboard, onGameOver, levelNumber = 1) {
        super();
        this.setupCanvas(canvas, keyboard, onGameOver);
        this.setupWorld(levelNumber);
        this.startGameLoop();
        this.startCollisionLoop();
        this.draw();
    }

    /** DE: Bereitet das Canvas vor. EN: Sets up the canvas. */
    setupCanvas(canvas, keyboard, onGameOver) {
        this.ctx = canvas.getContext("2d");
        this.canvas = canvas;
        this.keyboard = keyboard;
        this.onGameOver = onGameOver;
        this.gameOverImage = new Image();
        this.gameOverImage.src = "img/9_intro_outro_screens/game_over/game over.png";
        this.winImage = new Image();
        this.winImage.src = "img/You won, you lost/You won A.png";
    }

    /** DE: Erstellt die Objekte im Level. EN: Creates the level objects. */
    setupWorld(levelNumber) {
        this.levelNumber = levelNumber;
        this.level = levelNumber === 2 ? createLevel2() : createLevel1();
        this.character = new Character(this.keyboard, this.level);
        this.statusBar = new StatusBar();
        this.bottleBar = new StatusBar();
        this.coinBar = new StatusBar();
        this.configureCollectibles();
        this.character.x = this.characterScreenX - this.camera_x;
        this.isPaused = true;
    }

    /**
     * DE: Startet die Spielschleife.
     * EN: Start game loop.
     */
    startGameLoop() {
        this.gameLoopInterval = setInterval(() => this.updateGame(), 1000 / 60);
    }

    /** DE: Aktualisiert ein Spielframe. EN: Updates one game frame. */
    updateGame() {
        if (this.isDisposed || this.isPaused) return;
        this.updateAmbientSounds();
        this.updateClouds();
        if (this.isGameOver || this.isWin) return;
        if (this.character.energy <= 0) return this.checkCharacterDeath();
        this.updateActiveGame();
    }

    /** DE: Prüft den Abschluss der Todesanimation. EN: Checks the death animation. */
    checkCharacterDeath() {
        if (this.character.deathFinished) this.triggerGameOver();
    }

    /** DE: Aktualisiert die Spielfigur und die Umgebung. EN: Updates player and world. */
    updateActiveGame() {
        this.character.updateMovement();
        this.updateFootsteps();
        this.checkBossApproach();
        this.updateCamera();
        this.updateCollectibles();
        this.updateMiniBossSounds();
    }

    /**
     * DE: Aktualisiert ambient sounds.
     * EN: Updates ambient sounds.
     */
    updateAmbientSounds() {
        if (this.isGameOver || this.isWin) return;
        gameSounds.play("wind");
        const anyChickensAlive = this.level.enemies.some(enemy =>
            (enemy instanceof chickenSmall || enemy instanceof chicken) && !enemy.isDead);
        if (anyChickensAlive) gameSounds.play("chicken_background");
        else gameSounds.stop("chicken_background");
    }

    /**
     * DE: Steuert die Schrittgeräusche.
     * EN: Update footsteps.
     */
    updateFootsteps() {
        const moving = this.keyboard.LEFT !== this.keyboard.RIGHT;
        const onGround = this.character.y === this.character.groundY;
        if (moving && onGround) gameSounds.play("steps");
        else gameSounds.stop("steps");
    }

    /**
     * DE: Aktualisiert mini boss sounds.
     * EN: Updates mini boss sounds.
     */
    updateMiniBossSounds() {
        this.level.enemies.filter(enemy => enemy instanceof MiniBoss).forEach(boss => {
            const visible = boss.x + boss.width > -this.camera_x &&
                boss.x < -this.camera_x + this.canvas.width;
            if (visible && !this.minibossSoundIds.has(boss) && !boss.isDead) {
                this.minibossSoundIds.add(boss);
                gameSounds.play("miniboss_llive");
            }
            if (boss.energy <= 0 && !this.minibossDeadIds.has(boss)) {
                this.minibossDeadIds.add(boss);
                gameSounds.play("miniboss_dead");
            }
        });
    }

    /**
     * DE: Prüft boss approach.
     * EN: Checks boss approach.
     */
    checkBossApproach() {
        const boss = this.getBoss();
        if (!boss || !this.bossUnlocked || this.bossSoundPlayed) return;
        if (Math.abs(this.character.x - boss.x) > 600) return;
        this.bossSoundPlayed = true;
        gameSounds.play("chicken_boss");
    }

    /**
     * DE: Startet die Kollisionsprüfung.
     * EN: Start collision loop.
     */
    startCollisionLoop() {
        this.collisionInterval = setInterval(() => {
            if (this.isDisposed || this.isGameOver || this.isWin || this.isPaused) return;
            if (this.character.energy <= 0) return;
            this.level.enemies.forEach(enemy => this.checkEnemyCollision(enemy));
            this.checkMainBossContact();
            this.checkCollectibleCollisions();
        }, 1000 / 60);
    }

    /**
     * DE: Legt Flaschen und Münzen für das Level an.
     * EN: Creates bottles and coins for the level.
     */
    configureCollectibles() {
        this.setupBottleBar();
        this.setupCoinBar();
        this.setupBossBar();
        this.bottles = this.createBottles();
        this.coins = this.createCoins();
    }

    /** DE: Richtet die Flaschenanzeige ein. EN: Sets up the bottle bar. */
    setupBottleBar() {
        this.bottleBar.IMAGES_HEALTH = [0,20,40,60,80,100].map(n =>
            `img/7_statusbars/1_statusbar/3_statusbar_bottle/orange/${n}.png`);
        this.bottleBar.loadImages(this.bottleBar.IMAGES_HEALTH);
        this.bottleBar.y = 42;
        this.bottleBar.setPercentage(0);
    }

    /** DE: Richtet die Münzanzeige ein. EN: Sets up the coin bar. */
    setupCoinBar() {
        this.coinBar.IMAGES_HEALTH = [0,20,40,60,80,100].map(n =>
            `img/7_statusbars/1_statusbar/1_statusbar_coin/green/${n}.png`);
        this.coinBar.loadImages(this.coinBar.IMAGES_HEALTH);
        this.coinBar.y = 84;
        this.coinBar.setPercentage(0);
    }

    /** DE: Richtet die Lebensanzeige des Bosses ein. EN: Sets up boss health. */
    setupBossBar() {
        this.bossBar = new StatusBar();
        this.bossBar.IMAGES_HEALTH = [0,20,40,60,80,100].map(n =>
            `img/7_statusbars/2_statusbar_endboss/blue/blue${n}.png`);
        this.bossBar.loadImages(this.bossBar.IMAGES_HEALTH);
        this.bossBar.setPercentage(100);
        this.bossBar.x = this.canvas.width - this.bossBar.width - 20;
        this.bossBar.y = 0;
    }

    /**
     * DE: Erstellt Sammelflaschen.
     * EN: Create bottles.
     */
    createBottles() {
        const count = this.levelNumber === 2 ? 9 : 8;
        const maxX = this.getBoss().x - 950;
        return Array.from({ length: count }, (_, index) => {
            const x = 550 + (maxX - 800) * (index + Math.random() * 0.4) / count;
            return new CollectibleBottle(x);
        });
    }

    /**
     * DE: Erstellt Münzen für das Level.
     * EN: Create coins.
     */
    createCoins() {
        const count = 50;
        return Array.from({ length: count }, (_, index) => this.createCoin(index, count));
    }

    /** DE: Erstellt eine Münze an ihrer Position. EN: Creates a coin at its position. */
    createCoin(index, count) {
        const x = this.getCoinX(index, count);
        const high = this.levelNumber === 2 ? index % 2 === 0 : index % 3 === 0;
        const y = high ? 140 + Math.random() * 35 : 245 + Math.random() * 30;
        const coin = new Coin(x, y);
        coin.behindCharacter = index % 2 === 0;
        return coin;
    }

    /** DE: Bestimmt die horizontale Münzposition. EN: Calculates coin x position. */
    getCoinX(index, count) {
        const behindCount = 8;
        const minX = this.level.level_start_x + 100;
        const maxX = this.getBoss().x - 1150;
        if (index < behindCount) return minX + (50 - minX) * (index + 0.4) / behindCount;
        return 450 + (maxX - 450) * (index - behindCount + 0.4) / (count - behindCount);
    }

    /**
     * DE: Aktualisiert coin bar.
     * EN: Updates coin bar.
     */
    updateCoinBar() {
        const percentage = Math.min(100, Math.floor(this.coinInventory / 10) * 20);
        this.coinBar.setPercentage(percentage);
    }

    /**
     * DE: Beginnt das Level.
     * EN: Start level.
     */
    startLevel() {
        this.levelIntroActive = false;
        this.isPaused = false;
        this.lastUpdate = performance.now();
        this.character.lastActivity = Date.now();
    }

    /**
     * DE: Aktualisiert Sammelobjekte.
     * EN: Update collectibles.
     */
    updateCollectibles() {
        const now = performance.now();
        const delta = Math.min(45, now - this.lastUpdate);
        this.lastUpdate = now;
        this.bottles.forEach(b => b.update(delta));
        this.updateBosses(delta);
        this.coins.forEach(c => c.update(delta));
        this.updateThrownBottles(delta);
    }

    /** DE: Aktualisiert die Bosse und prüft das Levelende. EN: Updates bosses and win conditions. */
    updateBosses(delta) {
        const bosses = this.level.enemies.filter(enemy => enemy instanceof Endboss);
        bosses.forEach(boss => {
            if (!boss.isMainBoss || this.bossUnlocked) boss.update(delta, this.character);
        });
        this.checkBossAttacks(bosses);
        if (this.getBoss()?.state === "finished") this.triggerWin();
        if (this.character.energy <= 0 && this.character.deathFinished) this.triggerGameOver();
    }

    /** DE: Aktualisiert geworfene Flaschen. EN: Updates thrown bottles. */
    updateThrownBottles(delta) {
        this.thrownBottles.forEach(b => this.updateThrownBottle(b, delta));
        this.thrownBottles = this.thrownBottles.filter(b => b.state !== "done");
    }

    /**
     * DE: Aktualisiert thrown bottle.
     * EN: Updates thrown bottle.
     * @param {ThrowableBottle} bottle - DE: Übergabewert bottle. EN: Argument bottle.
     * @param {number} delta - DE: Übergabewert delta. EN: Argument delta.
     */
    updateThrownBottle(bottle, delta) {
        const wasFlying = bottle.state === "flying";
        bottle.update(delta);
        if (wasFlying && bottle.state === "splash") this.applySplashDamage(bottle);
        if (bottle.state !== "flying") return;
        this.level.enemies.forEach(enemy => this.hitEnemyWithBottle(bottle, enemy));
    }

    /**
     * DE: Wendet an splash damage.
     * EN: Applies splash damage.
     * @param {ThrowableBottle} bottle - DE: Übergabewert bottle. EN: Argument bottle.
     */
    applySplashDamage(bottle) {
        this.level.enemies.forEach(enemy => {
            if (enemy.isDead || enemy.state === "dead" || enemy.state === "finished") return;
            if (enemy.isMainBoss && !this.bossUnlocked) return;
            const centerX = enemy.x + enemy.width / 2;
            const centerY = enemy.y + enemy.height / 2;
            const splashX = bottle.x + bottle.width / 2;
            const splashY = bottle.y + bottle.height / 2;
            if (Math.hypot(centerX - splashX, centerY - splashY) > 60) return;
            this.damageEnemyWithBottle(enemy, bottle);
        });
    }

    /**
     * DE: Verletzt enemy with bottle.
     * EN: Damages enemy with bottle.
     * @param {MovableObject} enemy - DE: Übergabewert enemy. EN: Argument enemy.
     * @param {ThrowableBottle} bottle - DE: Übergabewert bottle. EN: Argument bottle.
     */
    damageEnemyWithBottle(enemy, bottle) {
        if (bottle.damagedEnemies?.has(enemy)) return;
        if (!bottle.damagedEnemies) bottle.damagedEnemies = new Set();
        bottle.damagedEnemies.add(enemy);
        if (enemy instanceof chicken || enemy instanceof chickenSmall) enemy.die();
        else if (enemy instanceof Endboss) {
            gameSounds.play("boss_hit");
            enemy.takeBottleHit();
            if (enemy.isMainBoss) {
                this.bossBar.setPercentage(enemy.energy);
                if (enemy.energy <= 0) gameSounds.stop("chicken_boss");
            }
        }
    }

    /**
     * DE: Behandelt einen Flaschentreffer gegen einen Gegner.
     * EN: Handles a bottle hitting an enemy.
     * @param {CollectibleBottle} bottle - DE: bottle. EN: bottle.
     * @param {MovableObject} enemy - DE: enemy. EN: enemy.
     */
    hitEnemyWithBottle(bottle, enemy) {
        if (bottle.state !== "flying" || enemy.isDead) return;
        if (!bottle.isColliding?.(enemy) && !this.boxesOverlap(bottle, enemy)) return;
        if (enemy instanceof Endboss && enemy.isMainBoss && !this.bossUnlocked) return;
        this.applySplashDamage(bottle);
        this.damageEnemyWithBottle(enemy, bottle);
        bottle.splash();
    }

    /**
     * DE: Prüft, ob sich zwei rechteckige Trefferflächen überlappen.
     * EN: Checks if two rectangular hitboxes overlap.
     * @param {DrawableObject} a - DE: Übergabewert a. EN: Argument a.
     * @param {DrawableObject} b - DE: Übergabewert b. EN: Argument b.
     */
    boxesOverlap(a, b) {
        const aa = a.getHitbox(), bb = b.getHitbox();
        if (!aa || !bb) return false;
        return aa.x < bb.x + bb.width && aa.x + aa.width > bb.x &&
            aa.y < bb.y + bb.height && aa.y + aa.height > bb.y;
    }
}
