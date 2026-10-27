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

    /** DE: Erstellt Bildpfade für eine Flaschenanimation. EN: Builds image paths for a bottle animation.
 * @param {string} folder - DE: Parameter folder. EN: folder parameter.
 * @param {string} suffix - DE: Parameter suffix. EN: suffix parameter.
 * @param {number} count - DE: Parameter count. EN: count parameter.
 * @returns {*} DE: Berechnetes Ergebnis. EN: Computed result.
 */
    createBottleImages(folder, suffix, count) {
        const images = [];
        for (let i = 1; i <= count; i++) {
            images.push("img/6_salsa_bottle/bottle_rotation/" + folder + i + suffix + ".png");
        }
        return images;
    }

    /** DE: Erstellt das Objekt und setzt seine Startwerte. EN: Creates the object and sets its initial values.
 * @param {number} x - DE: Parameter x. EN: x parameter.
 * @param {number} y - DE: Parameter y. EN: y parameter.
 * @param {number} direction - DE: Parameter direction. EN: direction parameter.
 * @param {number} [power] - DE: Parameter power. EN: power parameter.
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

    /** DE: Aktualisiert update. EN: Updates update.
 * @param {number} delta - DE: Parameter delta. EN: delta parameter.
 * @returns {*} DE: Berechnetes Ergebnis. EN: Computed result.
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

    /** DE: Startet die Spritzanimation der Flasche. EN: Starts the bottle splash animation. */
    splash() {
        if (this.state !== "flying") return;
        this.state = "splash";
        gameSounds.play("splash");
        this.elapsed = 0;
        this.frame = 0;
        if (this.y + this.height >= 425) this.y = 425 - this.height;
        this.img = this.imageCache[this.SPLASH[0]];
    }

    /** DE: Spielt die Spritzanimation einer zerbrochenen Flasche ab. EN: Advances the splash animation of a broken bottle.
 * @returns {*} DE: Berechnetes Ergebnis. EN: Computed result.
 */
    updateSplash() {
        this.frame = Math.floor(this.elapsed / 65);
        if (this.frame >= 6) return this.state = "done";
        this.img = this.imageCache[this.SPLASH[this.frame]];
    }
}
