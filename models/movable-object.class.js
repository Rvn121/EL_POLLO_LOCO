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
     * DE: Bewegt right für das Spiel.
     * EN: Moves right for the game.
     */
    moveRight() {
        this.x += this.speed;
    }

    /**
     * DE: Bewegt left für das Spiel.
     * EN: Moves left for the game.
     */
    moveLeft() {
        clearInterval(this.moveInterval);
        this.moveInterval = setInterval(() => {
            if (window.gamePaused) return;
            this.x -= this.speed;
        }, 1000 / 60);
    }

    /**
     * DE: Startet patrol für das Spiel.
     * EN: Starts patrol for the game.
     * @param {number} left - DE: Wert left. EN: Value left.
     * @param {number} right - DE: Wert right. EN: Value right.
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
     * DE: Stoppt moving für das Spiel.
     * EN: Stops moving for the game.
     */
    stopMoving() {
        clearInterval(this.moveInterval);
    }

    /**
     * DE: Löscht timers für das Spiel.
     * EN: Clears timers for the game.
     */
    clearTimers() {
        clearInterval(this.moveInterval);
        clearInterval(this.animationInterval);
        clearInterval(this.idleInterval);
        clearInterval(this.deathInterval);
        clearTimeout(this.hurtTimeout);
    }

    /**
     * DE: Prüft colliding für das Spiel.
     * EN: Checks colliding for the game.
     * @param {MovableObject} movableObject - DE: Wert movableObject. EN: Value movableObject.
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
