/** Provides animation and state handling shared by the boss variants. */
class EndbossBase extends MovableObject {
    /**
     * Starts combat as soon as the player enters the boss detection range.
     * @param {Character} player - The character approaching the boss.
     * @returns {boolean} Whether the boss has noticed the player.
     */
    noticePlayer(player) {
        if (this.combatEngaged) return true;
        if (!player || player.energy <= 0) return false;
        const gap = Math.max(player.x - this.x - this.width, this.x - player.x - player.width, 0);
        if (gap > 600) return false;
        this.startCombat();
        return true;
    }


    /** Commits the boss to a charge without requiring a bottle hit first. */
    startCombat() {
        this.combatEngaged = true;
        this.combatPhase = "charge";
        this.phaseRemaining = this.getChargeDuration();
    }


    /** Reacts to accepted damage without cancelling an ongoing attack or retreat. */
    reactToBottleDamage() {
        if (this.energy <= 0) return this.setState("dead");
        if (this.hitPhases && !this.combatEngaged) this.startCombat();
        if (!this.hitPhases && this.isMainBoss && this.healthPhases) {
            this.approachUntil = Date.now() + 1400;
            this.retreatUntil = Date.now() + 2800;
        }
        if (this.state !== "attack") this.setState("hurt");
    }


    /**
     * Changes the current boss animation state.
     * @param {*} state - The animation or game state to apply.
     */
    setState(state) {
        this.state = state;
        this.frame = 0;
        this.frameElapsed = 0;
        this.updateImage();
    }


    /** Displays the appropriate boss animation frame. */
    updateImage() {
        const images = this.getStateImages();
        if (this.frame >= images.length) return this.finishAnimation();
        this.img = this.imageCache[images[this.frame]];
    }


    /** Returns the image sequence for the current boss state. */
    getStateImages() {
        if (this.state === "hurt") return this.IMAGES_HURT;
        if (this.state === "dead") return this.IMAGES_DEAD;
        if (this.state === "attack") return this.IMAGES_ATTACK;
        if (this.moving) return this.IMAGES_WALKING;
        return this.IMAGES_ALERT;
    }


    /**
     * Advances the current boss animation using elapsed time.
     * @param {number} delta - Time since the previous update in milliseconds.
     */
    updateAnimationFrame(delta) {
        this.frameElapsed += delta;
        if (this.frameElapsed < 150) return;
        this.frameElapsed -= 150;
        this.frame++;
        const images = this.getStateImages();
        if (this.frame >= images.length && this.state === "walking") this.frame = 0;
        if (this.frame >= images.length && this.state === "idle") this.frame = 0;
        if (this.frame >= images.length && this.state === "alert") this.frame = 0;
        this.updateImage();
    }


    /**
     * Returns the movement speed while the boss attacks.
     * @returns {number} The current attack speed.
     */
    getAttackSpeed() {
        if (this.aggressive) {
            return 0.24;
        } else {
            return this.attackSpeed;
        }
    }


    /**
     * Moves a defeated mini-boss down and out of the canvas.
     * @param {number} delta - The delta used by this method.
     */
    updateFalling(delta) {
        this.fallSpeed += 0.0012 * delta;
        this.y += this.fallSpeed * delta;
        if (this.y > 480) this.state = "finished";
    }


    /** Finishes the current boss animation sequence. */
    finishAnimation() {
        if (this.state === "dead") return this.finishDeath();
        if (this.state === "attack" && this.hitPhases) this.beginRetreat();
        this.setState("walking");
    }


    /** Returns the movement speed for the current boss phase. */
    getMovementSpeed() {
        if (this.hitPhases) return this.getHitPhaseSpeed();
        if (this.aggressive) return this.getAggressiveSpeed();
        if (!this.healthPhases) return 0.09;
        if (this.energy <= 20) return 0.23;
        if (this.energy <= 40) return 0.20;
        if (this.energy <= 60) return 0.18;
        return 0.16;
    }


    /**
     * Returns the boss speed after it has been hit.
     * @returns {number} The result of get hit phase speed().
     */
    getHitPhaseSpeed() {
        if (this.combatPhase === "patrol") {
            return 0.09;
        }
        if (this.combatPhase === "retreat") {
            return this.getRetreatSpeed();
        }
        if (this.aggressive) {
            return 0.23;
        } else {
            return this.chargeSpeed;
        }
    }


    /** Returns the retreat speed for the current aggression setting. */
    getRetreatSpeed() {
        if (this.aggressive) {
            return 0.16;
        } else {
            return 0.14;
        }
    }


    /**
     * Returns the boss speed during its final attack phase.
     * @returns {number} The result of get aggressive speed().
     */
    getAggressiveSpeed() {
        if (this.energy <= 20) return 0.215;
        if (this.energy <= 40) return 0.20;
        return 0.18;
    }
}
