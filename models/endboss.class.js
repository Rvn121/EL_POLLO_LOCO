class Endboss extends MovableObject {
    height = 400;
    width = 250;
    y = 50;
    x = 6100;
    state = "walking";
    frame = 0;
    frameElapsed = 0;
    IMAGES_WALKING = Array.from({length: 8}, (_, i) =>
        `img/4_enemie_boss_chicken/2_alert/G${i + 5}.png`);
    IMAGES_HURT = [21, 22, 23].map(i =>
        `img/4_enemie_boss_chicken/4_hurt/G${i}.png`);
    IMAGES_DEAD = [24, 25, 26].map(i =>
        `img/4_enemie_boss_chicken/5_dead/G${i}.png`);

    constructor() {
        super();
        this.loadImages([...this.IMAGES_WALKING, ...this.IMAGES_HURT, ...this.IMAGES_DEAD]);
        this.img = this.imageCache[this.IMAGES_WALKING[0]];
    }

    takeBottleHit() {
        if (this.energy <= 0) return;
        this.energy = Math.max(0, this.energy - 10);
        this.state = this.energy ? "hurt" : "dead";
        this.frame = 0;
        this.frameElapsed = 0;
        this.updateImage();
    }

    update(delta) {
        if (this.state === "finished") return;
        this.frameElapsed += delta;
        if (this.frameElapsed < 160) return;
        this.frameElapsed = 0;
        this.frame++;
        this.updateImage();
    }

    updateImage() {
        const images = this.getStateImages();
        if (this.frame >= images.length) return this.finishAnimation();
        this.img = this.imageCache[images[this.frame]];
    }

    getStateImages() {
        if (this.state === "hurt") return this.IMAGES_HURT;
        if (this.state === "dead") return this.IMAGES_DEAD;
        return this.IMAGES_WALKING;
    }

    finishAnimation() {
        if (this.state === "dead") return this.state = "finished";
        this.state = "walking";
        this.frame = 0;
        this.updateImage();
    }
}
