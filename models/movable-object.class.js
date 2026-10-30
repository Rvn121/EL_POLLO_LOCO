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
     * Moves this object to the left using its current speed.
     */
    moveLeft() {
        clearInterval(this.moveInterval);
        this.moveInterval = setInterval(() => {
            if (window.gamePaused) return;
            this.x -= this.speed;
        }, 1000 / 60);
    }


    /**
     * Moves an enemy back and forth between its patrol boundaries.
     * @param {*} left - The left used by this method.
     * @param {*} right - The right used by this method.
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
     * Stops this object from moving.
     */
    stopMoving() {
        clearInterval(this.moveInterval);
    }


    /**
     * Stops timers started by this game object.
     */
    clearTimers() {
        clearInterval(this.moveInterval);
        clearInterval(this.animationInterval);
        clearInterval(this.idleInterval);
        clearInterval(this.deathInterval);
        clearTimeout(this.hurtTimeout);
    }


    /**
     * Checks whether two objects touch at visible image pixels.
     * @param {*} other - The other used by this method.
     */
    isTouchingVisiblePixels(other) {
        if (!this.isColliding(other)) return false;
        const own = this.getHitbox();
        const target = other.getHitbox();
        const left = Math.max(own.x, target.x);
        const top = Math.max(own.y, target.y);
        const right = Math.min(own.x + own.width, target.x + target.width);
        const bottom = Math.min(own.y + own.height, target.y + target.height);
        return this.checkVisibleOverlap(other, left, top, right, bottom);
    }


    /**
     * Checks overlap between the visible parts of two images.
     * @param {*} other - The other used by this method.
     * @param {*} left - The left used by this method.
     * @param {*} top - The top used by this method.
     * @param {*} right - The right used by this method.
     * @param {*} bottom - The bottom used by this method.
     */
    checkVisibleOverlap(other, left, top, right, bottom) {
        const columns = Math.ceil(right - left);
        const rows = Math.ceil(bottom - top);
        for (let row = 0; row < rows; row++) {
            const y = top + (row + 0.5) * (bottom - top) / rows;
            for (let column = 0; column < columns; column++) {
                const x = left + (column + 0.5) * (right - left) / columns;
                if (this.hasVisiblePixelAt(x, y) && other.hasVisiblePixelAt(x, y)) return true;
            }
        }
        return false;
    }


    /**
     * Checks whether this object overlaps another game object.
     * @param {*} movableObject - The movable object used by this method.
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
