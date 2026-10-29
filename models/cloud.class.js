class cloud extends MovableObject {
    y = 20;
    width = 500;
    height = 250;
    speed = 0.15;

    IMAGES = [
        "img/5_background/layers/4_clouds/1.png",
        "img/5_background/layers/4_clouds/2.png"
    ];

    /**
     * Initializes this object and sets up its required game data.
     * @param {number} x - The horizontal coordinate.
     * @param {number} y - The vertical coordinate.
     */
    constructor(x = null, y = null) {
        super();
        const path = this.IMAGES[Math.floor(Math.random() * this.IMAGES.length)];
        this.loadImage(path);
        this.x = x;
        if (x === null) this.x = Math.random() * 2500;
        this.y = y;
        if (y === null) this.y = this.getRandomY();
        this.moveLeft();
    }

    /**
     * Performs the get random y operation for this game object.
     */
    getRandomY() {
        return 5 + Math.random() * 110;
    }

    /**
     * Performs the reset position operation for this game object.
     * @param {number} x - The horizontal coordinate.
     */
    resetPosition(x) {
        this.x = x;
        this.y = this.getRandomY();
    }
}
