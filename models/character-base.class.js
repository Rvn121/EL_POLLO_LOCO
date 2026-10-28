class CharacterBase extends MovableObject {
    /** DE: Gibt die vorherige Fußposition der Spielfigur zurück. EN: Returns the character previous feet position.
 * @returns {*} DE: Berechnetes Ergebnis. EN: Computed result.
 */
    getPreviousFeet() {
        if (this.previousFeet !== null && this.previousFeet !== undefined) return this.previousFeet;
        const hitbox = this.getHitbox();
        if (hitbox) return hitbox.y;
        return this.y;
    }

    /** DE: Aktualisiert movement. EN: Updates movement. */
    updateMovement() {
        if (this.energy <= 0) return;
        this.updateHorizontalMovement();
        this.updateJumpInput();
        this.applyGravity();
    }

    /** DE: Aktualisiert horizontal movement. EN: Updates horizontal movement. */
    updateHorizontalMovement() {
        if (this.keyboard.RIGHT && !this.keyboard.LEFT) this.moveCharacterRight();
        if (this.keyboard.LEFT && !this.keyboard.RIGHT) this.moveCharacterLeft();
    }

    /** DE: Bewegt Spielfigur rechts. EN: Moves character right. */
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

    /** DE: Bewegt Spielfigur links. EN: Moves character left. */
    moveCharacterLeft() {
        const minX = this.level.level_start_x + 100;
        this.x = Math.max(minX, this.x - this.speed);
        this.otherDirection = true;
        this.markActivity();
    }

    /** DE: Aktualisiert Sprung input. EN: Updates jump input. */
    updateJumpInput() {
        const jumpKeyPressed = this.keyboard.UP;
        if (jumpKeyPressed && !this.jumpPressed) this.jump();
        this.jumpPressed = jumpKeyPressed;
    }

    /** DE: Lässt die Figur springen: started above Gegner. EN: Makes the character jump: started above enemy.
 * @param {*} enemy - DE: Parameter enemy. EN: enemy parameter.
 * @returns {*} DE: Berechnetes Ergebnis. EN: Computed result.
 */
    jumpStartedAboveEnemy(enemy) {
        const target = enemy.getHitbox();
        if (!target) return false;
        const previousFeet = this.getPreviousFeet();
        return previousFeet <= target.y + 12;
    }

    /** DE: Prüft, ob descending onto. EN: Checks whether descending onto.
 * @param {*} enemy - DE: Parameter enemy. EN: enemy parameter.
 * @returns {*} DE: Berechnetes Ergebnis. EN: Computed result.
 */
    isDescendingOnto(enemy) {
        const box = this.getHitbox();
        const target = enemy.getHitbox();
        if (!box || !target || this.speedY >= 0) return false;
        return this.jumpStartedAboveEnemy(enemy) || box.y < target.y;
    }

    /** DE: Wendet an gravity. EN: Applies gravity.
 * @returns {*} DE: Berechnetes Ergebnis. EN: Computed result.
 */
    applyGravity() {
        const box = this.getHitbox();
        this.previousFeet = this.y + this.height;
        if (box) this.previousFeet = box.y + box.height;
        this.y -= this.speedY;
        if (this.y < this.groundY) return this.continueJump();
        this.landOnGround();
    }

    /** DE: Verarbeitet Sprung. EN: Handles jump. */
    continueJump() {
        this.speedY -= this.gravity;
        this.animateJump();
    }

    /** DE: Lässt landen on Boden. EN: Lands on ground. */
    landOnGround() {
        if (this.jumpFrame > 0) {
            this.jumpFrame = 0;
            this.landingFrames = 8;
            this.currentImage = 0;
        }
        this.y = this.groundY;
        this.speedY = 0;
        if (this.landingFrames > 0) {
            if (!this.isHurt()) {
                const index = this.landingFrames > 4 ? 7 : 8;
                this.img = this.imageCache[this.IMAGES_JUMPING[index]];
            }
            this.landingFrames--;
            if (this.landingFrames === 0 && !this.isHurt()) this.showStandingImage();
        }
    }

    /** DE: Setzt zurück Laufen Bild. EN: Resets walking image. */
    resetWalkingImage() {
        this.currentImage = 0;
        this.jumpFrame = 0;
        this.showStandingImage();
    }

    /** DE: Animiert Sprung. EN: Animates jump. */
    animateJump() {
        const launchSpeed = this.jumpLaunchSpeed || this.jumpSpeed;
        let index;
        if (Math.abs(this.speedY) <= this.gravity * 2) index = 4;
        else if (this.speedY > 0) {
            const progress = 1 - this.speedY / launchSpeed;
            index = Math.min(3, Math.max(0, Math.floor(progress * 4)));
        } else {
            index = Math.abs(this.speedY) < launchSpeed * 0.55 ? 5 : 6;
        }
        if (!this.isHurt()) this.img = this.imageCache[this.IMAGES_JUMPING[index]];
        this.jumpFrame++;
    }

    /** DE: Lässt die Spielfigur springen. EN: Makes the character jump. */
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

    /** DE: Lässt abprallen from enemy. EN: Bounces from enemy. */
    bounceFromEnemy() {
        this.speedY = this.jumpSpeed * 0.6;
        this.jumpLaunchSpeed = this.speedY;
        this.landingFrames = 0;
        this.jumpFrame = 0;
        this.markActivity();
    }

    /** DE: Verarbeitet Schaden. EN: Handles damage.
 * @param {number} damage - DE: Parameter damage. EN: damage parameter.
 * @returns {*} DE: Berechnetes Ergebnis. EN: Computed result.
 */
    takeDamage(damage, attacker) {
        const nextEnergy = Math.max(0, this.energy - damage);
        if (this.energy <= 0) return;
        gameSounds.play("hit_pepe");
        if (nextEnergy === 0) {
            if (attacker) {
                const attackerCenter = attacker.x + attacker.width / 2;
                const ownCenter = this.x + this.width / 2;
                if (attackerCenter !== ownCenter) this.otherDirection = attackerCenter < ownCenter;
            }
            return this.die();
        }
        this.energy = nextEnergy;
        this.lastHit = Date.now();
        this.markActivity();
        this.showHurtImage();
    }

    /** DE: Beendet das Leben des Spielobjekts. EN: Marks the game object as dead. */
    die() {
        this.energy = 0;
        this.clearTimers();
        this.startDeathAnimation();
    }

    /** DE: Erstellt die Bildpfade der Todesanimation. EN: Builds the image paths for the death animation.
 * @returns {*} DE: Berechnetes Ergebnis. EN: Computed result.
 */
    createDeathImages() {
        const images = [];
        for (let i = 51; i <= 56; i++) images.push("img/2_character_pepe/5_dead/D-" + i + ".png");
        return images;
    }

    /** DE: Startet die Todesanimation und verhindert normale Bewegung. EN: Starts the death animation and prevents normal movement. */
    startDeathAnimation() {
        this.deathImages = this.createDeathImages();
        this.deathIndex = 0;
        this.deathFinished = false;
        this.deathFrameTicks = 0;
        this.deathVelocityY = 7;
        this.deathVelocityX = this.otherDirection ? 2.4 : -2.4;
        this.img = this.imageCache[this.deathImages[0]];
        this.deathInterval = setInterval(() => this.updateDeathAnimation(), 1000 / 60);
    }

    /** Advances the death sequence and launches Pepe backwards from frame three. */
    updateDeathAnimation() {
        if (window.gamePaused) return;
        if (++this.deathFrameTicks >= 10) {
            this.deathFrameTicks = 0;
            this.showNextDeathFrame();
        }
        if (this.deathIndex < 2) return;
        this.x += this.deathVelocityX;
        this.y -= this.deathVelocityY;
        this.deathVelocityY -= 0.45;
        if (this.deathIndex === this.deathImages.length - 1 && this.y > 480) {
            clearInterval(this.deathInterval);
            this.deathFinished = true;
        }
    }

    /** DE: Zeigt das nächste Bild der Todesanimation. EN: Shows the next death animation frame. */
    showNextDeathFrame() {
        this.deathIndex = Math.min(this.deathIndex + 1, this.deathImages.length - 1);
        this.img = this.imageCache[this.deathImages[this.deathIndex]];
    }

    /** DE: Prüft, ob hurt. EN: Checks whether hurt.
 * @returns {*} DE: Berechnetes Ergebnis. EN: Computed result.
 */
    isHurt() {
        return Date.now() - this.lastHit < 270;
    }

    /** DE: Zeigt hurt Bild. EN: Shows hurt image. */
    showHurtImage() {
        clearTimeout(this.hurtTimeout);
        this.img = this.imageCache[this.HURT_IMAGE];
        this.hurtTimeout = setTimeout(() => {
            this.lastHit = 0;
            this.showStandingImage();
        }, 270);
    }

    /** DE: Zeigt standing Bild. EN: Shows standing image. */
    showStandingImage() {
        if (this.energy <= 0 || this.idleStarted || this.y !== this.groundY || this.landingFrames > 0) return;
        const moving = this.keyboard.LEFT !== this.keyboard.RIGHT;
        if (moving) this.img = this.imageCache[this.IMAGES_WALKING[0]];
        else this.startIdleAnimation();
    }

    /** DE: Markiert activity. EN: Marks activity. */
    markActivity() {
        this.lastActivity = Date.now();
        if (this.idleStarted) this.stopIdleAnimation();
    }

    /** DE: Startet die Ruheanimation nach einer Pause ohne Bewegung. EN: Starts the idle animation after the player stops moving. */
    startIdleAnimation() {
        if (this.idleStarted) return;
        this.idleStarted = true;
        this.idleFrame = 0;
        this.showNextIdleFrame();
        this.idleInterval = setInterval(() => {
            if (!window.gamePaused) this.showNextIdleFrame();
        }, 350);
    }

    /** DE: Zeigt das nächste Bild der laufenden Ruheanimation. EN: Displays the next frame of the idle animation. */
    showNextIdleFrame() {
        if (this.idleFrame === 40) gameSounds.play("snoring");
        const path = this.resolveIdleImage();
        this.img = this.imageCache[path];
        this.idleFrame++;
    }

    /** DE: Wählt das nächste Bild der Ruheanimationsfolge aus. EN: Selects the next frame of the idle animation sequence.
 * @returns {*} DE: Berechnetes Ergebnis. EN: Computed result.
 */
    resolveIdleImage() {
        // Repeat each opening group six times, then finish idle and loop long idle.
        if (this.idleFrame < 18) return this.IMAGES_IDLE[this.idleFrame % 3];
        if (this.idleFrame < 36) return this.IMAGES_IDLE[3 + (this.idleFrame - 18) % 3];
        if (this.idleFrame < 40) return this.IMAGES_IDLE[this.idleFrame - 30];
        return this.IMAGES_IDLE[10 + (this.idleFrame - 40) % 10];
    }

    /** DE: Stoppt Ruhe Animation. EN: Stops idle animation. */
    stopIdleAnimation() {
        this.idleStarted = false;
        gameSounds.stop("snoring");
        this.idleFrame = 0;
        clearInterval(this.idleInterval);
    }

    /** DE: Löscht Zeitgeber. EN: Clears timers. */
    clearTimers() {
        super.clearTimers();
        this.stopIdleAnimation();
    }
}
