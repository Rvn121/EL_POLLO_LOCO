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

    constructor(x) {
        super();
        this.x = x;
        this.loadImages(this.IMAGES);
        this.img = this.imageCache[this.IMAGES[Math.floor(Math.random() * 2)]];
    }

    collect() {
        this.collected = true;
        this.respawnAt = Date.now() + 30000;
    }

    update() {
        if (this.collected && Date.now() >= this.respawnAt) this.respawn();
    }

    respawn() {
        this.collected = false;
        this.img = this.imageCache[this.IMAGES[Math.floor(Math.random() * 2)]];
    }
}
