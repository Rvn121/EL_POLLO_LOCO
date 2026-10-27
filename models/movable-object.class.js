class MovableObject extends DrawableObject {
    speed = 0.15;
    energy = 100;
    isCollidable = true;
    moveInterval;
    animationInterval;
    idleInterval;
    deathInterval;
    hurtTimeout;

    /** DE: Bewegt rechts. EN: Moves right. */
    moveRight() {
        this.x += this.speed;
    }

    /** DE: Bewegt links. EN: Moves left. */
    moveLeft() {
        clearInterval(this.moveInterval);
        this.moveInterval = setInterval(() => {
            if (window.gamePaused) return;
            this.x -= this.speed;
        }, 1000 / 60);
    }

    /** DE: Startet Patrouille. EN: Starts patrol.
 * @param {number} left - DE: Parameter left. EN: left parameter.
 * @param {number} right - DE: Parameter right. EN: right parameter.
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

    /** DE: Stoppt moving. EN: Stops moving. */
    stopMoving() {
        clearInterval(this.moveInterval);
    }

    /** DE: Löscht Zeitgeber. EN: Clears timers. */
    clearTimers() {
        clearInterval(this.moveInterval);
        clearInterval(this.animationInterval);
        clearInterval(this.idleInterval);
        clearInterval(this.deathInterval);
        clearTimeout(this.hurtTimeout);
    }

    /** DE: Prüft, ob sich sichtbare Bildbereiche berühren. EN: Checks whether visible sprite pixels overlap.
 * @param {*} other - DE: Parameter other. EN: other parameter.
 * @returns {*} DE: Berechnetes Ergebnis. EN: Computed result.
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

    /** DE: Prüft den überlappenden Bildbereich pixelweise. EN: Checks overlapping image pixels.
 * @param {*} other - DE: Parameter other. EN: other parameter.
 * @param {number} left - DE: Parameter left. EN: left parameter.
 * @param {number} top - DE: Parameter top. EN: top parameter.
 * @param {number} right - DE: Parameter right. EN: right parameter.
 * @param {number} bottom - DE: Parameter bottom. EN: bottom parameter.
 * @returns {*} DE: Berechnetes Ergebnis. EN: Computed result.
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

    /** DE: Prüft, ob sich zwei Hitboxen überschneiden. EN: Checks whether two hitboxes overlap.
 * @param {*} movableObject - DE: Parameter movableObject. EN: movableObject parameter.
 * @returns {*} DE: Berechnetes Ergebnis. EN: Computed result.
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
