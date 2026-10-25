class WorldBase extends WorldDrawBase {
    /**
     * DE: Prüft collectible collisions.
     * EN: Checks collectible collisions.
     */
    checkCollectibleCollisions() {
        this.bottles.forEach(b => this.pickupBottle(b));
        this.coins.forEach(c => this.pickupCoin(c));
    }

    /**
     * DE: Sammelt ein bottle.
     * EN: Picks up bottle.
     * @param {ThrowableBottle} bottle - DE: Übergabewert bottle. EN: Argument bottle.
     */
    pickupBottle(bottle) {
        if (bottle.collected || this.bottleCount >= 20) return;
        if (!this.boxesOverlap(this.character, bottle)) return;
        bottle.collect();
        gameSounds.play("bottlecollect");
        this.bottleCount = Math.min(20, this.bottleCount + 4);
        this.bottleBar.setPercentage(this.getBottlePercentage());
    }

    /**
     * DE: Sammelt ein coin.
     * EN: Picks up coin.
     * @param {Object} coin - DE: Übergabewert coin. EN: Argument coin.
     */
    pickupCoin(coin) {
        if (coin.collected || !this.boxesOverlap(this.character, coin)) return;
        coin.collect();
        this.coinsCollected++;
        this.coinInventory++;
        this.coinValue = Math.min(100, Math.floor(this.coinsCollected / 10) * 20);
        this.bossUnlocked = this.coinsCollected === this.coins.length;
        this.updateCoinBar();
        gameSounds.play("drop_coin");
    }

    /**
     * DE: Wirft eine Flasche.
     * EN: Throw bottle.
     * @param {number} power - DE: power. EN: power.
     */
    throwBottle(power = 1) {
        if (this.isGameOver || this.isWin || this.isPaused || this.bottleCount <= 0) return;
        const dir = this.character.otherDirection ? -1 : 1;
        const x = this.character.x + (dir === 1 ? this.character.width - 75 : 20);
        this.thrownBottles.push(new ThrowableBottle(x, this.character.y + 65, dir, power));
        this.bottleCount--;
        this.bottleBar.setPercentage(this.getBottlePercentage());
    }

    /**
     * DE: Liefert bottle percentage.
     * EN: Returns bottle percentage.
     */
    getBottlePercentage() {
        return Math.ceil(this.bottleCount / 4) * 20;
    }

    /**
     * DE: Liefert den Endgegner.
     * EN: Get boss.
     */
    getBoss() {
        return this.level.enemies.find(enemy => enemy instanceof Endboss && enemy.isMainBoss);
    }

    /**
     * DE: Pausiert das Spiel oder setzt es fort.
     * EN: Toggle pause.
     */
    togglePause() {
        if (this.levelIntroActive) return true;
        this.isPaused = !this.isPaused;
        if (this.isPaused) gameSounds.stopAll();
        this.lastUpdate = performance.now();
        if (!this.isPaused) this.character.lastActivity = Date.now();
        return this.isPaused;
    }

    /**
     * DE: Prüft boss attacks.
     * EN: Checks boss attacks.
     * @param {Object} bosses - DE: Übergabewert bosses. EN: Argument bosses.
     */
    checkBossAttacks(bosses) {
        bosses.forEach(boss => {
            if (boss.isMainBoss && !this.bossUnlocked) return;
            if (!boss.moving || boss.state !== "attack" || boss.frame !== 4) return;
            if (boss.attackHitDone || this.character.energy <= 0) return;
            if (Math.abs(boss.x - this.character.x) > 180) return;
            boss.attackHitDone = true;
            this.damageCharacter(this.levelNumber === 2 ? 20 : 10);
        });
    }

    /**
     * DE: Prüft main boss contact.
     * EN: Checks main boss contact.
     */
    checkMainBossContact() {
        const boss = this.getBoss();
        if (!boss || boss.isDead || !this.bossUnlocked) return;
        if (this.character.energy <= 0 || !this.character.isColliding(boss)) return;
        if (!this.canTakeHitFrom(boss)) return;
        this.damageCharacter(this.levelNumber === 2 ? 20 : 10);
        boss.lastHitPosition = { x: this.character.x, y: this.character.y };
    }

    /**
     * DE: Prüft die Kollision mit einem Gegner.
     * EN: Check enemy collision.
     * @param {MovableObject} enemy - DE: enemy. EN: enemy.
     */
    checkEnemyCollision(enemy) {
        if (enemy instanceof MiniBoss && !enemy.isDead) return this.checkMiniBossCollision(enemy);
        const isChicken = enemy instanceof chicken || enemy instanceof chickenSmall;
        if (!isChicken || enemy.isDead || this.character.energy <= 0) return;
        if (!this.character.isColliding(enemy)) return;
        if (this.isJumpAttack(enemy)) return this.killChicken(enemy);
        if (!this.canChickenDamageCharacter(enemy) || !this.canTakeHitFrom(enemy)) return;
        this.damageCharacter(this.levelNumber === 2 ? 10 : 5);
        enemy.lastHitPosition = { x: this.character.x, y: this.character.y };
        this.statusBar.setPercentage(this.character.energy);
    }

    /** DE: Prüft den Kontakt mit einem Miniboss. EN: Checks mini-boss contact. */
    checkMiniBossCollision(enemy) {
        if (!this.character.isColliding(enemy) || !this.canTakeHitFrom(enemy)) return;
        this.damageCharacter(this.levelNumber === 2 ? 20 : 10);
        enemy.lastHitPosition = { x: this.character.x, y: this.character.y };
        this.statusBar.setPercentage(this.character.energy);
    }

    /**
     * DE: Prüft, ob jump attack zutrifft.
     * EN: Checks whether jump attack is true.
     * @param {MovableObject} enemy - DE: Übergabewert enemy. EN: Argument enemy.
     */
    isJumpAttack(enemy) {
        const player = this.character.getHitbox();
        const target = enemy.getHitbox();
        if (!player || !target || this.character.speedY >= 0) return false;
        const feet = player.y + player.height;
        const startedAbove = this.character.jumpStartedAboveEnemy(enemy);
        return startedAbove && feet >= target.y && player.y < target.y;
    }

    /**
     * DE: Prüft, ob chicken damage character zutrifft.
     * EN: Checks whether chicken damage character is true.
     * @param {MovableObject} enemy - DE: Übergabewert enemy. EN: Argument enemy.
     */
    canChickenDamageCharacter(enemy) {
        const player = this.character.getHitbox();
        const target = enemy.getHitbox();
        if (!player || !target) return false;
        if (this.character.isDescendingOnto(enemy)) return false;
        return player.y + player.height > target.y + target.height * 0.35 &&
            player.y < target.y + target.height;
    }

    /**
     * DE: Verringert die Lebensenergie der Spielfigur.
     * EN: Damage character.
     * @param {number} amount - DE: amount. EN: amount.
     */
    damageCharacter(amount) {
        if (this.character.energy <= 0) return;
        this.character.takeDamage(amount);
        if (this.coinInventory > 0) this.coinInventory--;
        this.updateCoinBar();
        this.statusBar.setPercentage(this.character.energy);
    }

    /**
     * DE: Prüft, ob take hit from zutrifft.
     * EN: Checks whether take hit from is true.
     * @param {MovableObject} enemy - DE: Übergabewert enemy. EN: Argument enemy.
     */
    canTakeHitFrom(enemy) {
        if (!enemy.lastHitPosition) return true;
        const dx = this.character.x - enemy.lastHitPosition.x;
        const dy = this.character.y - enemy.lastHitPosition.y;
        return Math.hypot(dx, dy) >= 45;
    }

    /**
     * DE: Besiegt ein Huhn.
     * EN: Kill chicken.
     * @param {MovableObject} enemy - DE: enemy. EN: enemy.
     */
    killChicken(enemy) {
        gameSounds.play("hit_chickens");
        enemy.die();
        this.character.bounceFromEnemy();
    }
}
