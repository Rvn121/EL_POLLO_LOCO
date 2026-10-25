class chicken extends MovableObject {
    height = 70;
    width = 70;
    y = 355;
    isDead = false;

    IMAGES_WALKING = [
        "img/3_enemies_chicken/chicken_normal/1_walk/1_w.png",
        "img/3_enemies_chicken/chicken_normal/1_walk/2_w.png",
        "img/3_enemies_chicken/chicken_normal/1_walk/3_w.png"
    ];

    DEAD_IMAGE = "img/3_enemies_chicken/chicken_normal/2_dead/dead.png";

    /**
     * DE: Erstellt ein neues Objekt und legt seine Startwerte fest.
     * EN: Creates a new object and sets its initial values.
     * @param {number} startX - DE: startX. EN: startX.
     */
    constructor(startX = null) {
        super();
        this.loadImage(this.IMAGES_WALKING[0]);
        this.loadImages(this.IMAGES_WALKING);
        this.loadImages([this.DEAD_IMAGE]);
        this.x = startX ?? 2400 + Math.random() * 2600;
        this.speed = 0.8 + Math.random() * 1.1;
        this.animate();
    }

    /**
     * DE: Startet eine Animation.
     * EN: Animate.
     */
    animate() {
        this.moveLeft();
        this.animationInterval = setInterval(() => {
            if (window.gamePaused) return;
            if (this.isDead) return;
            const path = this.IMAGES_WALKING[this.currentImage];
            this.img = this.imageCache[path];
            this.currentImage = (this.currentImage + 1) % this.IMAGES_WALKING.length;
        }, 200);
    }

    /**
     * DE: Lässt das Objekt sterben.
     * EN: Kills the object.
     */
    die() {
        if (this.isDead) return;
        this.isDead = true;
        this.isCollidable = false;
        this.clearTimers();
        this.y += 12;
        this.img = this.imageCache[this.DEAD_IMAGE];
    }
}
