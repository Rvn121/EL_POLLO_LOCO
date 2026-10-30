class CharacterBase extends MovableObject {
    /**
     * Returns the character foot position from the previous movement step.
     */
    getPreviousFeet() {
        if (this.previousFeet !== null && this.previousFeet !== undefined) return this.previousFeet;
        const hitbox = this.getHitbox();
        if (hitbox) return hitbox.y;
        return this.y;
    }


    /**
     * Updates character movement, jumping, and gravity.
     */
    updateMovement() {
        if (this.energy <= 0) return;
        this.updateHorizontalMovement();
        this.updateJumpInput();
        this.applyGravity();
    }


    /**
     * Moves the character left or right using the pressed keys.
     */
    updateHorizontalMovement() {
        if (this.keyboard.RIGHT && !this.keyboard.LEFT) this.moveCharacterRight();
        if (this.keyboard.LEFT && !this.keyboard.RIGHT) this.moveCharacterLeft();
    }


    /**
     * Moves the character right without crossing the level boundary.
     */
    moveCharacterRight() {
        let boss;
        for (const enemy of this.level.enemies) {
            if (enemy.isMainBoss) { boss = enemy; break; }
        }
        let bossLimit = Infinity;
        if (boss) bossLimit = boss.x + boss.width + 120;
        const maxX = Math.min(this.level.level_end_x - this.width, bossLimit);
        this.x = Math.min(maxX, this.x + this.speed);
        this.otherDirection = false;
        this.markActivity();
    }


    /**
     * Moves the character left without crossing the level boundary.
     */
    moveCharacterLeft() {
        const minX = this.level.level_start_x + 100;
        this.x = Math.max(minX, this.x - this.speed);
        this.otherDirection = true;
        this.markActivity();
    }


    /**
     * Checks jump keys and starts a jump when allowed.
     */
    updateJumpInput() {
        const jumpKeyPressed = this.keyboard.UP;
        if (jumpKeyPressed && !this.jumpPressed) this.jump();
        this.jumpPressed = jumpKeyPressed;
    }


    /**
     * Checks whether a jump began above the enemy.
     * @param {*} enemy - The enemy involved in the collision.
     */
    jumpStartedAboveEnemy(enemy) {
        const target = enemy.getHitbox();
        if (!target) return false;
        const previousFeet = this.getPreviousFeet();
        return previousFeet <= target.y + 12;
    }


    /**
     * Checks whether the character is landing on an enemy from above.
     * @param {*} enemy - The enemy involved in the collision.
     */
    isDescendingOnto(enemy) {
        const box = this.getHitbox();
        const target = enemy.getHitbox();
        if (!box || !target || this.speedY >= 0) return false;
        return this.jumpStartedAboveEnemy(enemy) || box.y < target.y;
    }


    /**
     * Updates vertical movement and returns the character to the ground.
     */
    applyGravity() {
        const box = this.getHitbox();
        this.previousFeet = this.y + this.height;
        if (box) this.previousFeet = box.y + box.height;
        this.y -= this.speedY;
        if (this.y < this.groundY) return this.continueJump();
        this.landOnGround();
    }


    /**
     * Updates vertical speed and the jump animation while airborne.
     */
    continueJump() {
        this.speedY -= this.gravity;
        this.animateJump();
    }


    /**
     * Stops downward movement and returns the character to ground level.
     */
    landOnGround() {
        if (this.jumpFrame > 0) {
            this.jumpFrame = 0;
            this.landingFrames = 8;
            this.currentImage = 0;
        }
        this.y = this.groundY;
        this.speedY = 0;
        if (this.landingFrames > 0) this.showLandingFrame();
    }


    /**
     * Displays the appropriate image when the character lands.
     */
    showLandingFrame() {
        if (!this.isHurt()) {
            let index = 8;
            if (this.landingFrames > 4) index = 7;
            this.img = this.imageCache[this.IMAGES_JUMPING[index]];
        }
        this.landingFrames--;
        if (this.landingFrames === 0 && !this.isHurt()) this.showStandingImage();
    }


    /**
     * Selects the current jump animation frame.
     */
    animateJump() {
        const launchSpeed = this.jumpLaunchSpeed || this.jumpSpeed;
        let index;
        if (Math.abs(this.speedY) <= this.gravity * 2) index = 4;
        else if (this.speedY > 0) {
            const progress = 1 - this.speedY / launchSpeed;
            index = Math.min(3, Math.max(0, Math.floor(progress * 4)));
        } else {
            index = 6;
            if (Math.abs(this.speedY) < launchSpeed * 0.55) index = 5;
        }
        if (!this.isHurt()) this.img = this.imageCache[this.IMAGES_JUMPING[index]];
        this.jumpFrame++;
    }


    /**
     * Starts a jump if the character is standing on the ground.
     */
    jump() {
        if (this.y !== this.groundY) return;
        this.speedY = this.jumpSpeed;
        this.jumpLaunchSpeed = this.speedY;
        this.landingFrames = 0;
        this.jumpFrame = 0;
        gameSounds.stop("steps");
        gameSounds.play("jump");
        this.markActivity();
        if (!this.isHurt()) this.img = this.imageCache[this.IMAGES_JUMPING[0]];
    }


    /**
     * Makes the character bounce upward after defeating a chicken.
     */
    bounceFromEnemy() {
        this.speedY = this.jumpSpeed * 0.6;
        this.jumpLaunchSpeed = this.speedY;
        this.landingFrames = 0;
        this.jumpFrame = 0;
        this.markActivity();
    }


    /**
     * Reduces character health and starts the hurt or death response.
     * @param {number} damage - The amount of health to subtract.
     * @param {*} attacker - The attacker used by this method.
     */
    takeDamage(damage, attacker) {
        const nextEnergy = Math.max(0, this.energy - damage);
        if (this.energy <= 0) return;
        gameSounds.play("hit_pepe");
        if (nextEnergy === 0) return this.handleFatalDamage(attacker);
        this.energy = nextEnergy;
        this.lastHit = Date.now();
        this.markActivity();
        this.showHurtImage();
    }


    /**
     * Starts the death sequence when the character loses its last health.
     * @param {*} attacker - The attacker used by this method.
     */
    handleFatalDamage(attacker) {
        if (attacker) {
            const attackerCenter = attacker.x + attacker.width / 2;
            const ownCenter = this.x + this.width / 2;
            if (attackerCenter !== ownCenter) this.otherDirection = attackerCenter < ownCenter;
        }
        return this.die();
    }


    /**
     * Marks the character as dead and stops normal movement.
     */
    die() {
        this.energy = 0;
        this.clearTimers();
        this.startDeathAnimation();
    }


    /**
     * Builds the image paths for the character death animation.
     */
    createDeathImages() {
        const images = [];
        for (let i = 51; i <= 56; i++) images.push("img/2_character_pepe/5_dead/D-" + i + ".png");
        return images;
    }


    /**
     * Starts the sequence of character death images.
     */
    startDeathAnimation() {
        this.deathImages = this.createDeathImages();
        this.deathIndex = 0;
        this.deathFinished = false;
        this.deathFrameTicks = 0;
        this.deathVelocityY = 7;
        this.deathVelocityX = -2.4;
        if (this.otherDirection) this.deathVelocityX = 2.4;
        this.img = this.imageCache[this.deathImages[0]];
        this.deathInterval = setInterval(() => this.updateDeathAnimation(), 1000 / 60);
    }


    /**
     * Advances the death animation and falling movement.
     */
    updateDeathAnimation() {
        if (window.gamePaused) return;
        if (++this.deathFrameTicks >= 10) {
            this.deathFrameTicks = 0;
            this.showNextDeathFrame();
        }
        if (this.deathIndex < 2) return;
        this.moveDyingCharacter();
    }


    /**
     * Moves the dying character below the canvas.
     */
    moveDyingCharacter() {
        this.x += this.deathVelocityX;
        this.y -= this.deathVelocityY;
        this.deathVelocityY -= 0.45;
        if (this.deathIndex === this.deathImages.length - 1 && this.y > 480) {
            clearInterval(this.deathInterval);
            this.deathFinished = true;
        }
    }


    /**
     * Displays the next frame of the death animation.
     */
    showNextDeathFrame() {
        this.deathIndex = Math.min(this.deathIndex + 1, this.deathImages.length - 1);
        this.img = this.imageCache[this.deathImages[this.deathIndex]];
    }


    /**
     * Checks whether the character is still showing its hurt reaction.
     */
    isHurt() {
        return Date.now() - this.lastHit < 270;
    }


    /**
     * Displays the character image used after taking damage.
     */
    showHurtImage() {
        clearTimeout(this.hurtTimeout);
        this.img = this.imageCache[this.HURT_IMAGE];
        this.hurtTimeout = setTimeout(() => {
            this.lastHit = 0;
            this.showStandingImage();
        }, 270);
    }


    /**
     * Restores the standing image after a hurt reaction.
     */
    showStandingImage() {
        if (this.energy <= 0 || this.idleStarted || this.y !== this.groundY || this.landingFrames > 0) return;
        const moving = this.keyboard.LEFT !== this.keyboard.RIGHT;
        if (moving) this.img = this.imageCache[this.IMAGES_WALKING[0]];
        else this.startIdleAnimation();
    }


    /**
     * Records player activity and interrupts the idle animation.
     */
    markActivity() {
        this.lastActivity = Date.now();
        if (this.idleStarted) this.stopIdleAnimation();
    }


    /**
     * Starts the idle animation after the player stops moving.
     */
    startIdleAnimation() {
        if (this.idleStarted) return;
        this.idleStarted = true;
        this.idleFrame = 0;
        this.showNextIdleFrame();
        this.idleInterval = setInterval(() => {
            if (!window.gamePaused) this.showNextIdleFrame();
        }, 350);
    }


    /**
     * Displays the next image of the idle animation.
     */
    showNextIdleFrame() {
        if (this.idleFrame === 40) gameSounds.play("snoring");
        const path = this.resolveIdleImage();
        this.img = this.imageCache[path];
        this.idleFrame++;
    }


    /**
     * Returns the correct idle frame, including the repeating sequence.
     */
    resolveIdleImage() {
        /** Repeat each opening group six times, then finish idle and loop long idle. */
        if (this.idleFrame < 18) return this.IMAGES_IDLE[this.idleFrame % 3];
        if (this.idleFrame < 36) return this.IMAGES_IDLE[3 + (this.idleFrame - 18) % 3];
        if (this.idleFrame < 40) return this.IMAGES_IDLE[this.idleFrame - 30];
        return this.IMAGES_IDLE[10 + (this.idleFrame - 40) % 10];
    }


    /**
     * Stops the idle animation when the player moves or takes damage.
     */
    stopIdleAnimation() {
        this.idleStarted = false;
        gameSounds.stop("snoring");
        this.idleFrame = 0;
        clearInterval(this.idleInterval);
    }


    /**
     * Stops timers started by this game object.
     */
    clearTimers() {
        super.clearTimers();
        this.stopIdleAnimation();
    }
}
