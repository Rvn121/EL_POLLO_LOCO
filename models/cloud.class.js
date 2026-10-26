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
     * DE: Erstellt das Objekt und legt seine Anfangswerte fest.
     * EN: Creates the object and sets its initial values.
     * @param {number} x - DE: x. EN: x.
     * @param {number} y - DE: y. EN: y.
     */
    constructor(x = null, y = null) {
        super();
        const path = this.IMAGES[Math.floor(Math.random() * this.IMAGES.length)];
        this.loadImage(path);
        this.x = x === null ? Math.random() * 2500 : x;
        this.y = y === null ? this.getRandomY() : y;
        this.moveLeft();
    }

    /**
     * DE: Gibt random y für das Spiel.
     * EN: Returns random y for the game.
     */
    getRandomY() {
        return 5 + Math.random() * 110;
    }

    /**
     * DE: Setzt position für das Spiel.
     * EN: Resets position for the game.
     * @param {number} x - DE: Wert x. EN: Value x.
     */
    resetPosition(x) {
        this.x = x;
        this.y = this.getRandomY();
    }
}
