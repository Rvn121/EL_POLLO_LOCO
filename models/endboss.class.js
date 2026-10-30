class Endboss extends EndbossBase {
    height = 400;
    width = 250;
    y = 50;
    state = "walking";
    frame = 0;
    frameElapsed = 0;
    isMainBoss = true;
    isDead = false;
    attackCooldown = 0;
    bottleHitCooldown = 0;
    combatEngaged = false;
    attackInterval = 1600;
    attackSpeed = 0.20;
    chargeSpeed = 0.18;
    healthPhases = false;
    aggressive = false;
    hitPhases = false;
    combatPhase = "patrol";
    phaseRemaining = 0;
    patrolCenter = null;
    originX = 6100;
    direction = -1;
    retreatUntil = 0;
    approachUntil = 0;
    IMAGES_WALKING = this.createBossImages("1_walk", 1, 4);
    IMAGES_ALERT = this.createBossImages("2_alert", 5, 12);
    IMAGES_ATTACK = this.createBossImages("3_attack", 13, 20);
    IMAGES_HURT = this.createBossImages("4_hurt", 21, 23);
    IMAGES_DEAD = this.createBossImages("5_dead", 24, 26);

    /**
     * Builds the file paths for a sequence of boss animation frames.
     * @param {string} folder - The folder containing the animation images.
     * @param {number} first - The first animation frame number.
     * @param {number} last - The final animation frame number.
     * @returns {string[]} Paths to the boss animation images.
     */
    createBossImages(folder, first, last) {
        const images = [];
        for (let i = first; i <= last; i++) {
            images.push(`img/4_enemie_boss_chicken/${folder}/G${i}.png`);
        }
        return images;
    }


    /**
     * Initializes this object and sets up its required game data.
     * @param {number} x - The horizontal coordinate.
     * @param {*} moving - The moving used by this method.
     */
    constructor(x = 6100, moving = false) {
        super();
        this.x = x;
        this.originX = x;
        this.moving = moving;
        this.loadImages(this.IMAGES_WALKING);
        this.loadImages(this.IMAGES_ALERT);
        this.loadImages(this.IMAGES_ATTACK);
        this.loadImages(this.IMAGES_HURT);
        this.loadImages(this.IMAGES_DEAD);
        this.img = this.imageCache[this.IMAGES_ALERT[0]];
    }


    /** Reduces boss health after a valid bottle hit. */
    takeBottleHit() {
        if (this.energy <= 0) return false;
        if (this.isMainBoss && this.bottleHitCooldown > 0) return false;
        let damage = 100 / 3;
        if (this.isMainBoss) damage = 20;
        this.energy = Math.max(0, this.energy - damage);
        if (this.isMainBoss) this.bottleHitCooldown = 1200;
        this.reactToBottleDamage();
        return true;
    }


    /**
     * Updates this game object for the current animation frame.
     * @param {number} delta - The delta used by this method.
     * @param {Character} player - The character controlled by the player.
     */
    update(delta, player) {
        if (this.state === "finished") return;
        if (this.state === "falling") return this.updateFalling(delta);
        this.attackCooldown = Math.max(0, this.attackCooldown - delta);
        this.bottleHitCooldown = Math.max(0, this.bottleHitCooldown - delta);
        if (this.state === "walking" && this.moving) this.moveAndAttack(delta, player);
        if (this.state === "attack") this.advanceAttack(delta, player);
        this.updateAnimationFrame(delta);
    }


    /**
     * Updates boss movement and close-range attacks.
     * @param {number} delta - The delta used by this method.
     * @param {Character} player - The character controlled by the player.
     */
    moveAndAttack(delta, player) {
        if (this.hitPhases) return this.updateHitPhases(delta, player);
        if (this.aggressive) return this.chasePlayer(delta, player);
        if (this.healthPhases && this.energy <= 20) return this.chasePlayer(delta, player);
        if (this.healthPhases && this.energy <= 40 && this.retreatUntil > Date.now()) {
            return this.moveAfterHit(delta, player);
        }
        if (this.canReachPlayer(player) && !this.attackCooldown) return this.beginAttack(player);
        if (this.canReachPlayer(player)) return;
        this.chooseWalkingDirection(player);
        this.walk(delta);
    }


    /**
     * Updates patrol, retreat, and charge movement after a bottle hit.
     * @param {number} delta - Time passed since the previous update.
     * @param {Character} player - The player character.
     */
    updateHitPhases(delta, player) {
        if (!this.noticePlayer(player)) return this.patrolAfterRetreat(delta);
        const stepTime = Math.min(delta, Math.max(0, this.phaseRemaining));
        this.phaseRemaining = Math.max(0, this.phaseRemaining - delta);
        if (this.combatPhase === "retreat") return this.updateRetreatPhase(stepTime, player);
        this.updateChargePhase(delta, player);
    }


    /**
     * Moves away from the player until the retreat is finished.
     * @param {number} stepTime - Time used for the retreat movement.
     * @param {Character} player - The player character.
     */
    updateRetreatPhase(stepTime, player) {
        this.retreatFromPlayer(stepTime, player);
        if (!this.phaseRemaining) this.finishRetreat();
    }


    /**
     * Moves toward the player and may attack or start a retreat.
     * @param {number} delta - Time passed since the previous update.
     * @param {Character} player - The player character.
     */
    updateChargePhase(delta, player) {
        this.facePlayer(player);
        if (this.canReachPlayer(player) && !this.attackCooldown) return this.beginAttack(player);
        if (this.canReachPlayer(player)) return;
        if (!this.phaseRemaining) return this.beginRetreat();
        this.walk(delta);
    }


    /** Starts another charge after the player has had a short recovery break. */
    finishRetreat() {
        this.startCombat();
    }


    /** Keeps each chase limited, so the player gets regular breaks. */
    getChargeDuration() {
        return 2400 + Math.random() * 1400;
    }


    /**
     * Resumes boss patrol after moving away from the player.
     * @param {number} delta - The delta used by this method.
     */
    patrolAfterRetreat(delta) {
        let center = this.patrolCenter;
        if (center === null) {
            center = this.originX;
        }
        if (this.x <= center - 210) this.direction = 1;
        if (this.x >= center + 210) this.direction = -1;
        this.walk(delta);
    }


    /** Briefly turns away before the boss starts its next charge. */
    beginRetreat() {
        this.combatPhase = "retreat";
        this.phaseRemaining = 400 + Math.random() * 200;
    }


    /**
     * Moves the boss away from the character.
     * @param {number} delta - The delta used by this method.
     * @param {Character} player - The character controlled by the player.
     */
    retreatFromPlayer(delta, player) {
        this.facePlayer(player);
        this.direction *= -1;
        this.walk(delta);
    }


    /**
     * Moves the boss one step in its current direction.
     * @param {number} delta - The delta used by this method.
     */
    walk(delta) {
        this.x += this.direction * delta * this.getMovementSpeed();
        this.otherDirection = this.direction > 0;
    }


    /**
     * Moves the boss in response to a bottle hit.
     * @param {number} delta - The delta used by this method.
     * @param {Character} player - The character controlled by the player.
     */
    moveAfterHit(delta, player) {
        const approaching = Date.now() < this.approachUntil;
        if (player.x > this.x) this.direction = 1;
        else this.direction = -1;
        if (!approaching) this.direction *= -1;
        this.walk(delta);
    }


    /**
     * Moves the boss toward the player during its aggressive phase.
     * @param {number} delta - The delta used by this method.
     * @param {Character} player - The character controlled by the player.
     */
    chasePlayer(delta, player) {
        this.facePlayer(player);
        if (this.canReachPlayer(player) && !this.attackCooldown) return this.beginAttack(player);
        if (!this.canReachPlayer(player)) this.walk(delta);
    }


    /**
     * Turns the boss to face the player.
     * @param {Character} player - The character controlled by the player.
     */
    facePlayer(player) {
        if (player.x > this.x) this.direction = 1;
        else this.direction = -1;
        this.otherDirection = this.direction > 0;
    }


    /**
     * Chooses the boss walking direction within patrol boundaries.
     * @param {Character} player - The character controlled by the player.
     */
    chooseWalkingDirection(player) {
        let range = 180;
        if (this.healthPhases) range = 300;
        if (this.x <= this.originX - range) this.direction = 1;
        if (this.x >= this.originX + range) this.direction = -1;
    }


    /** Ends a defeated boss animation without changing its original result. */
    finishDeath() {
        this.isDead = true;
        this.isCollidable = false;
        if (this.isMainBoss) this.state = "finished";
        else this.state = "falling";
        this.fallSpeed = 0;
    }


    /** Moves forward during an attack without turning around or cancelling its frames. */
    advanceAttack(delta, player) {
        if (!this.moving || this.frame > 5 || !this.isPlayerInFront(player)) return;
        const own = this.getHitbox();
        const target = player.getHitbox();
        if (!own || !target) return;
        if (this.isTouchingVisiblePixels(player)) return;
        const distance = Math.abs(target.x + target.width / 2 - own.x - own.width / 2);
        const separation = Math.min(own.width, target.width) / 4;
        const step = Math.min(Math.max(0, distance - separation), delta * this.getAttackSpeed());
        this.x += this.direction * step;
    }


    /** Visible bounds determine when to start winding up, never whether damage lands. */
    canReachPlayer(player) {
        if (!player || player.energy <= 0) return false;
        const own = this.getHitbox();
        const target = player.getHitbox();
        if (!own || !target) return false;
        const gap = Math.max(target.x - (own.x + own.width), own.x - (target.x + target.width), 0);
        return gap <= 40 && own.y < target.y + target.height && target.y < own.y + own.height;
    }


    /** Uses the committed attack direction, so dodging behind the boss is safe. */
    isPlayerInFront(player) {
        const own = this.getHitbox();
        const target = player.getHitbox();
        if (!own || !target) return false;
        const offset = target.x + target.width / 2 - (own.x + own.width / 2);
        if (this.direction > 0) {
            return offset > 0;
        } else {
            return offset < 0;
        }
    }


    /** A strike lands only during G16-G18 and only where visible pixels touch. */
    canHitPlayer(player) {
        if (this.energy <= 0 || this.isDead || this.state !== "attack" || this.attackHitDone) return false;
        if (!player || player.energy <= 0 || this.frame < 3 || this.frame > 5) return false;
        return this.isPlayerInFront(player) && this.isTouchingVisiblePixels(player);
    }


    /** Starts the boss attack sequence when the player is close. */
    beginAttack(player) {
        if (player) this.facePlayer(player);
        this.attackHitDone = false;
        this.attackCooldown = this.attackInterval;
        if (this.aggressive) this.attackCooldown = 1100;
        if (this.aggressive && this.energy <= 20) this.attackCooldown = 850;
        this.setState("attack");
    }

}


/** Smaller static boss using the same animation set. */
class MiniBoss extends Endboss {
    height = 250;
    width = 155;
    y = 180;
    isMainBoss = false;

    /**
     * Initializes this object and sets up its required game data.
     * @param {number} x - The horizontal coordinate.
     */
    constructor(x) {
        super(x, false);
    }
}
