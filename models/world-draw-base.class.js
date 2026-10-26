class WorldDrawBase {
    /**
     * DE: Aktualisiert clouds für das Spiel.
     * EN: Updates clouds for the game.
     */
    updateClouds() {
        this.level.clouds.forEach(cloudObject => this.recycleCloud(cloudObject));
    }

    /**
     * DE: Führt recycle cloud im Spiel aus.
     * EN: Runs recycle cloud in the game.
     * @param {Object} cloudObject - DE: Wert cloudObject. EN: Value cloudObject.
     */
    recycleCloud(cloudObject) {
        const leftEdge = -this.camera_x;
        if (cloudObject.x + cloudObject.width >= leftEdge) return;
        cloudObject.resetPosition(this.getNextCloudX());
    }

    /**
     * DE: Gibt next cloud x für das Spiel.
     * EN: Returns next cloud x for the game.
     */
    getNextCloudX() {
        const rightEdge = -this.camera_x + this.canvas.width;
        const furthestCloud = Math.max(...this.level.clouds.map(cloudObject => cloudObject.x));
        const gap = 140 + Math.random() * 220;
        return Math.max(rightEdge, furthestCloud) + gap;
    }

    /**
     * DE: Aktualisiert camera für das Spiel.
     * EN: Updates camera for the game.
     */
    updateCamera() {
        const minCameraX = this.canvas.width - this.level.level_end_x;
        const maxCameraX = -this.level.level_start_x;
        const targetX = this.characterScreenX - this.character.x;
        this.camera_x = Math.max(minCameraX, Math.min(maxCameraX, targetX));
    }

    /**
     * DE: Führt trigger game over im Spiel aus.
     * EN: Runs trigger game over in the game.
     */
    triggerGameOver() {
        if (this.isGameOver) return;
        gameSounds.stopAll();
        gameSounds.play("gameover");
        this.isGameOver = true;
        this.character.clearTimers();
        document.getElementById("pauseBtn").classList.add("hidden");
        if (typeof this.onGameOver === "function") this.onGameOver();
    }

    /**
     * DE: Führt draw im Spiel aus.
     * EN: Runs draw in the game.
     */
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

    /**
     * DE: Zeichnet background and clouds für das Spiel.
     * EN: Draws background and clouds for the game.
     */
    drawBackgroundAndClouds() {
        this.ctx.save();
        this.ctx.translate(this.camera_x, 0);
        this.addObjectsToMap(this.level.backgroundObjects);
        this.addObjectsToMap(this.level.clouds);
        this.ctx.restore();
    }

    /**
     * DE: Zeichnet game scene für das Spiel.
     * EN: Draws game scene for the game.
     */
    drawGameScene() {
        this.ctx.save();
        this.ctx.translate(this.camera_x, 0);
        this.drawLevelActors();
        this.ctx.restore();
        this.drawStatusBars();
    }

    /**
     * DE: Zeichnet level actors für das Spiel.
     * EN: Draws level actors for the game.
     */
    drawLevelActors() {
        this.coins.filter(c => c.isVisible() && c.behindCharacter).forEach(c => this.addToMap(c));
        this.addToMap(this.character);
        this.addObjectsToMap(this.level.enemies.filter(enemy =>
            !(enemy.isMainBoss && !this.bossUnlocked)));
        this.bottles.filter(b => !b.collected).forEach(b => this.addToMap(b));
        this.coins.filter(c => c.isVisible() && !c.behindCharacter).forEach(c => this.addToMap(c));
        this.addObjectsToMap(this.thrownBottles);
    }

    /**
     * DE: Zeichnet status bars für das Spiel.
     * EN: Draws status bars for the game.
     */
    drawStatusBars() {
        this.addToMap(this.statusBar);
        this.addToMap(this.bottleBar);
        this.addToMap(this.coinBar);
        if (this.bossUnlocked && this.character.x >= this.getBoss().x - 600) this.addToMap(this.bossBar);
    }

    /**
     * DE: Zeichnet game over screen für das Spiel.
     * EN: Draws game over screen for the game.
     */
    drawGameOverScreen() {
        if (this.gameOverImage.complete && this.gameOverImage.naturalWidth) {
            this.ctx.drawImage(this.gameOverImage, 0, 0, this.canvas.width, this.canvas.height);
        }
    }

    /**
     * DE: Führt trigger win im Spiel aus.
     * EN: Runs trigger win in the game.
     */
    triggerWin() {
        if (this.isWin) return;
        gameSounds.stopAll();
        gameSounds.play("win");
        this.isWin = true;
        document.getElementById("pauseBtn").classList.add("hidden");
        this.character.clearTimers();
        if (this.onGameOver) this.onGameOver(true);
    }

    /**
     * DE: Zeichnet win screen für das Spiel.
     * EN: Draws win screen for the game.
     */
    drawWinScreen() {
        if (this.winImage.complete && this.winImage.naturalWidth)
            this.ctx.drawImage(this.winImage, 0, 0, this.canvas.width, this.canvas.height);
        this.ctx.save();
        this.setWinTextStyle();
        this.drawWinCoinText();
        this.ctx.restore();
    }

    /**
     * DE: Setzt win text style für das Spiel.
     * EN: Sets win text style for the game.
     */
    setWinTextStyle() {
        this.ctx.font = 'bold 32px "Averia Sans Libre", sans-serif';
        this.ctx.textAlign = "center";
        this.ctx.textBaseline = "middle";
        this.ctx.lineWidth = 5;
        this.ctx.lineJoin = "round";
        this.ctx.strokeStyle = "#5a3000";
        this.ctx.fillStyle = "#ffd84d";
    }

    /**
     * DE: Zeichnet win coin text für das Spiel.
     * EN: Draws win coin text for the game.
     */
    drawWinCoinText() {
        const coinText = `Coins collected: ${this.coinsCollected} / ${this.coins.length}`;
        this.ctx.strokeText(coinText, this.canvas.width / 2, this.canvas.height * 0.26);
        this.ctx.fillText(coinText, this.canvas.width / 2, this.canvas.height * 0.26);
    }

    /**
     * DE: Fügt objects to map für das Spiel.
     * EN: Adds objects to map for the game.
     * @param {Object} objects - DE: Wert objects. EN: Value objects.
     */
    addObjectsToMap(objects) {
        objects.forEach(object => this.addToMap(object));
    }

    /**
     * DE: Fügt to map für das Spiel.
     * EN: Adds to map for the game.
     * @param {MovableObject} movableObject - DE: Wert movableObject. EN: Value movableObject.
     */
    addToMap(movableObject) {
        this.ctx.save();
        if (movableObject.otherDirection) this.flipImage(movableObject);
        else this.drawImage(movableObject);
        this.ctx.restore();
        this.drawFrame(movableObject);
    }

    /**
     * DE: Zeichnet image für das Spiel.
     * EN: Draws image for the game.
     * @param {Object} drawableObject - DE: Wert drawableObject. EN: Value drawableObject.
     */
    drawImage(drawableObject) {
        if (!drawableObject || !drawableObject.img) return;
        if (!drawableObject.img.complete || !drawableObject.img.naturalWidth) return;
        this.ctx.drawImage(drawableObject.img, drawableObject.x, drawableObject.y,
            drawableObject.width, drawableObject.height);
    }

    /**
     * DE: Führt flip image im Spiel aus.
     * EN: Runs flip image in the game.
     * @param {MovableObject} movableObject - DE: Wert movableObject. EN: Value movableObject.
     */
    flipImage(movableObject) {
        if (!movableObject.img || !movableObject.img.complete) return;
        if (!movableObject.img.naturalWidth) return;
        this.ctx.translate(movableObject.x + movableObject.width, movableObject.y);
        this.ctx.scale(-1, 1);
        this.ctx.drawImage(movableObject.img, 0, 0, movableObject.width, movableObject.height);
    }

    /**
     * DE: Zeichnet frame für das Spiel.
     * EN: Draws frame for the game.
     * @param {MovableObject} movableObject - DE: Wert movableObject. EN: Value movableObject.
     */
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

    /**
     * DE: Führt should draw frame im Spiel aus.
     * EN: Runs should draw frame in the game.
     * @param {MovableObject} movableObject - DE: Wert movableObject. EN: Value movableObject.
     */
    shouldDrawFrame(movableObject) {
        return movableObject instanceof Character || movableObject instanceof chicken ||
            movableObject instanceof chickenSmall || movableObject instanceof Endboss;
    }

    /**
     * DE: Führt dispose im Spiel aus.
     * EN: Runs dispose in the game.
     */
    dispose() {
        gameSounds.stopAll();
        this.isDisposed = true;
        clearInterval(this.gameLoopInterval);
        clearInterval(this.collisionInterval);
        this.character.clearTimers();
        this.level.enemies.forEach(enemy => {
            if (enemy.clearTimers) enemy.clearTimers();
        });
        this.level.clouds.forEach(cloudObject => {
            if (cloudObject.clearTimers) cloudObject.clearTimers();
        });
    }
}
