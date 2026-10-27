class cloud extends MovableObject {
    y = 20;
    width = 500;
    height = 250;
    speed = 0.15;

    IMAGES = [
        "img/5_background/layers/4_clouds/1.png",
        "img/5_background/layers/4_clouds/2.png"
    ];

    /** DE: Erstellt das Objekt und setzt seine Startwerte. EN: Creates the object and sets its initial values.
 * @param {number} [x] - DE: Parameter x. EN: x parameter.
 * @param {number} [y] - DE: Parameter y. EN: y parameter.
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

    /** DE: Ermittelt eine zufällige vertikale Wolkenposition. EN: Returns a random vertical cloud position.
 * @returns {*} DE: Berechnetes Ergebnis. EN: Computed result.
 */
    getRandomY() {
        return 5 + Math.random() * 110;
    }

    /** DE: Setzt zurück Position. EN: Resets position.
 * @param {number} x - DE: Parameter x. EN: x parameter.
 */
    resetPosition(x) {
        this.x = x;
        this.y = this.getRandomY();
    }
}
