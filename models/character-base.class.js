class CharacterBase extends MovableObject {
    /**
     * DE: Aktualisiert movement.
     * EN: Updates movement.
     */
    updateMovement() {
        if (this.energy <= 0) return;
        this.updateHorizontalMovement();
        this.updateJumpInput();
        this.applyGravity();
    }

    /**
     * DE: Aktualisiert horizontal movement.
     * EN: Updates horizontal movement.
     */
    updateHorizontalMovement() {
        if (this.keyboard.RIGHT && !this.keyboard.LEFT) this.moveCharacterRight();
        if (this.keyboard.LEFT && !this.keyboard.RIGHT) this.moveCharacterLeft();
    }

    /**
     * DE: Bewegt character right.
     * EN: Moves character right.
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
     * DE: Bewegt character left.
     * EN: Moves character left.
     */
    moveCharacterLeft() {
        const minX = this.level.level_start_x + 100;
        this.x = Math.max(minX, this.x - this.speed);
        this.otherDirection = true;
        this.markActivity();
    }

    /**
     * DE: Aktualisiert jump input.
     * EN: Updates jump input.
     */
    updateJumpInput() {
        const jumpKeyPressed = this.keyboard.UP;
        if (jumpKeyPressed && !this.jumpPressed) this.jump();
        this.jumpPressed = jumpKeyPressed;
    }

    /**
     * DE: Springt started above enemy.
     * EN: Jumps started above enemy.
     * @param {MovableObject} enemy - DE: Übergabewert enemy. EN: Argument enemy.
     */
    jumpStartedAboveEnemy(enemy) {
        const target = enemy.getHitbox();
        if (!target) return false;
        const previousFeet = this.previousFeet ?? this.getHitbox()?.y;
        return previousFeet <= target.y + 12;
    }

    /**
     * DE: Prüft, ob descending onto zutrifft.
     * EN: Checks whether descending onto is true.
     * @param {MovableObject} enemy - DE: Übergabewert enemy. EN: Argument enemy.
     */
    isDescendingOnto(enemy) {
        const box = this.getHitbox();
        const target = enemy.getHitbox();
        if (!box || !target || this.speedY >= 0) return false;
        return this.jumpStartedAboveEnemy(enemy) || box.y < target.y;
    }

    /**
     * DE: Wendet an gravity.
     * EN: Applies gravity.
     */
    applyGravity() {
        const box = this.getHitbox();
        this.previousFeet = box ? box.y + box.height : this.y + this.height;
        this.y -= this.speedY;
        if (this.y < this.groundY) return this.continueJump();
        this.landOnGround();
    }

    /**
     * DE: Setzt fort jump.
     * EN: Continues jump.
     */
    continueJump() {
        this.speedY -= this.gravity;
        this.animateJump();
    }

    /**
     * DE: Landet on ground.
     * EN: Lands on ground.
     */
    landOnGround() {
        if (this.jumpFrame > 0 && !this.isHurt()) this.resetWalkingImage();
        this.y = this.groundY;
        this.speedY = 0;
    }

    /**
     * DE: Setzt zurück walking image.
     * EN: Resets walking image.
     */
    resetWalkingImage() {
        this.img = this.imageCache[this.IMAGES_WALKING[0]];
        this.currentImage = 0;
        this.jumpFrame = 0;
    }

    /**
     * DE: Animiert jump.
     * EN: Animates jump.
     */
    animateJump() {
        const duration = Math.ceil(2 * this.jumpSpeed / this.gravity + 1);
        const frame = Math.floor(this.jumpFrame * this.IMAGES_JUMPING.length / duration);
        const index = Math.min(frame, this.IMAGES_JUMPING.length - 1);
        this.img = this.imageCache[this.IMAGES_JUMPING[index]];
        this.jumpFrame++;
    }

    /**
     * DE: Lässt die Spielfigur springen.
     * EN: Jump.
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
     * DE: Springt zurück from enemy.
     * EN: Bounces from enemy.
     */
    bounceFromEnemy() {
        this.speedY = this.jumpSpeed * 0.6;
        this.jumpFrame = 0;
        this.markActivity();
    }

    /**
     * DE: Zieht Lebensenergie ab.
     * EN: Take damage.
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
     * DE: Lässt das Objekt sterben.
     * EN: Kills the object.
     */
    die() {
        this.energy = 0;
        this.clearTimers();
        this.startDeathAnimation();
    }

    /**
     * DE: Startet death animation.
     * EN: Starts death animation.
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
     * DE: Zeigt next death frame.
     * EN: Shows next death frame.
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
     * DE: Prüft, ob hurt zutrifft.
     * EN: Checks whether hurt is true.
     */
    isHurt() {
        return Date.now() - this.lastHit < 270;
    }

    /**
     * DE: Zeigt hurt image.
     * EN: Shows hurt image.
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
     * DE: Zeigt standing image.
     * EN: Shows standing image.
     */
    showStandingImage() {
        if (this.energy <= 0 || this.idleStarted || this.y !== this.groundY) return;
        this.img = this.imageCache[this.IMAGES_WALKING[0]];
    }

    /**
     * DE: Markiert activity.
     * EN: Marks activity.
     */
    markActivity() {
        this.lastActivity = Date.now();
        if (this.idleStarted) this.stopIdleAnimation();
    }

    /**
     * DE: Startet idle animation.
     * EN: Starts idle animation.
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
     * DE: Zeigt next idle frame.
     * EN: Shows next idle frame.
     */
    showNextIdleFrame() {
        const path = this.resolveIdleImage();
        this.img = this.imageCache[path];
        this.idleFrame++;
    }

    /**
     * DE: Ermittelt idle image.
     * EN: Resolves idle image.
     */
    resolveIdleImage() {
        if (this.idleFrame < this.IMAGES_IDLE.length) return this.IMAGES_IDLE[this.idleFrame];
        const loopIndex = (this.idleFrame - this.IMAGES_IDLE.length) % this.IDLE_LOOP_IMAGES.length;
        return this.IMAGES_IDLE[10 + (this.idleFrame - this.IMAGES_IDLE.length) % 10];
    }

    /**
     * DE: Stoppt idle animation.
     * EN: Stops idle animation.
     */
    stopIdleAnimation() {
        this.idleStarted = false;
        gameSounds.stop("snoring");
        this.idleFrame = 0;
        clearInterval(this.idleInterval);
        this.showStandingImage();
    }

    /**
     * DE: Löscht timers.
     * EN: Clears timers.
     */
    clearTimers() {
        super.clearTimers();
        this.stopIdleAnimation();
    }
}
