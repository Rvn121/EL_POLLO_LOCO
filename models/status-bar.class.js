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
     * DE: Erstellt ein neues Objekt und legt seine Startwerte fest.
     * EN: Creates a new object and sets its initial values.
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
     * DE: Setzt den Statusleistenwert.
     * EN: Set percentage.
     * @param {number} percentage - DE: percentage. EN: percentage.
     */
    setPercentage(percentage) {
        this.percentage = Math.max(0, percentage);
        this.img = this.imageCache[this.IMAGES_HEALTH[this.resolveImageIndex()]];
    }

    /**
     * DE: Ermittelt image index.
     * EN: Resolves image index.
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
