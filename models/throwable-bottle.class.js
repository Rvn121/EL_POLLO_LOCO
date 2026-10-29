class ThrowableBottle extends DrawableObject {
    width = 52;
    height = 52;
    speedX = 10;
    speedY = -12;
    gravity = 0.55;
    state = "flying";
    frame = 0;
    elapsed = 0;
    otherDirection = false;

    ROTATION = this.createBottleImages("", "_bottle_rotation", 4);
    SPLASH = this.createBottleImages("bottle_splash/", "_bottle_splash", 6);

    /**
     * Builds the image paths for bottle rotation and splash frames.
     * @param {string} folder - The folder containing the animation images.
     * @param {*} suffix - The suffix used by this method.
     * @param {number} count - The count used by this method.
     */
    createBottleImages(folder, suffix, count) {
        const images = [];
        for (let i = 1; i <= count; i++) {
            images.push("img/6_salsa_bottle/bottle_rotation/" + folder + i + suffix + ".png");
        }
        return images;
    }

    /**
     * Initializes this object and sets up its required game data.
     * @param {number} x - The horizontal coordinate.
     * @param {number} y - The vertical coordinate.
     * @param {*} direction - The movement direction.
     * @param {*} power - The power used by this method.
     */
    constructor(x, y, direction, power = 1) {
        super();
        this.x = x;
        this.y = y;
        this.speedX *= direction * (0.30 + 0.70 * power);
        this.speedY *= 0.5 + 0.5 * power;
        this.loadImages(this.ROTATION);
        this.loadImages(this.SPLASH);
        this.img = this.imageCache[this.ROTATION[0]];
    }

    /**
     * Updates this game object for the current animation frame.
     * @param {number} delta - The delta used by this method.
     */
    update(delta) {
        if (this.state === "done") return;
        this.elapsed += delta;
        if (this.state === "splash") return this.updateSplash();
        this.x += this.speedX * delta / 16.667;
        this.y += this.speedY * delta / 16.667;
        this.speedY += this.gravity * delta / 16.667;
        this.frame = Math.floor(this.elapsed / 90) % 4;
        this.img = this.imageCache[this.ROTATION[this.frame]];
        if (this.y + this.height >= 425) this.splash();
    }

    /**
     * Starts the bottle splash animation after an impact.
     */
    splash() {
        if (this.state !== "flying") return;
        this.state = "splash";
        gameSounds.play("splash");
        this.elapsed = 0;
        this.frame = 0;
        if (this.y + this.height >= 425) this.y = 425 - this.height;
        this.img = this.imageCache[this.SPLASH[0]];
    }

    /**
     * Advances the bottle splash animation and removes it when finished.
     */
    updateSplash() {
        this.frame = Math.floor(this.elapsed / 65);
        if (this.frame >= 6) return this.state = "done";
        this.img = this.imageCache[this.SPLASH[this.frame]];
    }
}
