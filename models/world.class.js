class World {
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
    bossUnlocked = false;
    bossSoundPlayed = false;
    levelIntroActive = true;
    bottles = [];
    coins = [];
    thrownBottles = [];
    lastUpdate = performance.now();

    constructor(canvas, keyboard, onGameOver, levelNumber = 1) {
        this.ctx = canvas.getContext("2d");
        this.canvas = canvas;
        this.keyboard = keyboard;
        this.onGameOver = onGameOver;
        this.gameOverImage = new Image();
        this.gameOverImage.src = "img/9_intro_outro_screens/game_over/game over.png";
        this.winImage = new Image();
        this.winImage.src = "img/You won, you lost/You won A.png";
        this.levelNumber = levelNumber;
        this.level = levelNumber === 2 ? createLevel2() : createLevel1();
        this.character = new Character(this.keyboard, this.level);
        this.statusBar = new StatusBar();
        this.bottleBar = new StatusBar();
        this.coinBar = new StatusBar();
        this.configureCollectibles();
        this.character.x = this.characterScreenX - this.camera_x;
        this.isPaused = true;
        this.startGameLoop();
        this.startCollisionLoop();
        this.draw();
    }

    startGameLoop() {
        this.gameLoopInterval = setInterval(() => {
            if (this.isDisposed || this.isPaused) return;
            this.updateAmbientSounds();
            this.updateClouds();
            if (this.isGameOver || this.isWin) return;
            if (this.character.energy <= 0) {
                if (this.character.deathFinished) this.triggerGameOver();
                return;
            }
            this.character.updateMovement();
            this.updateFootsteps();
            this.checkBossApproach();
            this.updateCamera();
            this.updateCollectibles();
        }, 1000 / 60);
    }

    /** Plays wind throughout active play and chickens only while small ones remain alive. */
    updateAmbientSounds() {
        if (this.isGameOver || this.isWin) return;
        gameSounds.play("wind");
        const smallChickensAlive = this.level.enemies.some(enemy =>
            enemy instanceof chickenSmall && !enemy.isDead);
        if (smallChickensAlive) gameSounds.play("chicken_background");
        else gameSounds.stop("chicken_background");
    }

    updateFootsteps() {
        const moving = this.keyboard.LEFT !== this.keyboard.RIGHT;
        const onGround = this.character.y === this.character.groundY;
        if (moving && onGround) gameSounds.play("steps");
        else gameSounds.stop("steps");
    }

    checkBossApproach() {
        const boss = this.getBoss();
        if (!boss || !this.bossUnlocked || this.bossSoundPlayed) return;
        if (Math.abs(this.character.x - boss.x) > 600) return;
        this.bossSoundPlayed = true;
        gameSounds.play("chicken_boss");
    }

    startCollisionLoop() {
        this.collisionInterval = setInterval(() => {
            if (this.isDisposed || this.isGameOver || this.isWin || this.isPaused) return;
            if (this.character.energy <= 0) return;
            this.level.enemies.forEach(enemy => this.checkEnemyCollision(enemy));
            this.checkCollectibleCollisions();
        }, 1000 / 60);
    }

    configureCollectibles() {
        this.bottleBar.IMAGES_HEALTH = [0,20,40,60,80,100].map(n =>
            `img/7_statusbars/1_statusbar/3_statusbar_bottle/orange/${n}.png`);
        this.coinBar.IMAGES_HEALTH = [0,20,40,60,80,100].map(n =>
            `img/7_statusbars/1_statusbar/1_statusbar_coin/green/${n}.png`);
        this.bottleBar.loadImages(this.bottleBar.IMAGES_HEALTH);
        this.coinBar.loadImages(this.coinBar.IMAGES_HEALTH);
        this.bottleBar.y = 42;
        this.coinBar.y = 84;
        this.bottleBar.setPercentage(0);
        this.coinBar.setPercentage(0);
        this.bossBar = new StatusBar();
        this.bossBar.IMAGES_HEALTH = [0,20,40,60,80,100].map(n =>
            `img/7_statusbars/2_statusbar_endboss/blue/blue${n}.png`);
        this.bossBar.loadImages(this.bossBar.IMAGES_HEALTH);
        this.bossBar.setPercentage(100);
        this.bossBar.x = this.canvas.width - this.bossBar.width - 20;
        this.bossBar.y = 0;
        this.bottles = this.createBottles();
        this.coins = this.createCoins();
    }

    createBottles() {
        const count = this.levelNumber === 2 ? 9 : 5;
        const maxX = this.getBoss().x - 950;
        return Array.from({ length: count }, (_, index) => {
            const x = 550 + (maxX - 800) * (index + Math.random() * 0.4) / count;
            return new CollectibleBottle(x);
        });
    }

    createCoins() {
        const maxX = this.getBoss().x - 1150;
        return Array.from({ length: 5 }, (_, index) => {
            const x = 400 + (maxX - 650) * (index + 0.4) / 5;
            const high = this.levelNumber === 2 ? index % 2 === 0 : index % 3 === 0;
            const y = high ? 140 + Math.random() * 35 : 245 + Math.random() * 30;
            return new Coin(x, y);
        });
    }

    startLevel() {
        this.levelIntroActive = false;
        this.isPaused = false;
        this.lastUpdate = performance.now();
        this.character.lastActivity = Date.now();
    }

    updateCollectibles() {
        const now = performance.now();
        const delta = Math.min(45, now - this.lastUpdate);
        this.lastUpdate = now;
        this.bottles.forEach(b => b.update(delta));
        const bosses = this.level.enemies.filter(enemy => enemy instanceof Endboss);
        bosses.forEach(boss => {
            if (!boss.isMainBoss || this.bossUnlocked) boss.update(delta, this.character);
        });
        this.checkBossAttacks(bosses);
        if (this.getBoss()?.state === "finished") this.triggerWin();
        if (this.character.energy <= 0 && this.character.deathFinished) this.triggerGameOver();
        this.coins.forEach(c => c.update(delta));
        this.thrownBottles.forEach(b => this.updateThrownBottle(b, delta));
        this.thrownBottles = this.thrownBottles.filter(b => b.state !== "done");
    }

    updateThrownBottle(bottle, delta) {
        bottle.update(delta);
        if (bottle.state !== "flying") return;
        this.level.enemies.forEach(enemy => this.hitEnemyWithBottle(bottle, enemy));
    }

    hitEnemyWithBottle(bottle, enemy) {
        if (bottle.state !== "flying" || enemy.isDead) return;
        if (!bottle.isColliding?.(enemy) && !this.boxesOverlap(bottle, enemy)) return;
        if (enemy instanceof chicken || enemy instanceof chickenSmall) enemy.die();
        else if (enemy instanceof Endboss) {
            if (enemy.state === "dead" || enemy.state === "finished") return;
            if (enemy.isMainBoss && !this.bossUnlocked) return;
            enemy.takeBottleHit();
            if (enemy.isMainBoss) this.bossBar.setPercentage(enemy.energy);
        }
        bottle.splash();
    }

    boxesOverlap(a, b) {
        const aa = a.getHitbox(), bb = b.getHitbox();
        if (!aa || !bb) return false;
        return aa.x < bb.x + bb.width && aa.x + aa.width > bb.x &&
            aa.y < bb.y + bb.height && aa.y + aa.height > bb.y;
    }

    checkCollectibleCollisions() {
        this.bottles.forEach(b => this.pickupBottle(b));
        this.coins.forEach(c => this.pickupCoin(c));
    }

    pickupBottle(bottle) {
        if (bottle.collected || this.bottleCount >= 20) return;
        if (!this.boxesOverlap(this.character, bottle)) return;
        bottle.collect();
        this.bottleCount = Math.min(20, this.bottleCount + 4);
        this.bottleBar.setPercentage(this.getBottlePercentage());
    }

    pickupCoin(coin) {
        if (coin.collected || !this.boxesOverlap(this.character, coin)) return;
        coin.collect();
        this.coinsCollected++;
        this.coinValue = Math.min(100, this.coinsCollected * 20);
        this.bossUnlocked = this.coinsCollected === this.coins.length;
        this.coinBar.setPercentage(this.coinValue);
        this.character.energy = Math.min(100, this.character.energy + 10);
        this.statusBar.setPercentage(this.character.energy);
    }

    throwBottle(power = 1) {
        if (this.isGameOver || this.isWin || this.isPaused || this.bottleCount <= 0) return;
        const dir = this.character.otherDirection ? -1 : 1;
        const x = this.character.x + (dir === 1 ? this.character.width - 75 : 20);
        this.thrownBottles.push(new ThrowableBottle(x, this.character.y + 65, dir, power));
        this.bottleCount--;
        this.bottleBar.setPercentage(this.getBottlePercentage());
    }

    getBottlePercentage() {
        return Math.ceil(this.bottleCount / 4) * 20;
    }

    getBoss() {
        return this.level.enemies.find(enemy => enemy instanceof Endboss && enemy.isMainBoss);
    }

    togglePause() {
        if (this.levelIntroActive) return true;
        this.isPaused = !this.isPaused;
        if (this.isPaused) gameSounds.stopAll();
        this.lastUpdate = performance.now();
        if (!this.isPaused) this.character.lastActivity = Date.now();
        return this.isPaused;
    }

    /** Deals damage when the moving boss attacks at close range. */
    checkBossAttacks(bosses) {
        bosses.forEach(boss => {
            if (boss.isMainBoss && !this.bossUnlocked) return;
            if (!boss.moving || boss.state !== "attack" || boss.frame !== 4) return;
            if (boss.attackHitDone || this.character.energy <= 0) return;
            if (Math.abs(boss.x - this.character.x) > 180) return;
            boss.attackHitDone = true;
            this.character.takeDamage(this.levelNumber === 2 ? 20 : 10);
            this.statusBar.setPercentage(this.character.energy);
        });
    }

    checkEnemyCollision(enemy) {
        const isChicken = enemy instanceof chicken || enemy instanceof chickenSmall;
        if (enemy instanceof MiniBoss && !enemy.isDead) {
            if (this.character.isColliding(enemy) && this.canTakeHitFrom(enemy)) {
                this.character.takeDamage(this.levelNumber === 2 ? 20 : 10);
                enemy.lastHitPosition = { x: this.character.x, y: this.character.y };
                this.statusBar.setPercentage(this.character.energy);
            }
            return;
        }
        if (!isChicken || enemy.isDead || this.character.energy <= 0) return;
        if (!this.character.isColliding(enemy)) return;
        if (this.isJumpAttack(enemy)) return this.killChicken(enemy);
        if (!this.canChickenDamageCharacter(enemy) || !this.canTakeHitFrom(enemy)) return;
        this.character.takeDamage(this.levelNumber === 2 ? 10 : 5);
        enemy.lastHitPosition = { x: this.character.x, y: this.character.y };
        this.statusBar.setPercentage(this.character.energy);
    }

    /** Descending onto any horizontal part of a chicken counts as a stomp. */
    isJumpAttack(enemy) {
        const player = this.character.getHitbox();
        const target = enemy.getHitbox();
        if (!player || !target || this.character.speedY >= 0) return false;
        const feet = player.y + player.height;
        const startedAbove = this.character.jumpStartedAboveEnemy(enemy);
        return startedAbove && feet >= target.y && player.y < target.y;
    }

    /** A chicken only hurts Pepe when their bodies touch from the side. */
    canChickenDamageCharacter(enemy) {
        const player = this.character.getHitbox();
        const target = enemy.getHitbox();
        if (!player || !target) return false;
        if (this.character.isDescendingOnto(enemy)) return false;
        return player.y + player.height > target.y + target.height * 0.35 &&
            player.y < target.y + target.height;
    }

    canTakeHitFrom(enemy) {
        if (!enemy.lastHitPosition) return true;
        const dx = this.character.x - enemy.lastHitPosition.x;
        const dy = this.character.y - enemy.lastHitPosition.y;
        return Math.hypot(dx, dy) >= 45;
    }

    killChicken(enemy) {
        gameSounds.play("hit_chickens");
        enemy.die();
        this.character.bounceFromEnemy();
    }

    updateClouds() {
        this.level.clouds.forEach(cloudObject => this.recycleCloud(cloudObject));
    }

    recycleCloud(cloudObject) {
        const leftEdge = -this.camera_x;
        if (cloudObject.x + cloudObject.width >= leftEdge) return;
        cloudObject.resetPosition(this.getNextCloudX());
    }

    getNextCloudX() {
        const rightEdge = -this.camera_x + this.canvas.width;
        const furthestCloud = Math.max(...this.level.clouds.map(cloudObject => cloudObject.x));
        const gap = 140 + Math.random() * 220;
        return Math.max(rightEdge, furthestCloud) + gap;
    }

    updateCamera() {
        const minCameraX = this.canvas.width - this.level.level_end_x;
        const maxCameraX = -this.level.level_start_x;
        const targetX = this.characterScreenX - this.character.x;
        this.camera_x = Math.max(minCameraX, Math.min(maxCameraX, targetX));
    }

    triggerGameOver() {
        if (this.isGameOver) return;
        gameSounds.stopAll();
        this.isGameOver = true;
        this.character.clearTimers();
        document.getElementById("pauseBtn").classList.add("hidden");
        if (typeof this.onGameOver === "function") this.onGameOver();
    }

    draw() {
        if (this.isDisposed) return;
        if (this.isPaused) return requestAnimationFrame(() => this.draw());
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.drawBackgroundAndClouds();
        if (this.isGameOver) this.drawGameOverScreen();
        else if (this.isWin) this.drawWinScreen();
        else this.drawGameScene();
        requestAnimationFrame(() => this.draw());
    }

    drawBackgroundAndClouds() {
        this.ctx.save();
        this.ctx.translate(this.camera_x, 0);
        this.addObjectsToMap(this.level.backgroundObjects);
        this.addObjectsToMap(this.level.clouds);
        this.ctx.restore();
    }

    drawGameScene() {
        this.ctx.save();
        this.ctx.translate(this.camera_x, 0);
        this.addToMap(this.character);
        this.addObjectsToMap(this.level.enemies.filter(enemy =>
            !(enemy.isMainBoss && !this.bossUnlocked)));
        this.bottles.filter(b => !b.collected).forEach(b => this.addToMap(b));
        this.coins.filter(c => c.isVisible()).forEach(c => this.addToMap(c));
        this.addObjectsToMap(this.thrownBottles);
        this.ctx.restore();
        this.addToMap(this.statusBar);
        this.addToMap(this.bottleBar);
        this.addToMap(this.coinBar);
        if (this.bossUnlocked && this.character.x >= this.getBoss().x - 600) this.addToMap(this.bossBar);
    }

    drawGameOverScreen() {
        if (this.gameOverImage.complete && this.gameOverImage.naturalWidth) {
            this.ctx.drawImage(this.gameOverImage, 0, 0, this.canvas.width, this.canvas.height);
        }
    }

    triggerWin() {
        if (this.isWin) return;
        gameSounds.stopAll();
        gameSounds.play("win");
        this.isWin = true;
        document.getElementById("pauseBtn").classList.add("hidden");
        this.character.clearTimers();
        this.onGameOver?.(true);
    }

    drawWinScreen() {
        if (this.winImage.complete && this.winImage.naturalWidth)
            this.ctx.drawImage(this.winImage, 0, 0, this.canvas.width, this.canvas.height);
    }

    addObjectsToMap(objects) {
        objects.forEach(object => this.addToMap(object));
    }

    addToMap(movableObject) {
        this.ctx.save();
        if (movableObject.otherDirection) this.flipImage(movableObject);
        else this.drawImage(movableObject);
        this.ctx.restore();
        this.drawFrame(movableObject);
    }

    drawImage(drawableObject) {
        if (!drawableObject?.img?.complete || !drawableObject.img.naturalWidth) return;
        this.ctx.drawImage(drawableObject.img, drawableObject.x, drawableObject.y,
            drawableObject.width, drawableObject.height);
    }

    flipImage(movableObject) {
        if (!movableObject.img?.complete || !movableObject.img.naturalWidth) return;
        this.ctx.translate(movableObject.x + movableObject.width, movableObject.y);
        this.ctx.scale(-1, 1);
        this.ctx.drawImage(movableObject.img, 0, 0, movableObject.width, movableObject.height);
    }

    drawFrame(movableObject) {
        if (!this.debugMode || !this.shouldDrawFrame(movableObject)) return;
        const hitbox = movableObject.getHitbox();
        if (!hitbox) return;
        this.ctx.beginPath();
        this.ctx.lineWidth = 2;
        this.ctx.strokeStyle = "transparent";
        this.ctx.rect(hitbox.x, hitbox.y, hitbox.width, hitbox.height);
        this.ctx.stroke();
    }

    shouldDrawFrame(movableObject) {
        return movableObject instanceof Character || movableObject instanceof chicken ||
            movableObject instanceof chickenSmall || movableObject instanceof Endboss;
    }

    dispose() {
        gameSounds.stopAll();
        this.isDisposed = true;
        clearInterval(this.gameLoopInterval);
        clearInterval(this.collisionInterval);
        this.character.clearTimers();
        this.level.enemies.forEach(enemy => enemy.clearTimers?.());
        this.level.clouds.forEach(cloudObject => cloudObject.clearTimers?.());
    }
}
