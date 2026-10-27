class Coin extends DrawableObject {
    width = 186;
    height = 186;
    collected = false;
    vanishY = -60;
    baseY;
    phase = Math.random() * Math.PI * 2;
    IMAGES = ["img/8_coin/coin_1.png", "img/8_coin/coin_2.png"];

    /** DE: Erstellt das Objekt und setzt seine Startwerte. EN: Creates the object and sets its initial values.
 * @param {number} x - DE: Parameter x. EN: x parameter.
 * @param {number} y - DE: Parameter y. EN: y parameter.
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

    /** DE: Markiert ein Sammelobjekt als eingesammelt. EN: Marks a collectible as collected. */
    collect() {
        this.collected = true;
    }

    /** DE: Aktualisiert update. EN: Updates update.
 * @param {number} delta - DE: Parameter delta. EN: delta parameter.
 * @returns {*} DE: Berechnetes Ergebnis. EN: Computed result.
 */
    update(delta) {
        if (this.collected) return this.flyAway(delta);
        this.phase += delta * 0.004;
        this.y = this.baseY + Math.sin(this.phase) * 7;
        const frame = Math.floor(this.phase / 0.55) % 2;
        this.img = this.imageCache[this.IMAGES[Math.abs(frame)]];
    }

    /** DE: Bewegt eine eingesammelte Münze nach oben aus dem Bild. EN: Moves a collected coin upward offscreen.
 * @param {number} delta - DE: Parameter delta. EN: delta parameter.
 */
    flyAway(delta) {
        this.y -= delta * 0.7;
    }

    /** DE: Prüft, ob sichtbar. EN: Checks whether visible.
 * @returns {*} DE: Berechnetes Ergebnis. EN: Computed result.
 */
    isVisible() {
        return !this.collected || this.y + this.height > this.vanishY;
    }
}
