class CollectibleBottle extends DrawableObject {
    width = 52;
    height = 58;
    y = 365;
    collected = false;
    respawnAt = 0;

    IMAGES = [
        "img/6_salsa_bottle/1_salsa_bottle_on_ground.png",
        "img/6_salsa_bottle/2_salsa_bottle_on_ground.png"
    ];

    /** DE: Erstellt das Objekt und setzt seine Startwerte. EN: Creates the object and sets its initial values.
 * @param {number} x - DE: Parameter x. EN: x parameter.
 */
    constructor(x) {
        super();
        this.x = x;
        this.loadImages(this.IMAGES);
        this.img = this.imageCache[this.IMAGES[Math.floor(Math.random() * 2)]];
    }

    /** DE: Markiert ein Sammelobjekt als eingesammelt. EN: Marks a collectible as collected. */
    collect() {
        this.collected = true;
        this.respawnAt = 30000;
    }

    /** DE: Aktualisiert update. EN: Updates update.
 * @param {number} [delta] - DE: Parameter delta. EN: delta parameter.
 */
    update(delta = 0) {
        if (!this.collected) return;
        this.respawnAt -= delta;
        if (this.respawnAt <= 0) this.respawn();
    }

    /** DE: Erzeugt erneut respawn. EN: Respawns respawn. */
    respawn() {
        this.collected = false;
        this.img = this.imageCache[this.IMAGES[Math.floor(Math.random() * 2)]];
    }
}
