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
    healthPhases = false;
    originX = 6100;
    direction = -1;
    IMAGES_WALKING = [1, 2, 3, 4].map(i => `img/4_enemie_boss_chicken/1_walk/G${i}.png`);
    IMAGES_ALERT = Array.from({length: 8}, (_, i) => `img/4_enemie_boss_chicken/2_alert/G${i + 5}.png`);
    IMAGES_ATTACK = Array.from({length: 8}, (_, i) => `img/4_enemie_boss_chicken/3_attack/G${i + 13}.png`);
    IMAGES_HURT = [21, 22, 23].map(i => `img/4_enemie_boss_chicken/4_hurt/G${i}.png`);
    IMAGES_DEAD = [24, 25, 26].map(i => `img/4_enemie_boss_chicken/5_dead/G${i}.png`);

    /**
     * DE: Erstellt ein neues Objekt und legt seine Startwerte fest.
     * EN: Creates a new object and sets its initial values.
     * @param {number} x - DE: x. EN: x.
     * @param {Object} moving - DE: Übergabewert moving. EN: Argument moving.
     */
    constructor(x = 6100, moving = false) {
        super();
        this.x = x;
        this.originX = x;
        this.moving = moving;
        this.loadImages([...this.IMAGES_WALKING, ...this.IMAGES_ALERT,
            ...this.IMAGES_ATTACK, ...this.IMAGES_HURT, ...this.IMAGES_DEAD]);
        this.img = this.imageCache[this.IMAGES_ALERT[0]];
    }

    /**
     * DE: Nimmt bottle hit.
     * EN: Takes bottle hit.
     */
    takeBottleHit() {
        if (this.energy <= 0) return;
        this.energy = Math.max(0, this.energy - (this.isMainBoss ? 20 : 100 / 3));
        this.setState(this.energy ? "hurt" : "dead");
    }

    /**
     * DE: Aktualisiert.
     * EN: Updates.
     * @param {number} delta - DE: Übergabewert delta. EN: Argument delta.
     * @param {Object} player - DE: Übergabewert player. EN: Argument player.
     */
    update(delta, player) {
        if (this.state === "finished") return;
        if (this.state === "falling") return this.updateFalling(delta);
        this.attackCooldown = Math.max(0, this.attackCooldown - delta);
        if (this.state === "walking" && this.moving) this.moveAndAttack(delta, player);
        if (this.state === "attack" && this.healthPhases && this.energy <= 20) {
            this.advanceAttack(delta, player);
        }
        this.frameElapsed += delta;
        if (this.frameElapsed < 160) return;
        this.frameElapsed = 0;
        this.frame++;
        this.updateImage();
    }

    /**
     * DE: Bewegt and attack.
     * EN: Moves and attack.
     * @param {number} delta - DE: Übergabewert delta. EN: Argument delta.
     * @param {Object} player - DE: Übergabewert player. EN: Argument player.
     */
    moveAndAttack(delta, player) {
        const distance = Math.abs(player.x - this.x);
        if (this.healthPhases && this.energy <= 20) this.facePlayer(player);
        if (distance < 220 && !this.attackCooldown) return this.beginAttack();
        if (distance < 240) return;
        this.chooseWalkingDirection(player);
        this.x += this.direction * delta * this.getMovementSpeed();
        this.otherDirection = this.direction > 0;
    }

    /** DE: Dreht den Boss zur Spielfigur. EN: Turns the boss toward the player. */
    facePlayer(player) {
        this.direction = player.x > this.x ? 1 : -1;
        this.otherDirection = this.direction > 0;
    }

    /** DE: Bestimmt die Laufrichtung des Bosses. EN: Chooses the boss movement direction. */
    chooseWalkingDirection(player) {
        if (this.healthPhases && this.energy <= 20) return this.facePlayer(player);
        if (this.healthPhases) {
            const chaseMin = this.originX - 1400;
            const chaseMax = this.originX + 600;
            if (this.x <= chaseMin && player.x < this.x) this.direction = 1;
            else if (this.x >= chaseMax && player.x > this.x) this.direction = -1;
            else this.facePlayer(player);
            return;
        }
        if (this.x < this.originX - 180) this.direction = 1;
        if (this.x > this.originX + 180) this.direction = -1;
    }

    /**
     * DE: Liefert movement speed.
     * EN: Returns movement speed.
     */
    getMovementSpeed() {
        if (!this.healthPhases) return 0.09;
        if (this.energy <= 20) return 0.23;
        if (this.energy <= 40) return 0.20;
        if (this.energy <= 60) return 0.18;
        return 0.16;
    }

    /** DE: Verfolgt die Spielfigur auch im Angriff. EN: Pursues the player during attacks. */
    advanceAttack(delta, player) {
        this.facePlayer(player);
        const distance = Math.abs(player.x - this.x);
        const step = Math.min(Math.max(0, distance - 100), delta * 0.28);
        this.x += this.direction * step;
    }

    /**
     * DE: Führt begin attack aus.
     * EN: Begin attack.
     */
    beginAttack() {
        this.attackHitDone = false;
        this.attackCooldown = this.healthPhases && this.energy <= 20 ? 900 : 1500;
        this.setState("attack");
    }

    /**
     * DE: Setzt state.
     * EN: Sets state.
     * @param {Object} state - DE: Übergabewert state. EN: Argument state.
     */
    setState(state) {
        this.state = state;
        this.frame = 0;
        this.frameElapsed = 0;
        this.updateImage();
    }

    /**
     * DE: Aktualisiert image.
     * EN: Updates image.
     */
    updateImage() {
        const images = this.getStateImages();
        if (this.frame >= images.length) return this.finishAnimation();
        this.img = this.imageCache[images[this.frame]];
    }

    /**
     * DE: Liefert state images.
     * EN: Returns state images.
     */
    getStateImages() {
        if (this.state === "hurt") return this.IMAGES_HURT;
        if (this.state === "dead") return this.IMAGES_DEAD;
        if (this.state === "attack") return this.IMAGES_ATTACK;
        return this.moving ? this.IMAGES_WALKING : this.IMAGES_ALERT;
    }


    /**
     * DE: Aktualisiert falling.
     * EN: Updates falling.
     * @param {number} delta - DE: Übergabewert delta. EN: Argument delta.
     */
    updateFalling(delta) {
        this.fallSpeed += 0.0012 * delta;
        this.y += this.fallSpeed * delta;
        if (this.y > 480) this.state = "finished";
    }

    /**
     * DE: Beendet animation.
     * EN: Finishes animation.
     */
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

    /**
     * DE: Erstellt ein neues Objekt und legt seine Startwerte fest.
     * EN: Creates a new object and sets its initial values.
     * @param {number} x - DE: x. EN: x.
     */
    constructor(x) {
        super(x, false);
    }
}
