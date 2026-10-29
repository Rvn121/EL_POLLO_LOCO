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
     * Initializes this object and sets up its required game data.
     * @param {number} x - The horizontal coordinate.
     */
    constructor(x) {
        super();
        this.x = x;
        this.loadImages(this.IMAGES);
        this.img = this.imageCache[this.IMAGES[Math.floor(Math.random() * 2)]];
    }

    /**
     * Marks the collectible as picked up and starts its collection effect.
     */
    collect() {
        this.collected = true;
        this.respawnAt = 10000;
    }

    /**
     * Updates this game object for the current animation frame.
     * @param {number} delta - The delta used by this method.
     */
    update(delta = 0) {
        if (!this.collected) return;
        this.respawnAt -= delta;
        if (this.respawnAt <= 0) this.respawn();
    }

    /**
     * Returns a collected bottle to the map after its delay.
     */
    respawn() {
        this.collected = false;
        this.img = this.imageCache[this.IMAGES[Math.floor(Math.random() * 2)]];
    }
}
