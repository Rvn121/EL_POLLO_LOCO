/** Provides animation and state handling shared by the boss variants. */
class EndbossBase extends MovableObject {
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
}
