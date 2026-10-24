class chickenSmall extends MovableObject {
    height = 60;
    width = 60;
    y = 365;
    isDead = false;

    IMAGES_WALKING = [
        "img/3_enemies_chicken/chicken_small/1_walk/1_w.png",
        "img/3_enemies_chicken/chicken_small/1_walk/2_w.png",
        "img/3_enemies_chicken/chicken_small/1_walk/3_w.png"
    ];

    DEAD_IMAGE = "img/3_enemies_chicken/chicken_small/2_dead/dead.png";

    constructor(startX = null) {
        super();
        this.loadImage(this.IMAGES_WALKING[0]);
        this.loadImages(this.IMAGES_WALKING);
        this.loadImages([this.DEAD_IMAGE]);
        this.x = startX ?? 900 + Math.random() * 2000;
        this.speed = 0.7 + Math.random() * 1.15;
        this.animate();
    }

    animate() {
        this.moveLeft();
        this.animationInterval = setInterval(() => {
            if (this.isDead) return;
            const path = this.IMAGES_WALKING[this.currentImage];
            this.img = this.imageCache[path];
            this.currentImage = (this.currentImage + 1) % this.IMAGES_WALKING.length;
        }, 170);
    }

    die() {
        if (this.isDead) return;
        this.isDead = true;
        this.isCollidable = false;
        this.clearTimers();
        this.img = this.imageCache[this.DEAD_IMAGE];
    }
}
