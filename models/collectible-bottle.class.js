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

    /**
     * DE: Erstellt ein neues Objekt und legt seine Startwerte fest.
     * EN: Creates a new object and sets its initial values.
     * @param {number} x - DE: x. EN: x.
     */
    constructor(x) {
        super();
        this.x = x;
        this.loadImages(this.IMAGES);
        this.img = this.imageCache[this.IMAGES[Math.floor(Math.random() * 2)]];
    }

    /**
     * DE: Sammelt.
     * EN: Collects.
     */
    collect() {
        this.collected = true;
        this.respawnAt = 30000;
    }

    /**
     * DE: Aktualisiert.
     * EN: Updates.
     * @param {number} delta - DE: Übergabewert delta. EN: Argument delta.
     */
    update(delta = 0) {
        if (!this.collected) return;
        this.respawnAt -= delta;
        if (this.respawnAt <= 0) this.respawn();
    }

    /**
     * DE: Legt die Flasche nach der Wartezeit wieder auf die Karte.
     * EN: Returns the bottle to the map after its cooldown.
     */
    respawn() {
        this.collected = false;
        this.img = this.imageCache[this.IMAGES[Math.floor(Math.random() * 2)]];
    }
}
