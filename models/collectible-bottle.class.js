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
     * DE: Erstellt das Objekt und legt seine Anfangswerte fest.
     * EN: Creates the object and sets its initial values.
     * @param {number} x - DE: x. EN: x.
     */
    constructor(x) {
        super();
        this.x = x;
        this.loadImages(this.IMAGES);
        this.img = this.imageCache[this.IMAGES[Math.floor(Math.random() * 2)]];
    }

    /**
     * DE: Führt collect im Spiel aus.
     * EN: Runs collect in the game.
     */
    collect() {
        this.collected = true;
        this.respawnAt = 30000;
    }

    /**
     * DE: Führt update im Spiel aus.
     * EN: Runs update in the game.
     * @param {number} delta - DE: Wert delta. EN: Value delta.
     */
    update(delta = 0) {
        if (!this.collected) return;
        this.respawnAt -= delta;
        if (this.respawnAt <= 0) this.respawn();
    }

    /**
     * DE: Führt respawn im Spiel aus.
     * EN: Runs respawn in the game.
     */
    respawn() {
        this.collected = false;
        this.img = this.imageCache[this.IMAGES[Math.floor(Math.random() * 2)]];
    }
}
