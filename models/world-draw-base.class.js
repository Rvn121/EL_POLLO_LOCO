class WorldDrawBase {
    /**
     * Moves clouds back to the right after they leave the visible area.
     */
    updateClouds() {
        this.level.clouds.forEach(cloudObject => this.recycleCloud(cloudObject));
    }

    /**
     * Repositions one cloud beyond the right edge of the screen.
     * @param {*} cloudObject - The cloud object used by this method.
     */
    recycleCloud(cloudObject) {
        const leftEdge = -this.camera_x;
        if (cloudObject.x + cloudObject.width >= leftEdge) return;
        cloudObject.resetPosition(this.getNextCloudX());
    }

    /**
     * Calculates a new cloud position to the right of the current clouds.
     */
    getNextCloudX() {
        const rightEdge = -this.camera_x + this.canvas.width;
        let furthestCloud = rightEdge;
        for (let i = 0; i < this.level.clouds.length; i++) {
            furthestCloud = Math.max(furthestCloud, this.level.clouds[i].x);
        }
        const gap = 140 + Math.random() * 220;
        return Math.max(rightEdge, furthestCloud) + gap;
    }

    /**
     * Keeps the camera within level boundaries while following the player.
     */
    updateCamera() {
        const minCameraX = this.canvas.width - this.level.level_end_x;
        const maxCameraX = -this.level.level_start_x;
        const targetX = this.characterScreenX - this.character.x;
        this.camera_x = Math.max(minCameraX, Math.min(maxCameraX, targetX));
    }

    /**
     * Switches the world into the Game Over state.
     * @param {*} reason - The reason used by this method.
     */
    triggerGameOver(reason = "") {
        if (this.isGameOver || this.isWin) return;
        this.gameOverReason = reason;
        gameSounds.stopAll();
        gameSounds.playSequence("gameover", "lose");
        this.isGameOver = true;
        this.character.clearTimers();
        if (typeof this.onGameOver === "function") this.onGameOver();
    }

    /**
     * Draws the current game frame on the canvas.
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
     * Draws background layers and moving clouds.
     */
    drawBackgroundAndClouds() {
        this.ctx.save();
        this.ctx.translate(this.camera_x, 0);
        this.addObjectsToMap(this.level.backgroundObjects);
        this.addObjectsToMap(this.level.clouds);
        this.ctx.restore();
    }

    /**
     * Draws the active game world and status bars.
     */
    drawGameScene() {
        this.ctx.save();
        this.ctx.translate(this.camera_x, 0);
        this.drawLevelActors();
        this.ctx.restore();
        this.drawStatusBars();
    }

    /**
     * Draws the player, enemies, and other level actors.
     */
    drawLevelActors() {
        this.addObjectsToMap(this.signs);
        this.drawCoins(true);
        this.addToMap(this.character);
        this.drawVisibleEnemies();
        for (const bottle of this.bottles) {
            if (!bottle.collected) this.addToMap(bottle);
        }
        this.drawCoins(false);
        this.addObjectsToMap(this.thrownBottles);
    }

    /**
     * Draws coins that are still visible.
     * @param {*} behindCharacter - The behind character used by this method.
     */
    drawCoins(behindCharacter) {
        for (const coin of this.coins) {
            if (coin.isVisible() && coin.behindCharacter === behindCharacter) this.addToMap(coin);
        }
    }

    /**
     * Draws enemies that are currently visible in the level.
     */
    drawVisibleEnemies() {
        for (const enemy of this.level.enemies) {
            if (enemy.isMainBoss && !this.bossUnlocked) continue;
            this.addToMap(enemy);
        }
    }

    /**
     * Draws the player inventory and health indicators.
     */
    drawStatusBars() {
        this.addToMap(this.statusBar);
        this.addToMap(this.bottleBar);
        this.addToMap(this.coinBar);
        if (this.bossUnlocked && this.character.x >= this.getBoss().x - 600) this.addToMap(this.bossBar);
    }

    /**
     * Draws the loss screen after the player dies.
     */
    drawGameOverScreen() {
        if (this.gameOverImage.complete && this.gameOverImage.naturalWidth) {
            this.ctx.drawImage(this.gameOverImage, 0, 0, this.canvas.width, this.canvas.height);
        }
        if (this.gameOverReason) {
            this.ctx.save();
            this.setWinTextStyle();
            this.ctx.strokeText(this.gameOverReason, this.canvas.width / 2, this.canvas.height * 0.26);
            this.ctx.fillText(this.gameOverReason, this.canvas.width / 2, this.canvas.height * 0.26);
            this.ctx.restore();
        }
    }

    /**
     * Switches the world into the victory state.
     */
    triggerWin() {
        if (this.isWin) return;
        gameSounds.stopAll();
        let sound = "L1_win";
        if (this.levelNumber === 2) sound = "L2_win";
        gameSounds.playSequence("win", sound);
        this.isWin = true;
        this.character.clearTimers();
        if (this.onGameOver) this.onGameOver(true);
    }

    /**
     * Draws the victory screen after the boss is defeated.
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
     * Sets the font and drawing style for victory text.
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
     * Shows collected coin information on the victory screen.
     */
    drawWinCoinText() {
        const coinText = `Coins collected: ${this.coinsCollected} / ${this.coins.length}`;
        this.ctx.strokeText(coinText, this.canvas.width / 2, this.canvas.height * 0.26);
        this.ctx.fillText(coinText, this.canvas.width / 2, this.canvas.height * 0.26);
    }

    /**
     * Draws each object from the supplied array on the canvas.
     * @param {*} objects - The objects used by this method.
     */
    addObjectsToMap(objects) {
        objects.forEach(object => this.addToMap(object));
    }

    /**
     * Draws one game object with its current facing direction.
     * @param {*} movableObject - The movable object used by this method.
     */
    addToMap(movableObject) {
        this.ctx.save();
        if (movableObject.otherDirection) this.flipImage(movableObject);
        else this.drawImage(movableObject);
        this.ctx.restore();
        this.drawFrame(movableObject);
    }

    /**
     * Draws a game object image at its current position and size.
     * @param {*} drawableObject - The drawable object used by this method.
     */
    drawImage(drawableObject) {
        if (!drawableObject || !drawableObject.img) return;
        if (!drawableObject.img.complete || !drawableObject.img.naturalWidth) return;
        this.ctx.drawImage(drawableObject.img, drawableObject.x, drawableObject.y,
            drawableObject.width, drawableObject.height);
    }

    /**
     * Draws a character or enemy facing the opposite direction.
     * @param {*} movableObject - The movable object used by this method.
     */
    flipImage(movableObject) {
        if (!movableObject.img || !movableObject.img.complete) return;
        if (!movableObject.img.naturalWidth) return;
        this.ctx.translate(movableObject.x + movableObject.width, movableObject.y);
        this.ctx.scale(-1, 1);
        this.ctx.drawImage(movableObject.img, 0, 0, movableObject.width, movableObject.height);
    }

    /**
     * Draws a debug collision frame when debugging is enabled.
     * @param {*} movableObject - The movable object used by this method.
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
     * Checks whether a game object needs a debug collision frame.
     * @param {*} movableObject - The movable object used by this method.
     */
    shouldDrawFrame(movableObject) {
        return movableObject instanceof Character || movableObject instanceof chicken ||
            movableObject instanceof chickenSmall || movableObject instanceof Endboss;
    }

    /**
     * Stops timers and releases the objects of the current world.
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
    /**
     * Applies a thrown bottle hit to the selected enemy.
     * @param {*} enemy - The enemy involved in the collision.
     * @param {*} bottle - The bottle being collected or thrown.
     */
    damageEnemyWithBottle(enemy, bottle) {
        if (!bottle.damagedEnemies) bottle.damagedEnemies = [];
        if (bottle.damagedEnemies.indexOf(enemy) !== -1) return;
        bottle.damagedEnemies.push(enemy);
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
     * Checks whether the thrown bottle can hit an enemy.
     * @param {*} bottle - The bottle being collected or thrown.
     * @param {*} enemy - The enemy involved in the collision.
     */
    hitEnemyWithBottle(bottle, enemy) {
        if (bottle.state !== "flying" || enemy.isDead) return;
        if (enemy.state === "dead" || enemy.state === "finished") return;
        if (enemy instanceof Endboss && enemy.isMainBoss && !this.bossUnlocked) return;
        if (!this.boxesOverlap(bottle, enemy)) return;
        this.placeBottleAtImpact(bottle, enemy);
        bottle.splash();
        this.applySplashDamage(bottle);
        this.damageEnemyWithBottle(enemy, bottle);
    }

    /**
     * Moves a bottle to the detected impact position before it breaks.
     * @param {*} bottle - The bottle being collected or thrown.
     * @param {*} enemy - The enemy involved in the collision.
     */
    placeBottleAtImpact(bottle, enemy) {
        const area = this.getBottleTargetArea(enemy);
        const centerX = bottle.x + bottle.width / 2;
        const centerY = bottle.y + bottle.height / 2;
        const x = Math.max(area.x, Math.min(centerX, area.x + area.width));
        const y = Math.max(area.y, Math.min(centerY, area.y + area.height));
        bottle.x = x - bottle.width / 2;
        bottle.y = y - bottle.height / 2;
    }

    /**
     * Checks whether two rectangular hitboxes overlap.
     * @param {*} a - The a used by this method.
     * @param {*} b - The b used by this method.
     */
    boxesOverlap(a, b) {
        const aa = a.getHitbox(), bb = this.getBottleTargetArea(b);
        if (!aa || !bb) return false;
        return aa.x < bb.x + bb.width && aa.x + aa.width > bb.x &&
            aa.y < bb.y + bb.height && aa.y + aa.height > bb.y;
    }

}
