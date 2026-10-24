class cloud extends MovableObject {
    y = 20;
    width = 500;
    height = 250;
    speed = 0.15;

    IMAGES = [
        "img/5_background/layers/4_clouds/1.png",
        "img/5_background/layers/4_clouds/2.png"
    ];

    constructor(x = null, y = null) {
        super();
        const path = this.IMAGES[Math.floor(Math.random() * this.IMAGES.length)];
        this.loadImage(path);
        this.x = x ?? Math.random() * 2500;
        this.y = y ?? this.getRandomY();
        this.moveLeft();
    }

    getRandomY() {
        return 5 + Math.random() * 110;
    }

    resetPosition(x) {
        this.x = x;
        this.y = this.getRandomY();
    }
}
