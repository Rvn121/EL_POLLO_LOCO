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

    /**
     * Initializes this object and sets up its required game data.
     * @param {*} startX - The start x used by this method.
     */
    constructor(startX = null) {
        super();
        this.loadImage(this.IMAGES_WALKING[0]);
        this.loadImages(this.IMAGES_WALKING);
        this.loadImages([this.DEAD_IMAGE]);
        this.x = startX;
        if (startX === null) this.x = 900 + Math.random() * 2000;
        this.speed = 1.15 + Math.random() * 1.5;
        this.animate();
    }

    /**
     * Performs the animate operation for this game object.
     */
    animate() {
        this.moveLeft();
        this.animationInterval = setInterval(() => {
            if (window.gamePaused) return;
            if (this.isDead) return;
            const path = this.IMAGES_WALKING[this.currentImage];
            this.img = this.imageCache[path];
            this.currentImage = (this.currentImage + 1) % this.IMAGES_WALKING.length;
        }, 170);
    }

    /**
     * Marks the character as dead and stops normal movement.
     */
    die() {
        if (this.isDead) return;
        this.isDead = true;
        this.isCollidable = false;
        this.clearTimers();
        this.img = this.imageCache[this.DEAD_IMAGE];
    }
}
