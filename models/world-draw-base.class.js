class WorldDrawBase {
    /**
     * DE: Aktualisiert clouds.
     * EN: Updates clouds.
     */
    updateClouds() {
        this.level.clouds.forEach(cloudObject => this.recycleCloud(cloudObject));
    }

    /**
     * DE: Setzt zurück cloud.
     * EN: Recycles cloud.
     * @param {Object} cloudObject - DE: Übergabewert cloudObject. EN: Argument cloudObject.
     */
    recycleCloud(cloudObject) {
        const leftEdge = -this.camera_x;
        if (cloudObject.x + cloudObject.width >= leftEdge) return;
        cloudObject.resetPosition(this.getNextCloudX());
    }

    /**
     * DE: Liefert next cloud x.
     * EN: Returns next cloud x.
     */
    getNextCloudX() {
        const rightEdge = -this.camera_x + this.canvas.width;
        const furthestCloud = Math.max(...this.level.clouds.map(cloudObject => cloudObject.x));
        const gap = 140 + Math.random() * 220;
        return Math.max(rightEdge, furthestCloud) + gap;
    }

    /**
     * DE: Aktualisiert die Kameraposition.
     * EN: Update camera.
     */
    updateCamera() {
        const minCameraX = this.canvas.width - this.level.level_end_x;
        const maxCameraX = -this.level.level_start_x;
        const targetX = this.characterScreenX - this.character.x;
        this.camera_x = Math.max(minCameraX, Math.min(maxCameraX, targetX));
    }

    /**
     * DE: Zeigt den verlorenen Spielzustand.
     * EN: Trigger game over.
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
     * DE: Zeichnet den Spielzustand.
     * EN: Draw.
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
     * DE: Zeichnet background and clouds.
     * EN: Draws background and clouds.
     */
    drawBackgroundAndClouds() {
        this.ctx.save();
        this.ctx.translate(this.camera_x, 0);
        this.addObjectsToMap(this.level.backgroundObjects);
        this.addObjectsToMap(this.level.clouds);
        this.ctx.restore();
    }

    /**
     * DE: Zeichnet die Spielfiguren und Statusanzeigen.
     * EN: Draw game scene.
     */
    drawGameScene() {
        this.ctx.save();
        this.ctx.translate(this.camera_x, 0);
        this.drawLevelActors();
        this.ctx.restore();
        this.drawStatusBars();
    }

    /** DE: Zeichnet Figuren und Gegenstände. EN: Draws actors and items. */
    drawLevelActors() {
        this.coins.filter(c => c.isVisible() && c.behindCharacter).forEach(c => this.addToMap(c));
        this.addToMap(this.character);
        this.addObjectsToMap(this.level.enemies.filter(enemy =>
            !(enemy.isMainBoss && !this.bossUnlocked)));
        this.bottles.filter(b => !b.collected).forEach(b => this.addToMap(b));
        this.coins.filter(c => c.isVisible() && !c.behindCharacter).forEach(c => this.addToMap(c));
        this.addObjectsToMap(this.thrownBottles);
    }

    /** DE: Zeichnet die Statusanzeigen. EN: Draws the status bars. */
    drawStatusBars() {
        this.addToMap(this.statusBar);
        this.addToMap(this.bottleBar);
        this.addToMap(this.coinBar);
        if (this.bossUnlocked && this.character.x >= this.getBoss().x - 600) this.addToMap(this.bossBar);
    }

    /**
     * DE: Zeichnet game over screen.
     * EN: Draws game over screen.
     */
    drawGameOverScreen() {
        if (this.gameOverImage.complete && this.gameOverImage.naturalWidth) {
            this.ctx.drawImage(this.gameOverImage, 0, 0, this.canvas.width, this.canvas.height);
        }
    }

    /**
     * DE: Beendet das Level bei einem Sieg.
     * EN: Trigger win.
     */
    triggerWin() {
        if (this.isWin) return;
        gameSounds.stopAll();
        gameSounds.play("win");
        this.isWin = true;
        document.getElementById("pauseBtn").classList.add("hidden");
        this.character.clearTimers();
        this.onGameOver?.(true);
    }

    /**
     * DE: Zeichnet win screen.
     * EN: Draws win screen.
     */
    drawWinScreen() {
        if (this.winImage.complete && this.winImage.naturalWidth)
            this.ctx.drawImage(this.winImage, 0, 0, this.canvas.width, this.canvas.height);
        this.ctx.save();
        this.setWinTextStyle();
        this.drawWinCoinText();
        this.ctx.restore();
    }

    /** DE: Legt das Aussehen des Siegtexts fest. EN: Styles the win text. */
    setWinTextStyle() {
        this.ctx.font = 'bold 32px "Averia Sans Libre", sans-serif';
        this.ctx.textAlign = "center";
        this.ctx.textBaseline = "middle";
        this.ctx.lineWidth = 5;
        this.ctx.lineJoin = "round";
        this.ctx.strokeStyle = "#5a3000";
        this.ctx.fillStyle = "#ffd84d";
    }

    /** DE: Zeichnet die Anzahl gesammelter Münzen. EN: Draws collected coin total. */
    drawWinCoinText() {
        const coinText = `Coins collected: ${this.coinsCollected} / ${this.coins.length}`;
        this.ctx.strokeText(coinText, this.canvas.width / 2, this.canvas.height * 0.26);
        this.ctx.fillText(coinText, this.canvas.width / 2, this.canvas.height * 0.26);
    }

    /**
     * DE: Fügt hinzu objects to map.
     * EN: Adds objects to map.
     * @param {Object} objects - DE: Übergabewert objects. EN: Argument objects.
     */
    addObjectsToMap(objects) {
        objects.forEach(object => this.addToMap(object));
    }

    /**
     * DE: Fügt hinzu to map.
     * EN: Adds to map.
     * @param {MovableObject} movableObject - DE: Übergabewert movableObject. EN: Argument movableObject.
     */
    addToMap(movableObject) {
        this.ctx.save();
        if (movableObject.otherDirection) this.flipImage(movableObject);
        else this.drawImage(movableObject);
        this.ctx.restore();
        this.drawFrame(movableObject);
    }

    /**
     * DE: Zeichnet ein Bild.
     * EN: Draw image.
     * @param {Object} drawableObject - DE: Übergabewert drawableObject. EN: Argument drawableObject.
     */
    drawImage(drawableObject) {
        if (!drawableObject?.img?.complete || !drawableObject.img.naturalWidth) return;
        this.ctx.drawImage(drawableObject.img, drawableObject.x, drawableObject.y,
            drawableObject.width, drawableObject.height);
    }

    /**
     * DE: Spiegelt image.
     * EN: Flips image.
     * @param {MovableObject} movableObject - DE: Übergabewert movableObject. EN: Argument movableObject.
     */
    flipImage(movableObject) {
        if (!movableObject.img?.complete || !movableObject.img.naturalWidth) return;
        this.ctx.translate(movableObject.x + movableObject.width, movableObject.y);
        this.ctx.scale(-1, 1);
        this.ctx.drawImage(movableObject.img, 0, 0, movableObject.width, movableObject.height);
    }

    /**
     * DE: Zeichnet frame.
     * EN: Draws frame.
     * @param {MovableObject} movableObject - DE: Übergabewert movableObject. EN: Argument movableObject.
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
     * DE: Führt should draw frame aus.
     * EN: Should draw frame.
     * @param {MovableObject} movableObject - DE: Übergabewert movableObject. EN: Argument movableObject.
     */
    shouldDrawFrame(movableObject) {
        return movableObject instanceof Character || movableObject instanceof chicken ||
            movableObject instanceof chickenSmall || movableObject instanceof Endboss;
    }

    /**
     * DE: Beendet laufende Vorgänge und gibt Ressourcen frei.
     * EN: Dispose.
     */
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
