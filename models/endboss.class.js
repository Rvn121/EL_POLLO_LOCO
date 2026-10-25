class Endboss extends MovableObject {
    height = 400;
    width = 250;
    y = 50;
    state = "walking";
    frame = 0;
    frameElapsed = 0;
    isMainBoss = true;
    isDead = false;
    attackCooldown = 0;
    originX = 6100;
    direction = -1;
    IMAGES_WALKING = [1, 2, 3, 4].map(i => `img/4_enemie_boss_chicken/1_walk/G${i}.png`);
    IMAGES_ALERT = Array.from({length: 8}, (_, i) => `img/4_enemie_boss_chicken/2_alert/G${i + 5}.png`);
    IMAGES_ATTACK = Array.from({length: 8}, (_, i) => `img/4_enemie_boss_chicken/3_attack/G${i + 13}.png`);
    IMAGES_HURT = [21, 22, 23].map(i => `img/4_enemie_boss_chicken/4_hurt/G${i}.png`);
    IMAGES_DEAD = [24, 25, 26].map(i => `img/4_enemie_boss_chicken/5_dead/G${i}.png`);

    constructor(x = 6100, moving = false) {
        super();
        this.x = x;
        this.originX = x;
        this.moving = moving;
        this.loadImages([...this.IMAGES_WALKING, ...this.IMAGES_ALERT,
            ...this.IMAGES_ATTACK, ...this.IMAGES_HURT, ...this.IMAGES_DEAD]);
        this.img = this.imageCache[this.IMAGES_ALERT[0]];
    }

    /** Each bottle removes ten energy points. */
    takeBottleHit() {
        if (this.energy <= 0) return;
        this.energy = Math.max(0, this.energy - (this.isMainBoss ? 20 : 100 / 3));
        this.setState(this.energy ? "hurt" : "dead");
    }

    /** Advances animations and optional patrol/attack behavior. */
    update(delta, player) {
        if (this.state === "finished") return;
        if (this.state === "falling") return this.updateFalling(delta);
        this.attackCooldown = Math.max(0, this.attackCooldown - delta);
        if (this.state === "walking" && this.moving) this.moveAndAttack(delta, player);
        this.frameElapsed += delta;
        if (this.frameElapsed < 160) return;
        this.frameElapsed = 0;
        this.frame++;
        this.updateImage();
    }

    moveAndAttack(delta, player) {
        const distance = Math.abs(player.x - this.x);
        if (distance < 220 && !this.attackCooldown) return this.beginAttack();
        if (distance < 240) return;
        if (this.x < this.originX - 180) this.direction = 1;
        if (this.x > this.originX + 180) this.direction = -1;
        this.x += this.direction * delta * 0.09;
        this.otherDirection = this.direction > 0;
    }

    beginAttack() {
        this.attackHitDone = false;
        this.attackCooldown = 1500;
        this.setState("attack");
    }

    setState(state) {
        this.state = state;
        this.frame = 0;
        this.frameElapsed = 0;
        this.updateImage();
    }

    updateImage() {
        const images = this.getStateImages();
        if (this.frame >= images.length) return this.finishAnimation();
        this.img = this.imageCache[images[this.frame]];
    }

    getStateImages() {
        if (this.state === "hurt") return this.IMAGES_HURT;
        if (this.state === "dead") return this.IMAGES_DEAD;
        if (this.state === "attack") return this.IMAGES_ATTACK;
        return this.moving ? this.IMAGES_WALKING : this.IMAGES_ALERT;
    }


    /** Drops a defeated miniboss below the canvas after its final sprite. */
    updateFalling(delta) {
        this.fallSpeed += 0.0012 * delta;
        this.y += this.fallSpeed * delta;
        if (this.y > 480) this.state = "finished";
    }

    finishAnimation() {
        if (this.state === "dead") {
            this.isDead = true;
            this.isCollidable = false;
            this.state = this.isMainBoss ? "finished" : "falling";
            this.fallSpeed = 0;
            return;
        }
        this.setState("walking");
    }
}

/** Smaller static boss using the same animation set. */
class MiniBoss extends Endboss {
    height = 250;
    width = 155;
    y = 180;
    isMainBoss = false;

    constructor(x) {
        super(x, false);
    }
}
