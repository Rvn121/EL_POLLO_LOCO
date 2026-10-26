class WorldDrawBase {
    /**
 * DE: Aktualisiert Wolken.
 * EN: Updates clouds.
 */
    updateClouds() {
        this.level.clouds.forEach(cloudObject => this.recycleCloud(cloudObject));
    }

    /**
 * DE: Verwendet erneut: Wolke.
 * EN: Recycles: cloud.
 * @param {Object} cloudObject - DE: Eingabewert. EN: Input value.
 */
    recycleCloud(cloudObject) {
        const leftEdge = -this.camera_x;
        if (cloudObject.x + cloudObject.width >= leftEdge) return;
        cloudObject.resetPosition(this.getNextCloudX());
    }

    /**
 * DE: Ermittelt nächste Wolke x.
 * EN: Gets next cloud x.
 */
    getNextCloudX() {
        const rightEdge = -this.camera_x + this.canvas.width;
        const furthestCloud = Math.max(...this.level.clouds.map(cloudObject => cloudObject.x));
        const gap = 140 + Math.random() * 220;
        return Math.max(rightEdge, furthestCloud) + gap;
    }

    /**
 * DE: Aktualisiert Kamera.
 * EN: Updates camera.
 */
    updateCamera() {
        const minCameraX = this.canvas.width - this.level.level_end_x;
        const maxCameraX = -this.level.level_start_x;
        const targetX = this.characterScreenX - this.character.x;
        this.camera_x = Math.max(minCameraX, Math.min(maxCameraX, targetX));
    }

    /**
 * DE: Löst aus: Spiel over.
 * EN: Triggers: game over.
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
 * DE: Zeichnet.
 * EN: Draws.
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
 * DE: Zeichnet Hintergrund and Wolken.
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
 * DE: Zeichnet Spiel scene.
 * EN: Draws game scene.
 */
    drawGameScene() {
        this.ctx.save();
        this.ctx.translate(this.camera_x, 0);
        this.drawLevelActors();
        this.ctx.restore();
        this.drawStatusBars();
    }

    /**
 * DE: Zeichnet Level actors.
 * EN: Draws level actors.
 */
    drawLevelActors() {
        this.drawCoins(true);
        this.addToMap(this.character);
        this.drawVisibleEnemies();
        for (const bottle of this.bottles) {
            if (!bottle.collected) this.addToMap(bottle);
        }
        this.drawCoins(false);
        this.addObjectsToMap(this.thrownBottles);
    }

    /** DE: Zeichnet sichtbare Münzen. EN: Draws visible coins. */
    drawCoins(behindCharacter) {
        for (const coin of this.coins) {
            if (coin.isVisible() && coin.behindCharacter === behindCharacter) this.addToMap(coin);
        }
    }

    /** DE: Zeichnet nur freigeschaltete Gegner. EN: Draws only unlocked enemies. */
    drawVisibleEnemies() {
        for (const enemy of this.level.enemies) {
            if (enemy.isMainBoss && !this.bossUnlocked) continue;
            this.addToMap(enemy);
        }
    }

    /**
 * DE: Zeichnet Status Leisten.
 * EN: Draws status bars.
 */
    drawStatusBars() {
        this.addToMap(this.statusBar);
        this.addToMap(this.bottleBar);
        this.addToMap(this.coinBar);
        if (this.bossUnlocked && this.character.x >= this.getBoss().x - 600) this.addToMap(this.bossBar);
    }

    /**
 * DE: Zeichnet Spiel over Bildschirm.
 * EN: Draws game over screen.
 */
    drawGameOverScreen() {
        if (this.gameOverImage.complete && this.gameOverImage.naturalWidth) {
            this.ctx.drawImage(this.gameOverImage, 0, 0, this.canvas.width, this.canvas.height);
        }
    }

    /**
 * DE: Löst aus: win.
 * EN: Triggers: win.
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
 * DE: Zeichnet win Bildschirm.
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

    /**
 * DE: Setzt win text style.
 * EN: Sets win text style.
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
 * DE: Zeichnet win Münze text.
 * EN: Draws win coin text.
 */
    drawWinCoinText() {
        const coinText = `Coins collected: ${this.coinsCollected} / ${this.coins.length}`;
        this.ctx.strokeText(coinText, this.canvas.width / 2, this.canvas.height * 0.26);
        this.ctx.fillText(coinText, this.canvas.width / 2, this.canvas.height * 0.26);
    }

    /**
 * DE: Fügt hinzu: objects to map.
 * EN: Adds: objects to map.
 * @param {Object} objects - DE: Eingabewert. EN: Input value.
 */
    addObjectsToMap(objects) {
        objects.forEach(object => this.addToMap(object));
    }

    /**
 * DE: Fügt hinzu: to map.
 * EN: Adds: to map.
 * @param {MovableObject} movableObject - DE: Eingabewert. EN: Input value.
 */
    addToMap(movableObject) {
        this.ctx.save();
        if (movableObject.otherDirection) this.flipImage(movableObject);
        else this.drawImage(movableObject);
        this.ctx.restore();
        this.drawFrame(movableObject);
    }

    /**
 * DE: Zeichnet Bild.
 * EN: Draws image.
 * @param {Object} drawableObject - DE: Eingabewert. EN: Input value.
 */
    drawImage(drawableObject) {
        if (!drawableObject || !drawableObject.img) return;
        if (!drawableObject.img.complete || !drawableObject.img.naturalWidth) return;
        this.ctx.drawImage(drawableObject.img, drawableObject.x, drawableObject.y,
            drawableObject.width, drawableObject.height);
    }

    /**
 * DE: Spiegelt Bild.
 * EN: Flips image.
 * @param {MovableObject} movableObject - DE: Eingabewert. EN: Input value.
 */
    flipImage(movableObject) {
        if (!movableObject.img || !movableObject.img.complete) return;
        if (!movableObject.img.naturalWidth) return;
        this.ctx.translate(movableObject.x + movableObject.width, movableObject.y);
        this.ctx.scale(-1, 1);
        this.ctx.drawImage(movableObject.img, 0, 0, movableObject.width, movableObject.height);
    }

    /**
 * DE: Zeichnet Animationsbild.
 * EN: Draws frame.
 * @param {MovableObject} movableObject - DE: Eingabewert. EN: Input value.
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
 * DE: Prüft, ob draw Animationsbild.
 * EN: Checks whether draw frame.
 * @param {MovableObject} movableObject - DE: Eingabewert. EN: Input value.
 */
    shouldDrawFrame(movableObject) {
        return movableObject instanceof Character || movableObject instanceof chicken ||
            movableObject instanceof chickenSmall || movableObject instanceof Endboss;
    }

    /**
 * DE: Beendet und bereinigt.
 * EN: Disposes and cleans up.
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
