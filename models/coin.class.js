class Coin extends DrawableObject {
    width = 186;
    height = 186;
    collected = false;
    vanishY = -60;
    baseY;
    phase = Math.random() * Math.PI * 2;
    IMAGES = ["img/8_coin/coin_1.png", "img/8_coin/coin_2.png"];

    /**
     * DE: Erstellt das Objekt und legt seine Anfangswerte fest.
     * EN: Creates the object and sets its initial values.
     * @param {number} x - DE: x. EN: x.
     * @param {number} y - DE: y. EN: y.
     */
    constructor(x, y) {
        super();
        this.x = x;
        this.y = y;
        this.baseY = y - 20;
        this.y = this.baseY;
        this.loadImages(this.IMAGES);
        this.img = this.imageCache[this.IMAGES[0]];
    }

    /**
 * DE: Sammelt.
 * EN: Collects.
 */
    collect() {
        this.collected = true;
    }

    /**
 * DE: Aktualisiert.
 * EN: Updates.
 * @param {number} delta - DE: Eingabewert. EN: Input value.
 */
    update(delta) {
        if (this.collected) return this.flyAway(delta);
        this.phase += delta * 0.004;
        this.y = this.baseY + Math.sin(this.phase) * 7;
        const frame = Math.floor(this.phase / 0.55) % 2;
        this.img = this.imageCache[this.IMAGES[Math.abs(frame)]];
    }

    /**
     * DE: Bewegt eine eingesammelte Münze nach oben aus dem Bild.
     * EN: Moves a collected coin upward offscreen.
     * @param {number} delta - DE: delta. EN: delta.
     */
    flyAway(delta) {
        this.y -= delta * 0.7;
    }

    /**
 * DE: Prüft, ob sichtbar.
 * EN: Checks whether visible.
 */
    isVisible() {
        return !this.collected || this.y + this.height > this.vanishY;
    }
}
