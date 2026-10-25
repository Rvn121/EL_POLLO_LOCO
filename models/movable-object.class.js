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
     * DE: Bewegt right.
     * EN: Moves right.
     */
    moveRight() {
        this.x += this.speed;
    }

    /**
     * DE: Bewegt left.
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
     * @param {number} left - DE: Übergabewert left. EN: Argument left.
     * @param {number} right - DE: Übergabewert right. EN: Argument right.
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
     * DE: Löscht timers.
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
     * DE: Prüft die Überschneidung der Hitboxen.
     * EN: Is colliding.
     * @param {MovableObject} movableObject - DE: Übergabewert movableObject. EN: Argument movableObject.
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
