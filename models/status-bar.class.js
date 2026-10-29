class StatusBar extends DrawableObject {
    IMAGES_HEALTH = [
        "img/7_statusbars/1_statusbar/2_statusbar_health/blue/0.png",
        "img/7_statusbars/1_statusbar/2_statusbar_health/blue/20.png",
        "img/7_statusbars/1_statusbar/2_statusbar_health/blue/40.png",
        "img/7_statusbars/1_statusbar/2_statusbar_health/blue/60.png",
        "img/7_statusbars/1_statusbar/2_statusbar_health/blue/80.png",
        "img/7_statusbars/1_statusbar/2_statusbar_health/blue/100.png"
    ];

    /**
     * Initializes this object and sets up its required game data.
     */
    constructor() {
        super();
        this.loadImages(this.IMAGES_HEALTH);
        this.x = 20;
        this.y = 0;
        this.width = 200;
        this.height = 60;
        this.setPercentage(100);
    }

    /**
     * Updates a status bar to display the specified percentage.
     * @param {number} percentage - The value to display from 0 to 100.
     */
    setPercentage(percentage) {
        this.percentage = Math.max(0, percentage);
        this.img = this.imageCache[this.IMAGES_HEALTH[this.resolveImageIndex()]];
    }

    /**
     * Returns the image index corresponding to the current percentage.
     */
    resolveImageIndex() {
        if (this.percentage > 80) return 5;
        if (this.percentage > 60) return 4;
        if (this.percentage > 40) return 3;
        if (this.percentage > 20) return 2;
        if (this.percentage > 0) return 1;
        return 0;
    }
}
