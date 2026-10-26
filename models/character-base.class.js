class CharacterBase extends MovableObject {
    /**
     * DE: Gibt die letzte Fußposition oder die aktuelle Position zurück.
     * EN: Returns the previous foot position or the current position.
     * @returns {number} Position der Füße / Position of the feet.
     */
    getPreviousFeet() {
        if (this.previousFeet !== null && this.previousFeet !== undefined) return this.previousFeet;
        const hitbox = this.getHitbox();
        if (hitbox) return hitbox.y;
        return this.y;
    }

    /**
 * DE: Aktualisiert Bewegung.
 * EN: Updates movement.
 */
    updateMovement() {
        if (this.energy <= 0) return;
        this.updateHorizontalMovement();
        this.updateJumpInput();
        this.applyGravity();
    }

    /**
 * DE: Aktualisiert horizontal Bewegung.
 * EN: Updates horizontal movement.
 */
    updateHorizontalMovement() {
        if (this.keyboard.RIGHT && !this.keyboard.LEFT) this.moveCharacterRight();
        if (this.keyboard.LEFT && !this.keyboard.RIGHT) this.moveCharacterLeft();
    }

    /**
 * DE: Bewegt Spielfigur rechts.
 * EN: Moves character right.
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
 * DE: Bewegt Spielfigur links.
 * EN: Moves character left.
 */
    moveCharacterLeft() {
        const minX = this.level.level_start_x + 100;
        this.x = Math.max(minX, this.x - this.speed);
        this.otherDirection = true;
        this.markActivity();
    }

    /**
 * DE: Aktualisiert Sprung Eingabe.
 * EN: Updates jump input.
 */
    updateJumpInput() {
        const jumpKeyPressed = this.keyboard.UP;
        if (jumpKeyPressed && !this.jumpPressed) this.jump();
        this.jumpPressed = jumpKeyPressed;
    }

    /**
 * DE: Lässt die Figur springen: started above Gegner.
 * EN: Makes the character jump: started above enemy.
 * @param {MovableObject} enemy - DE: Eingabewert. EN: Input value.
 */
    jumpStartedAboveEnemy(enemy) {
        const target = enemy.getHitbox();
        if (!target) return false;
        const previousFeet = this.getPreviousFeet();
        return previousFeet <= target.y + 12;
    }

    /**
 * DE: Prüft, ob descending onto.
 * EN: Checks whether descending onto.
 * @param {MovableObject} enemy - DE: Eingabewert. EN: Input value.
 */
    isDescendingOnto(enemy) {
        const box = this.getHitbox();
        const target = enemy.getHitbox();
        if (!box || !target || this.speedY >= 0) return false;
        return this.jumpStartedAboveEnemy(enemy) || box.y < target.y;
    }

    /**
 * DE: Wendet an: gravity.
 * EN: Applies: gravity.
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
 * DE: Verarbeitet Sprung.
 * EN: Processes jump.
 */
    continueJump() {
        this.speedY -= this.gravity;
        this.animateJump();
    }

    /**
 * DE: Verarbeitet on Boden.
 * EN: Processes on ground.
 */
    landOnGround() {
        if (this.jumpFrame > 0 && !this.isHurt()) this.resetWalkingImage();
        this.y = this.groundY;
        this.speedY = 0;
    }

    /**
 * DE: Setzt zurück: Laufen Bild.
 * EN: Resets: walking image.
 */
    resetWalkingImage() {
        this.img = this.imageCache[this.IMAGES_WALKING[0]];
        this.currentImage = 0;
        this.jumpFrame = 0;
    }

    /**
 * DE: Animiert Sprung.
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
 * DE: Lässt die Figur springen:.
 * EN: Makes the character jump:.
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
 * DE: Verarbeitet from Gegner.
 * EN: Processes from enemy.
 */
    bounceFromEnemy() {
        this.speedY = this.jumpSpeed * 0.6;
        this.jumpFrame = 0;
        this.markActivity();
    }

    /**
 * DE: Verarbeitet Schaden.
 * EN: Processes damage.
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
 * DE: Beendet das Leben der Figur.
 * EN: Ends the character life.
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
 * DE: Prüft, ob Verletzung.
 * EN: Checks whether hurt.
 */
    isHurt() {
        return Date.now() - this.lastHit < 270;
    }

    /**
 * DE: Zeigt Verletzung Bild.
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
 * DE: Zeigt standing Bild.
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
 * DE: Stoppt Leerlauf animation.
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
 * DE: Leert Zeitgeber.
 * EN: Clears timers.
 */
    clearTimers() {
        super.clearTimers();
        this.stopIdleAnimation();
    }
}
