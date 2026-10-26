class MovableObject extends DrawableObject {
    speed = 0.15;
    energy = 100;
    isCollidable = true;
    moveInterval;
    animationInterval;
    idleInterval;
    deathInterval;
    hurtTimeout;

    /**
 * DE: Bewegt rechts.
 * EN: Moves right.
 */
    moveRight() {
        this.x += this.speed;
    }

    /**
 * DE: Bewegt links.
 * EN: Moves left.
 */
    moveLeft() {
        clearInterval(this.moveInterval);
        this.moveInterval = setInterval(() => {
            if (window.gamePaused) return;
            this.x -= this.speed;
        }, 1000 / 60);
    }

    /**
 * DE: Startet patrol.
 * EN: Starts patrol.
 * @param {number} left - DE: Eingabewert. EN: Input value.
 * @param {number} right - DE: Eingabewert. EN: Input value.
 */
    startPatrol(left, right) {
        this.stopMoving();
        this.patrolDirection = 1;
        this.moveInterval = setInterval(() => {
            if (window.gamePaused || this.isDead) return;
            if (this.x >= right) this.patrolDirection = -1;
            if (this.x <= left) this.patrolDirection = 1;
            this.x += this.speed * this.patrolDirection;
            this.otherDirection = this.patrolDirection > 0;
        }, 1000 / 60);
    }

    /**
 * DE: Stoppt moving.
 * EN: Stops moving.
 */
    stopMoving() {
        clearInterval(this.moveInterval);
    }

    /**
 * DE: Leert Zeitgeber.
 * EN: Clears timers.
 */
    clearTimers() {
        clearInterval(this.moveInterval);
        clearInterval(this.animationInterval);
        clearInterval(this.idleInterval);
        clearInterval(this.deathInterval);
        clearTimeout(this.hurtTimeout);
    }

    /**
 * DE: Prüft, ob colliding.
 * EN: Checks whether colliding.
 * @param {MovableObject} movableObject - DE: Eingabewert. EN: Input value.
 */
    isColliding(movableObject) {
        const ownHitbox = this.getHitbox();
        const otherHitbox = movableObject.getHitbox();
        if (!this.isCollidable || !movableObject.isCollidable) return false;
        if (!ownHitbox || !otherHitbox) return false;
        return ownHitbox.x + ownHitbox.width > otherHitbox.x &&
            ownHitbox.x < otherHitbox.x + otherHitbox.width &&
            ownHitbox.y + ownHitbox.height > otherHitbox.y &&
            ownHitbox.y < otherHitbox.y + otherHitbox.height;
    }
}
