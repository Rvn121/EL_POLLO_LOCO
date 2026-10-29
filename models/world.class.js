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
    minibossSoundIds = [];
    minibossDeadIds = [];
    bossUnlocked = false;
    levelIntroActive = true;
    bottles = [];
    coins = [];
    signs = [];
    thrownBottles = [];
    lastUpdate = Date.now();
    /**
     * Initializes this object and sets up its required game data.
     * @param {*} canvas - The canvas used for drawing.
     * @param {*} keyboard - The keyboard input state.
     * @param {*} onGameOver - The on game over used by this method.
     * @param {number} levelNumber - The level number used by this method.
     */
    constructor(canvas, keyboard, onGameOver, levelNumber = 1) {
        super();
        this.setupCanvas(canvas, keyboard, onGameOver);
        this.setupWorld(levelNumber);
        this.startGameLoop();
        this.startCollisionLoop();
        this.draw();
    }
    /**
     * Stores the canvas and its drawing context.
     * @param {*} canvas - The canvas used for drawing.
     * @param {*} keyboard - The keyboard input state.
     * @param {*} onGameOver - The on game over used by this method.
     */
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
    /**
     * Creates the player, level objects, and status bars.
     * @param {number} levelNumber - The level number used by this method.
     */
    setupWorld(levelNumber) {
        this.levelNumber = levelNumber;
        if (levelNumber === 2) this.level = createLevel2();
        else this.level = createLevel1();
        this.character = new Character(this.keyboard, this.level);
        this.statusBar = new StatusBar();
        this.bottleBar = new StatusBar();
        this.coinBar = new StatusBar();
        this.configureCollectibles();
        this.character.x = this.characterScreenX - this.camera_x;
        this.signs = this.createLevelSigns();
        this.isPaused = true;
    }


    /**
     * Starts the timer that updates the current game world.
     */
    startGameLoop() {
        this.gameLoopInterval = setInterval(() => this.updateGame(), 1000 / 60);
    }
    /**
     * Runs one update cycle for the current game state.
     */
    updateGame() {
        if (this.isDisposed || this.isPaused) return;
        this.updateAmbientSounds();
        this.updateClouds();
        if (this.isGameOver || this.isWin) return;
        if (this.character.energy <= 0) return this.checkCharacterDeath();
        if (this.checkChickenEscape()) return;
        this.updateActiveGame();
    }
    /**
     * Checks whether a living chicken has passed the level boundary.
     */
    checkChickenEscape() {
        let escaped = false;
        for (let i = 0; i < this.level.enemies.length; i++) {
            const enemy = this.level.enemies[i];
            const isChicken = enemy instanceof chicken || enemy instanceof chickenSmall;
            if (isChicken && !enemy.isDead && enemy.x + enemy.width < this.level.level_start_x) escaped = true;
        }
        if (escaped) this.triggerGameOver("Chickens escaped!");
        return escaped;
    }

    /**
     * Checks whether the character has died and triggers Game Over.
     */
    checkCharacterDeath() {
        if (this.character.deathFinished) this.triggerGameOver();
    }
    /**
     * Updates player movement, camera, collectibles, and boss behavior.
     */
    updateActiveGame() {
        this.updateBossUnlock();
        this.character.updateMovement();
        this.updateFootsteps();
        this.updateCamera();
        this.checkBossApproach();
        this.updateCollectibles();
        this.updateMiniBossSounds();
    }
    /**
     * Starts or stops background sounds based on active enemies.
     */
    updateAmbientSounds() {
        if (this.isGameOver || this.isWin) return;
        gameSounds.play("wind");
        let anyChickensAlive = false;
        for (const enemy of this.level.enemies) {
            if ((enemy instanceof chickenSmall || enemy instanceof chicken) && !enemy.isDead) {
                anyChickensAlive = true;
                break;
            }
        }
        if (anyChickensAlive) gameSounds.play("chicken_background");
        else gameSounds.stop("chicken_background");
    }
    /**
     * Plays footsteps only while the character is walking on the ground.
     */
    updateFootsteps() {
        const moving = this.keyboard.LEFT !== this.keyboard.RIGHT;
        const onGround = this.character.y === this.character.groundY;
        if (moving && onGround) gameSounds.play("steps");
        else gameSounds.stop("steps");
    }
    /**
     * Starts mini-boss sounds when mini-bosses become visible.
     */
    updateMiniBossSounds() {
        this.level.enemies.forEach(boss => this.checkMiniBossSound(boss));
    }

    /**
     * Checks whether a mini-boss needs an entrance or death sound.
     * @param {*} boss - The boss being updated.
     */
    checkMiniBossSound(boss) {
        if (!(boss instanceof MiniBoss)) return;
        const visible = boss.x + boss.width > -this.camera_x &&
            boss.x < -this.camera_x + this.canvas.width;
        if (visible && this.minibossSoundIds.indexOf(boss) === -1 && !boss.isDead) {
            this.minibossSoundIds.push(boss);
            gameSounds.play("miniboss_llive");
        }
        if (boss.energy <= 0 && this.minibossDeadIds.indexOf(boss) === -1) {
            this.minibossDeadIds.push(boss);
            gameSounds.play("miniboss_dead");
        }
    }
    /**
     * Starts the main boss audio when the player approaches it.
     */
    checkBossApproach() {
        const boss = this.getBoss();
        const margin = 80;
        const left = -this.camera_x;
        const right = left + this.canvas.width;
        const nearScreen = boss && boss.x + boss.width > left - margin && boss.x < right + margin;
        if (nearScreen && this.bossUnlocked && boss.energy > 0 && !boss.isDead) {
            gameSounds.play("chicken_boss");
        } else {
            gameSounds.stop("chicken_boss");
        }
    }
    /**
     * Starts regular collision checks for enemies and collectibles.
     */
    startCollisionLoop() {
        this.collisionInterval = setInterval(() => {
            if (this.isDisposed || this.isGameOver || this.isWin || this.isPaused) return;
            if (this.character.energy <= 0) return;
            this.level.enemies.forEach(enemy => this.checkEnemyCollision(enemy));
            this.checkCollectibleCollisions();
        }, 1000 / 60);
    }
    /**
     * Creates the coins and bottles for the current level.
     */
    configureCollectibles() {
        this.setupBottleBar();
        this.setupCoinBar();
        this.setupBossBar();
        this.bottles = this.createBottles();
        this.coins = this.createCoins();
    }

    /**
     * Creates the bottle inventory status bar.
     */
    setupBottleBar() {
        this.bottleBar.IMAGES_HEALTH = this.createBarImages("img/7_statusbars/1_statusbar/3_statusbar_bottle/orange/", "");
        this.bottleBar.loadImages(this.bottleBar.IMAGES_HEALTH);
        this.bottleBar.y = 42;
        this.bottleBar.setPercentage(0);
    }
    /**
     * Creates the collected-coin status bar.
     */
    setupCoinBar() {
        this.coinBar.IMAGES_HEALTH = this.createBarImages("img/7_statusbars/1_statusbar/1_statusbar_coin/green/", "");
        this.coinBar.loadImages(this.coinBar.IMAGES_HEALTH);
        this.coinBar.y = 84;
        this.coinBar.setPercentage(0);
    }
    /**
     * Creates the main boss health status bar.
     */
    setupBossBar() {
        this.bossBar = new StatusBar();
        this.bossBar.IMAGES_HEALTH = this.createBarImages("img/7_statusbars/2_statusbar_endboss/blue/blue", "");
        this.bossBar.loadImages(this.bossBar.IMAGES_HEALTH);
        this.bossBar.setPercentage(100);
        this.bossBar.x = this.canvas.width - this.bossBar.width - 20;
        this.bossBar.y = 0;
    }



    /**
     * Places collectible coins across the level.
     */
    createCoins() {
        const count = 5;
        const coins = [];
        for (let index = 0; index < count; index++) coins.push(this.createCoin(index, count));
        return coins;
    }


    /**
     * Updates the coin status bar after a coin is collected.
     */
    updateCoinBar() {
        const percentage = Math.min(100, this.coinInventory * 20);
        this.coinBar.setPercentage(percentage);
    }

    /**
     * Starts normal gameplay after the level introduction.
     */
    startLevel() {
        this.levelIntroActive = false;
        this.isPaused = false;
        this.lastUpdate = Date.now();
        this.character.lastActivity = Date.now();
    }

    /**
     * Updates coins and bottles that are active in the level.
     */
    updateCollectibles() {
        const now = Date.now();
        const delta = Math.min(45, now - this.lastUpdate);
        this.lastUpdate = now;
        this.bottles.forEach(b => b.update(delta));
        this.updateBosses(delta);
        this.coins.forEach(c => c.update(delta));
        this.updateThrownBottles(delta);
    }

    /**
     * Updates the movements and animations of living bosses.
     * @param {number} delta - The delta used by this method.
     */
    updateBosses(delta) {
        const bosses = [];
        for (const enemy of this.level.enemies) {
            if (enemy instanceof Endboss) bosses.push(enemy);
        }
        bosses.forEach(boss => {
            if (!boss.isMainBoss || this.bossUnlocked) boss.update(delta, this.character);
        });
        this.checkBossAttacks(bosses);
        const boss = this.getBoss();
        if (boss && boss.state === "finished") this.triggerWin();
        if (this.character.energy <= 0 && this.character.deathFinished) this.triggerGameOver();
    }

    /**
     * Updates all bottles that are currently flying or splashing.
     * @param {number} delta - The delta used by this method.
     */
    updateThrownBottles(delta) {
        this.thrownBottles.forEach(b => this.updateThrownBottle(b, delta));
        const activeBottles = [];
        for (const bottle of this.thrownBottles) {
            if (bottle.state !== "done") activeBottles.push(bottle);
        }
        this.thrownBottles = activeBottles;
    }

    /**
     * Updates one thrown bottle and checks its impact.
     * @param {*} bottle - The bottle being collected or thrown.
     * @param {number} delta - The delta used by this method.
     */
    updateThrownBottle(bottle, delta) {
        const wasFlying = bottle.state === "flying";
        bottle.update(delta);
        if (wasFlying && bottle.state === "splash") this.applySplashDamage(bottle);
        if (bottle.state !== "flying") return;
        this.level.enemies.forEach(enemy => this.hitEnemyWithBottle(bottle, enemy));
    }

    /**
     * Damages enemies within range of a bottle impact.
     * @param {*} bottle - The bottle being collected or thrown.
     */
    applySplashDamage(bottle) {
        const x = bottle.x + bottle.width / 2;
        const y = bottle.y + bottle.height / 2;
        this.level.enemies.forEach(enemy => {
            if (enemy.isDead || enemy.state === "dead" || enemy.state === "finished") return;
            if (enemy.isMainBoss && !this.bossUnlocked) return;
            const area = this.getBottleTargetArea(enemy);
            if (!area || !this.isWithinSplashRadius(x, y, area)) return;
            this.damageEnemyWithBottle(enemy, bottle);
        });
    }

    /**
     * Checks whether a target overlaps the bottle impact radius.
     * @param {number} x - The horizontal coordinate.
     * @param {number} y - The vertical coordinate.
     * @param {*} area - The area used by this method.
     */
    isWithinSplashRadius(x, y, area) {
        const nearestX = Math.max(area.x, Math.min(x, area.x + area.width));
        const nearestY = Math.max(area.y, Math.min(y, area.y + area.height));
        const dx = x - nearestX;
        const dy = y - nearestY;
        return dx * dx + dy * dy <= 13 * 13;
    }

    /**
     * Returns the area in which a bottle can damage a target.
     * @param {*} enemy - The enemy involved in the collision.
     */
    getBottleTargetArea(enemy) {
        if (!(enemy instanceof Endboss)) return enemy.getHitbox();
        return { x: enemy.x, y: enemy.y, width: enemy.width, height: enemy.height };
    }


}
