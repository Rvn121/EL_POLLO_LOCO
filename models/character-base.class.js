class CharacterBase extends MovableObject {
    /**
     * DE: Gibt die letzte Fußposition oder die aktuelle Position zurück.
     * EN: Returns the previous foot position or the current position.
     * @returns {number} Position der Füße / Position of the feet.
     */
    getPreviousFeet() {
        if (this.previousFeet !== null && this.previousFeet !== undefined) return this.previousFeet;
        const hitbox = this.getHitbox();
        return hitbox ? hitbox.y : this.y;
    }

    /**
     * DE: Aktualisiert movement für das Spiel.
     * EN: Updates movement for the game.
     */
    updateMovement() {
        if (this.energy <= 0) return;
        this.updateHorizontalMovement();
        this.updateJumpInput();
        this.applyGravity();
    }

    /**
     * DE: Aktualisiert horizontal movement für das Spiel.
     * EN: Updates horizontal movement for the game.
     */
    updateHorizontalMovement() {
        if (this.keyboard.RIGHT && !this.keyboard.LEFT) this.moveCharacterRight();
        if (this.keyboard.LEFT && !this.keyboard.RIGHT) this.moveCharacterLeft();
    }

    /**
     * DE: Bewegt character right für das Spiel.
     * EN: Moves character right for the game.
     */
    moveCharacterRight() {
        const boss = this.level.enemies.find(enemy => enemy.isMainBoss);
        const bossLimit = boss ? boss.x + boss.width + 120 : Infinity;
        const maxX = Math.min(this.level.level_end_x - this.width, bossLimit);
        this.x = Math.min(maxX, this.x + this.speed);
        this.otherDirection = false;
        this.markActivity();
    }

    /**
     * DE: Bewegt character left für das Spiel.
     * EN: Moves character left for the game.
     */
    moveCharacterLeft() {
        const minX = this.level.level_start_x + 100;
        this.x = Math.max(minX, this.x - this.speed);
        this.otherDirection = true;
        this.markActivity();
    }

    /**
     * DE: Aktualisiert jump input für das Spiel.
     * EN: Updates jump input for the game.
     */
    updateJumpInput() {
        const jumpKeyPressed = this.keyboard.UP;
        if (jumpKeyPressed && !this.jumpPressed) this.jump();
        this.jumpPressed = jumpKeyPressed;
    }

    /**
     * DE: Prüft, ob der Sprung oberhalb des Gegners begonnen hat.
     * EN: Checks whether a jump started above the enemy.
     * @param {MovableObject} enemy - DE: Wert enemy. EN: Value enemy.
     */
    jumpStartedAboveEnemy(enemy) {
        const target = enemy.getHitbox();
        if (!target) return false;
        const previousFeet = this.getPreviousFeet();
        return previousFeet <= target.y + 12;
    }

    /**
     * DE: Prüft, ob die Figur fallend von oben auf ein Objekt trifft.
     * EN: Checks whether the player falls onto an object from above.
     * @param {MovableObject} enemy - DE: Wert enemy. EN: Value enemy.
     */
    isDescendingOnto(enemy) {
        const box = this.getHitbox();
        const target = enemy.getHitbox();
        if (!box || !target || this.speedY >= 0) return false;
        return this.jumpStartedAboveEnemy(enemy) || box.y < target.y;
    }

    /**
     * DE: Wendet gravity für das Spiel.
     * EN: Applies gravity for the game.
     */
    applyGravity() {
        const box = this.getHitbox();
        this.previousFeet = box ? box.y + box.height : this.y + this.height;
        this.y -= this.speedY;
        if (this.y < this.groundY) return this.continueJump();
        this.landOnGround();
    }

    /**
     * DE: Führt continue jump im Spiel aus.
     * EN: Runs continue jump in the game.
     */
    continueJump() {
        this.speedY -= this.gravity;
        this.animateJump();
    }

    /**
     * DE: Führt land on ground im Spiel aus.
     * EN: Runs land on ground in the game.
     */
    landOnGround() {
        if (this.jumpFrame > 0 && !this.isHurt()) this.resetWalkingImage();
        this.y = this.groundY;
        this.speedY = 0;
    }

    /**
     * DE: Setzt walking image für das Spiel.
     * EN: Resets walking image for the game.
     */
    resetWalkingImage() {
        this.img = this.imageCache[this.IMAGES_WALKING[0]];
        this.currentImage = 0;
        this.jumpFrame = 0;
    }

    /**
     * DE: Führt animate jump im Spiel aus.
     * EN: Runs animate jump in the game.
     */
    animateJump() {
        const duration = Math.ceil(2 * this.jumpSpeed / this.gravity + 1);
        const frame = Math.floor(this.jumpFrame * this.IMAGES_JUMPING.length / duration);
        const index = Math.min(frame, this.IMAGES_JUMPING.length - 1);
        this.img = this.imageCache[this.IMAGES_JUMPING[index]];
        this.jumpFrame++;
    }

    /**
     * DE: Führt jump im Spiel aus.
     * EN: Runs jump in the game.
     */
    jump() {
        if (this.y !== this.groundY) return;
        this.speedY = this.jumpSpeed;
        this.jumpFrame = 0;
        gameSounds.stop("steps");
        gameSounds.play("jump");
        this.markActivity();
    }

    /**
     * DE: Führt bounce from enemy im Spiel aus.
     * EN: Runs bounce from enemy in the game.
     */
    bounceFromEnemy() {
        this.speedY = this.jumpSpeed * 0.6;
        this.jumpFrame = 0;
        this.markActivity();
    }

    /**
     * DE: Verarbeitet damage für das Spiel.
     * EN: Handles damage for the game.
     * @param {number} damage - DE: damage. EN: damage.
     */
    takeDamage(damage) {
        const nextEnergy = Math.max(0, this.energy - damage);
        if (this.energy <= 0) return;
        gameSounds.play("hit_pepe");
        if (nextEnergy === 0) return this.die();
        this.energy = nextEnergy;
        this.lastHit = Date.now();
        this.markActivity();
        this.showHurtImage();
    }

    /**
     * DE: Führt die im Spiel aus.
     * EN: Runs die in the game.
     */
    die() {
        this.energy = 0;
        this.clearTimers();
        this.startDeathAnimation();
    }

    /**
     * DE: Startet die Todesanimation und verhindert normale Bewegung.
     * EN: Starts the death animation and prevents normal movement.
     */
    startDeathAnimation() {
        this.deathImages = [51,52,53,54,55,56].map(n =>
            `img/2_character_pepe/5_dead/D-${n}.png`);
        this.loadImages(this.deathImages);
        this.deathIndex = 0;
        this.img = this.imageCache[this.deathImages[0]];
        this.deathInterval = setInterval(() => this.showNextDeathFrame(), 170);
    }

    /**
     * DE: Zeigt das nächste Bild der Todesanimation.
     * EN: Shows the next death animation frame.
     */
    showNextDeathFrame() {
        if (++this.deathIndex >= this.deathImages.length) {
            clearInterval(this.deathInterval);
            this.deathFinished = true;
            return;
        }
        this.img = this.imageCache[this.deathImages[this.deathIndex]];
        if (this.deathIndex >= 2) this.y += 90;
    }

    /**
     * DE: Prüft hurt für das Spiel.
     * EN: Checks hurt for the game.
     */
    isHurt() {
        return Date.now() - this.lastHit < 270;
    }

    /**
     * DE: Zeigt hurt image für das Spiel.
     * EN: Shows hurt image for the game.
     */
    showHurtImage() {
        clearTimeout(this.hurtTimeout);
        this.img = this.imageCache[this.HURT_IMAGE];
        this.hurtTimeout = setTimeout(() => {
            this.lastHit = 0;
            this.img = this.imageCache[this.IMAGES_WALKING[0]];
        }, 270);
    }

    /**
     * DE: Zeigt standing image für das Spiel.
     * EN: Shows standing image for the game.
     */
    showStandingImage() {
        if (this.energy <= 0 || this.idleStarted || this.y !== this.groundY) return;
        this.img = this.imageCache[this.IMAGES_WALKING[0]];
    }

    /**
     * DE: Führt mark activity im Spiel aus.
     * EN: Runs mark activity in the game.
     */
    markActivity() {
        this.lastActivity = Date.now();
        if (this.idleStarted) this.stopIdleAnimation();
    }

    /**
     * DE: Startet die Ruheanimation nach einer Pause ohne Bewegung.
     * EN: Starts the idle animation after the player stops moving.
     */
    startIdleAnimation() {
        if (this.idleStarted) return;
        this.idleStarted = true;
        gameSounds.play("snoring");
        this.idleFrame = 0;
        this.idleInterval = setInterval(() => {
            if (!window.gamePaused) this.showNextIdleFrame();
        }, 500);
    }

    /**
     * DE: Zeigt das nächste Bild der laufenden Ruheanimation.
     * EN: Displays the next frame of the idle animation.
     */
    showNextIdleFrame() {
        const path = this.resolveIdleImage();
        this.img = this.imageCache[path];
        this.idleFrame++;
    }

    /**
     * DE: Wählt das nächste Bild der Ruheanimationsfolge aus.
     * EN: Selects the next frame of the idle animation sequence.
     */
    resolveIdleImage() {
        if (this.idleFrame < this.IMAGES_IDLE.length) return this.IMAGES_IDLE[this.idleFrame];
        const loopIndex = (this.idleFrame - this.IMAGES_IDLE.length) % this.IDLE_LOOP_IMAGES.length;
        return this.IMAGES_IDLE[10 + (this.idleFrame - this.IMAGES_IDLE.length) % 10];
    }

    /**
     * DE: Stoppt idle animation für das Spiel.
     * EN: Stops idle animation for the game.
     */
    stopIdleAnimation() {
        this.idleStarted = false;
        gameSounds.stop("snoring");
        this.idleFrame = 0;
        clearInterval(this.idleInterval);
        this.showStandingImage();
    }

    /**
     * DE: Löscht timers für das Spiel.
     * EN: Clears timers for the game.
     */
    clearTimers() {
        super.clearTimers();
        this.stopIdleAnimation();
    }
}
