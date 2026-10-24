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
    bottles = [];
    coins = [];
    thrownBottles = [];
    lastUpdate = performance.now();

    constructor(canvas, keyboard, onGameOver) {
        this.ctx = canvas.getContext("2d");
        this.canvas = canvas;
        this.keyboard = keyboard;
        this.onGameOver = onGameOver;
        this.gameOverImage = new Image();
        this.gameOverImage.src = "img/9_intro_outro_screens/game_over/game over.png";
        this.winImage = new Image();
        this.winImage.src = "img/You won, you lost/You won A.png";
        this.level = createLevel1();
        this.character = new Character(this.keyboard, this.level);
        this.statusBar = new StatusBar();
        this.bottleBar = new StatusBar();
        this.coinBar = new StatusBar();
        this.configureCollectibles();
        this.character.x = this.characterScreenX - this.camera_x;
        this.startGameLoop();
        this.startCollisionLoop();
        this.draw();
    }

    startGameLoop() {
        this.gameLoopInterval = setInterval(() => {
            if (this.isDisposed || this.isPaused) return;
            this.updateClouds();
            if (this.isGameOver || this.isWin) return;
            this.character.updateMovement();
            this.updateCamera();
            this.updateCollectibles();
        }, 1000 / 60);
    }

    startCollisionLoop() {
        this.collisionInterval = setInterval(() => {
            if (this.isDisposed || this.isGameOver || this.isWin || this.isPaused) return;
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
        return Array.from({ length: 6 }, (_, index) => {
            const x = 520 + index * 760 + Math.random() * 360;
            return new CollectibleBottle(x);
        });
    }

    createCoins() {
        return Array.from({ length: 20 }, (_, index) => {
            const x = 370 + index * 240 + Math.random() * 120;
            const y = index % 3 === 0 ? 190 + Math.random() * 35 : 265 + Math.random() * 70;
            return new Coin(x, y);
        });
    }

    updateCollectibles() {
        const now = performance.now();
        const delta = Math.min(45, now - this.lastUpdate);
        this.lastUpdate = now;
        this.bottles.forEach(b => b.update(delta));
        const boss = this.getBoss();
        if (boss) boss.update(delta);
        if (boss?.state === "finished") this.triggerWin();
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
            if (enemy.state !== "walking") return;
            enemy.takeBottleHit();
            this.bossBar.setPercentage(enemy.energy);
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
        this.coinValue = Math.min(100, this.coinValue + 5);
        this.coinBar.setPercentage(this.coinValue);
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
        return this.level.enemies.find(enemy => enemy instanceof Endboss);
    }

    togglePause() {
        this.isPaused = !this.isPaused;
        this.lastUpdate = performance.now();
        if (!this.isPaused) this.character.lastActivity = Date.now();
        return this.isPaused;
    }

    checkEnemyCollision(enemy) {
        const isChicken = enemy instanceof chicken || enemy instanceof chickenSmall;
        if (!isChicken || enemy.isDead || this.character.energy <= 0) return;
        if (!this.character.isColliding(enemy)) return;
        if (this.isJumpAttack(enemy)) return this.killChicken(enemy);
        if (!this.canChickenDamageCharacter(enemy)) return;
        if (!this.canTakeHitFrom(enemy)) return;
        this.character.takeDamage(5);
        enemy.lastHitPosition = { x: this.character.x, y: this.character.y };
        this.statusBar.setPercentage(this.character.energy);
        if (this.character.energy <= 0) this.triggerGameOver();
    }

    isJumpAttack(enemy) {
        const player = this.character.getHitbox();
        const target = enemy.getHitbox();
        if (!player || !target || this.character.speedY >= 0) return false;
        const bottom = player.y + player.height;
        const previousBottom = bottom + this.character.speedY;
        const reachesTop = previousBottom <= target.y + 18 && bottom >= target.y;
        const overTop = bottom <= target.y + Math.min(32, target.height * 0.6);
        const overlapsWidth = player.x < target.x + target.width &&
            player.x + player.width > target.x;
        return overlapsWidth && (reachesTop || overTop);
    }

    canChickenDamageCharacter(enemy) {
        const player = this.character.getHitbox();
        const target = enemy.getHitbox();
        if (!player || !target) return false;
        const horizontal = player.x < target.x + target.width &&
            player.x + player.width > target.x;
        const feet = player.y + player.height;
        return horizontal && feet > target.y && player.y < target.y + target.height;
    }

    canTakeHitFrom(enemy) {
        if (!enemy.lastHitPosition) return true;
        const dx = this.character.x - enemy.lastHitPosition.x;
        const dy = this.character.y - enemy.lastHitPosition.y;
        return Math.hypot(dx, dy) >= 45;
    }

    killChicken(enemy) {
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
        this.addObjectsToMap(this.level.enemies);
        this.bottles.filter(b => !b.collected).forEach(b => this.addToMap(b));
        this.coins.filter(c => c.isVisible()).forEach(c => this.addToMap(c));
        this.addObjectsToMap(this.thrownBottles);
        this.ctx.restore();
        this.addToMap(this.statusBar);
        this.addToMap(this.bottleBar);
        this.addToMap(this.coinBar);
        if (this.character.x >= this.getBoss().x - 600) this.addToMap(this.bossBar);
    }

    drawGameOverScreen() {
        if (this.gameOverImage.complete && this.gameOverImage.naturalWidth) {
            this.ctx.drawImage(this.gameOverImage, 0, 0, this.canvas.width, this.canvas.height);
        }
    }

    triggerWin() {
        if (this.isWin) return;
        this.isWin = true;
        document.getElementById("pauseBtn").classList.add("hidden");
        this.character.clearTimers();
        this.onGameOver?.();
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
        this.isDisposed = true;
        clearInterval(this.gameLoopInterval);
        clearInterval(this.collisionInterval);
        this.character.clearTimers();
        this.level.enemies.forEach(enemy => enemy.clearTimers?.());
        this.level.clouds.forEach(cloudObject => cloudObject.clearTimers?.());
    }
}
