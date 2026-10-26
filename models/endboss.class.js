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
    retreatUntil = 0;
    approachUntil = 0;
    IMAGES_WALKING = [1, 2, 3, 4].map(i => `img/4_enemie_boss_chicken/1_walk/G${i}.png`);
    IMAGES_ALERT = Array.from({length: 8}, (_, i) => `img/4_enemie_boss_chicken/2_alert/G${i + 5}.png`);
    IMAGES_ATTACK = Array.from({length: 8}, (_, i) => `img/4_enemie_boss_chicken/3_attack/G${i + 13}.png`);
    IMAGES_HURT = [21, 22, 23].map(i => `img/4_enemie_boss_chicken/4_hurt/G${i}.png`);
    IMAGES_DEAD = [24, 25, 26].map(i => `img/4_enemie_boss_chicken/5_dead/G${i}.png`);

    /**
     * DE: Erstellt das Objekt und legt seine Anfangswerte fest.
     * EN: Creates the object and sets its initial values.
     * @param {number} x - DE: x. EN: x.
     * @param {Object} moving - DE: Wert moving. EN: Value moving.
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
     * DE: Verarbeitet bottle hit für das Spiel.
     * EN: Handles bottle hit for the game.
     */
    takeBottleHit() {
        if (this.energy <= 0) return;
        this.energy = Math.max(0, this.energy - (this.isMainBoss ? 20 : 100 / 3));
        if (this.isMainBoss && this.healthPhases && this.energy > 0) {
            this.approachUntil = Date.now() + 1400;
            this.retreatUntil = Date.now() + 2800;
        }
        this.setState(this.energy ? "hurt" : "dead");
    }

    /**
     * DE: Führt update im Spiel aus.
     * EN: Runs update in the game.
     * @param {number} delta - DE: Wert delta. EN: Value delta.
     * @param {Object} player - DE: Wert player. EN: Value player.
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
     * DE: Bewegt and attack für das Spiel.
     * EN: Moves and attack for the game.
     * @param {number} delta - DE: Wert delta. EN: Value delta.
     * @param {Object} player - DE: Wert player. EN: Value player.
     */
    moveAndAttack(delta, player) {
        const distance = Math.abs(player.x - this.x);
        if (this.healthPhases && this.energy <= 20) return this.chasePlayer(delta, player);
        if (this.healthPhases && this.energy <= 40 && this.retreatUntil > Date.now()) {
            return this.moveAfterHit(delta, player);
        }
        if (distance < 220 && !this.attackCooldown) return this.beginAttack();
        if (distance < 240) return;
        this.chooseWalkingDirection(player);
        this.walk(delta);
    }

    /** DE: Bewegt den Boss innerhalb seiner Strecke. EN: Moves the boss along its path. */
    walk(delta) {
        this.x += this.direction * delta * this.getMovementSpeed();
        this.otherDirection = this.direction > 0;
    }

    /** DE: Nach einem Treffer nähert sich der Boss und zieht sich zurück. EN: Approaches after a hit, then retreats. */
    moveAfterHit(delta, player) {
        const approaching = Date.now() < this.approachUntil;
        this.direction = player.x > this.x ? 1 : -1;
        if (!approaching) this.direction *= -1;
        this.walk(delta);
    }

    /** DE: Unter 20 Prozent verfolgt und attackiert der Boss Pepe. EN: Below 20 percent the boss chases and attacks Pepe. */
    chasePlayer(delta, player) {
        this.facePlayer(player);
        if (Math.abs(player.x - this.x) < 220 && !this.attackCooldown) return this.beginAttack();
        if (Math.abs(player.x - this.x) > 110) this.walk(delta);
    }

    /**
     * DE: Dreht den Boss in Richtung der Spielfigur.
     * EN: Turns the boss towards the player.
     */
    facePlayer(player) {
        this.direction = player.x > this.x ? 1 : -1;
        this.otherDirection = this.direction > 0;
    }

    /**
     * DE: Führt choose walking direction im Spiel aus.
     * EN: Runs choose walking direction in the game.
     */
    chooseWalkingDirection(player) {
        const range = this.healthPhases ? 300 : 180;
        if (this.x <= this.originX - range) this.direction = 1;
        if (this.x >= this.originX + range) this.direction = -1;
    }

    /**
     * DE: Gibt movement speed für das Spiel.
     * EN: Returns movement speed for the game.
     */
    getMovementSpeed() {
        if (!this.healthPhases) return 0.09;
        if (this.energy <= 20) return 0.23;
        if (this.energy <= 40) return 0.20;
        if (this.energy <= 60) return 0.18;
        return 0.16;
    }

    /**
     * DE: Setzt die laufende Bossangriffsanimation fort.
     * EN: Advances the current boss attack animation.
     */
    advanceAttack(delta, player) {
        this.facePlayer(player);
        const distance = Math.abs(player.x - this.x);
        const step = Math.min(Math.max(0, distance - 100), delta * 0.28);
        this.x += this.direction * step;
    }

    /**
     * DE: Startet den Angriff des Bosses.
     * EN: Starts a boss attack.
     */
    beginAttack() {
        this.attackHitDone = false;
        this.attackCooldown = this.healthPhases && this.energy <= 20 ? 900 : 1500;
        this.setState("attack");
    }

    /**
     * DE: Setzt state für das Spiel.
     * EN: Sets state for the game.
     * @param {Object} state - DE: Wert state. EN: Value state.
     */
    setState(state) {
        this.state = state;
        this.frame = 0;
        this.frameElapsed = 0;
        this.updateImage();
    }

    /**
     * DE: Aktualisiert image für das Spiel.
     * EN: Updates image for the game.
     */
    updateImage() {
        const images = this.getStateImages();
        if (this.frame >= images.length) return this.finishAnimation();
        this.img = this.imageCache[images[this.frame]];
    }

    /**
     * DE: Liefert die Bilder für den aktuellen Bosszustand.
     * EN: Returns images for the current boss state.
     */
    getStateImages() {
        if (this.state === "hurt") return this.IMAGES_HURT;
        if (this.state === "dead") return this.IMAGES_DEAD;
        if (this.state === "attack") return this.IMAGES_ATTACK;
        return this.moving ? this.IMAGES_WALKING : this.IMAGES_ALERT;
    }


    /**
     * DE: Bewegt den besiegten Boss nach unten aus dem Bild.
     * EN: Moves the defeated boss downward offscreen.
     * @param {number} delta - DE: Wert delta. EN: Value delta.
     */
    updateFalling(delta) {
        this.fallSpeed += 0.0012 * delta;
        this.y += this.fallSpeed * delta;
        if (this.y > 480) this.state = "finished";
    }

    /**
     * DE: Beendet animation für das Spiel.
     * EN: Finishes animation for the game.
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
     * DE: Erstellt das Objekt und legt seine Anfangswerte fest.
     * EN: Creates the object and sets its initial values.
     * @param {number} x - DE: x. EN: x.
     */
    constructor(x) {
        super(x, false);
    }
}
