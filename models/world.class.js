class World {
    character;
    statusBar;
    level = level1;
    canvas;
    ctx;
    keyboard;
    camera_x = -100;
    characterScreenX = 100;
    debugMode = false;

    constructor(canvas, keyboard) {
        this.ctx = canvas.getContext("2d");
        this.canvas = canvas;
        this.keyboard = keyboard;
        this.character = new Character(this.keyboard, this.level);
        this.statusBar = new StatusBar();
        this.character.x = this.characterScreenX - this.camera_x;
        this.startGameLoop();
        this.checkCollisions();
        this.draw();
    }

    startGameLoop() {
        setInterval(() => {
            this.character.updateMovement();
            this.updateCamera();
            this.updateClouds();
        }, 1000 / 60);
    }

    checkCollisions() {
        setInterval(() => {
            this.level.enemies.forEach(enemy => this.checkEnemyCollision(enemy));
        }, 200);
    }

    checkEnemyCollision(enemy) {
        if (!(enemy instanceof chicken) || enemy.isDead) return;
        if (this.character.energy <= 0) return;
        if (!this.character.isColliding(enemy)) return;
        if (this.isJumpAttack(enemy)) return this.killChicken(enemy);
        if (!this.isSideCollision(enemy)) return;
        this.character.takeDamage(5);
        this.statusBar.setPercentage(this.character.energy);
    }

    isJumpAttack(enemy) {
        const characterBox = this.character.getHitbox();
        const enemyBox = enemy.getHitbox();
        if (!characterBox || !enemyBox) return false;
        const characterBottom = characterBox.y + characterBox.height;
        const fromAbove = characterBottom <= enemyBox.y + 35;
        const overlapX = characterBox.x + characterBox.width > enemyBox.x &&
            characterBox.x < enemyBox.x + enemyBox.width;
        return this.character.speedY < 0 && fromAbove && overlapX;
    }

    killChicken(enemy) {
        enemy.die();
        this.character.bounceFromEnemy();
    }

    isSideCollision(enemy) {
        const characterBox = this.character.getHitbox();
        const enemyBox = enemy.getHitbox();
        if (!characterBox || !enemyBox) return false;
        const overlapX = Math.min(characterBox.x + characterBox.width, enemyBox.x + enemyBox.width) -
            Math.max(characterBox.x, enemyBox.x);
        const overlapY = Math.min(characterBox.y + characterBox.height, enemyBox.y + enemyBox.height) -
            Math.max(characterBox.y, enemyBox.y);
        return overlapX > 0 && overlapY > 0 && overlapX <= overlapY;
    }

    updateClouds() {
        this.level.clouds.forEach(cloudObject => this.recycleCloud(cloudObject));
    }

    recycleCloud(cloudObject) {
        const leftScreenEdge = -this.camera_x;
        if (cloudObject.x + cloudObject.width >= leftScreenEdge) return;
        cloudObject.resetPosition(this.getNextCloudX());
    }

    getNextCloudX() {
        const visibleRightEdge = -this.camera_x + this.canvas.width;
        const furthestCloud = Math.max(...this.level.clouds.map(cloudObject => cloudObject.x));
        const gap = 150 + Math.random() * 250;
        return Math.max(visibleRightEdge, furthestCloud) + gap;
    }

    updateCamera() {
        const minCameraX = this.canvas.width - this.level.level_end_x;
        const maxCameraX = -this.level.level_start_x;
        const targetX = this.characterScreenX - this.character.x;
        this.camera_x = Math.max(minCameraX, Math.min(maxCameraX, targetX));
    }

    draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.drawWorldObjects();
        this.addToMap(this.statusBar);
        requestAnimationFrame(() => this.draw());
    }

    drawWorldObjects() {
        this.ctx.save();
        this.ctx.translate(this.camera_x, 0);
        this.addObjectsToMap(this.level.backgroundObjects);
        this.addObjectsToMap(this.level.clouds);
        this.addToMap(this.character);
        this.addObjectsToMap(this.level.enemies);
        this.ctx.restore();
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
        this.ctx.drawImage(
            drawableObject.img,
            drawableObject.x,
            drawableObject.y,
            drawableObject.width,
            drawableObject.height
        );
    }

    flipImage(movableObject) {
        this.ctx.translate(movableObject.x + movableObject.width, movableObject.y);
        this.ctx.scale(-1, 1);
        this.ctx.drawImage(movableObject.img, 0, 0, movableObject.width, movableObject.height);
    }

    drawFrame(movableObject) {
        if (!this.debugMode || !this.shouldDrawFrame(movableObject)) return;
        const hitbox = movableObject.getHitbox();
        if (!hitbox) return;
        this.ctx.save();
        this.drawHitbox(hitbox);
        this.ctx.restore();
    }

    shouldDrawFrame(movableObject) {
        return movableObject instanceof Character ||
            movableObject instanceof chicken ||
            movableObject instanceof Endboss;
    }

    drawHitbox(hitbox) {
        this.ctx.beginPath();
        this.ctx.lineWidth = 2;
        this.ctx.strokeStyle = "transparent";
        this.ctx.rect(hitbox.x, hitbox.y, hitbox.width, hitbox.height);
        this.ctx.stroke();
    }
}
