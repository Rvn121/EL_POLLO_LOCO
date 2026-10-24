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

    ROTATION = [1, 2, 3, 4].map(i =>
        `img/6_salsa_bottle/bottle_rotation/${i}_bottle_rotation.png`);
    SPLASH = [1, 2, 3, 4, 5, 6].map(i =>
        `img/6_salsa_bottle/bottle_rotation/bottle_splash/${i}_bottle_splash.png`);

    constructor(x, y, direction, power = 1) {
        super();
        this.x = x;
        this.y = y;
        this.speedX *= direction * (0.30 + 0.70 * power);
        this.speedY *= 0.5 + 0.5 * power;
        this.loadImages([...this.ROTATION, ...this.SPLASH]);
        this.img = this.imageCache[this.ROTATION[0]];
    }

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

    splash() {
        if (this.state !== "flying") return;
        this.state = "splash";
        this.elapsed = 0;
        this.frame = 0;
        this.y = Math.min(this.y, 425 - this.height);
        this.img = this.imageCache[this.SPLASH[0]];
    }

    updateSplash() {
        this.frame = Math.floor(this.elapsed / 65);
        if (this.frame >= 6) return this.state = "done";
        this.img = this.imageCache[this.SPLASH[this.frame]];
    }
}
