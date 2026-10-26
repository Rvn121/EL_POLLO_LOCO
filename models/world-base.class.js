class WorldBase extends WorldDrawBase {
    /**
 * DE: Prüft einsammelbar Kollisionen.
 * EN: Checks collectible collisions.
 */
    checkCollectibleCollisions() {
        this.bottles.forEach(b => this.pickupBottle(b));
        this.coins.forEach(c => this.pickupCoin(c));
    }

    /**
 * DE: Verarbeitet Flasche.
 * EN: Processes bottle.
 * @param {ThrowableBottle} bottle - DE: Eingabewert. EN: Input value.
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
 * DE: Verarbeitet Münze.
 * EN: Processes coin.
 * @param {Object} coin - DE: Eingabewert. EN: Input value.
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
     * DE: Erstellt eine geworfene Flasche und verringert den Vorrat.
     * EN: Creates a thrown bottle and decreases the supply.
     * @param {number} power - DE: power. EN: power.
     */
    throwBottle(power = 1) {
        if (this.isGameOver || this.isWin || this.isPaused || this.bottleCount <= 0) return;
        let dir = 1;
        if (this.character.otherDirection) dir = -1;
        let offset = 20;
        if (dir === 1) offset = this.character.width - 75;
        const x = this.character.x + offset;
        this.thrownBottles.push(new ThrowableBottle(x, this.character.y + 65, dir, power));
        this.bottleCount--;
        this.bottleBar.setPercentage(this.getBottlePercentage());
    }

    /**
     * DE: Berechnet den Flaschenvorrat als Prozentwert.
     * EN: Calculates bottle inventory as a percentage.
     */
    getBottlePercentage() {
        return Math.ceil(this.bottleCount / 4) * 20;
    }

    /**
 * DE: Ermittelt Boss.
 * EN: Gets boss.
 */
    getBoss() {
        for (const enemy of this.level.enemies) {
            if (enemy instanceof Endboss && enemy.isMainBoss) return enemy;
        }
        return undefined;
    }

    /**
 * DE: Schaltet um: pause.
 * EN: Toggles: pause.
 */
    togglePause() {
        if (this.levelIntroActive) return true;
        this.isPaused = !this.isPaused;
        if (this.isPaused) gameSounds.stopAll();
        this.lastUpdate = Date.now();
        if (!this.isPaused) this.character.lastActivity = Date.now();
        return this.isPaused;
    }

    /**
 * DE: Prüft Boss attacks.
 * EN: Checks boss attacks.
 * @param {Object} bosses - DE: Eingabewert. EN: Input value.
 */
    checkBossAttacks(bosses) {
        bosses.forEach(boss => {
            if (boss.isMainBoss && !this.bossUnlocked) return;
            if (!boss.moving || boss.state !== "attack" || boss.frame !== 4) return;
            if (boss.attackHitDone || this.character.energy <= 0) return;
            if (Math.abs(boss.x - this.character.x) > 180) return;
            boss.attackHitDone = true;
            let damage = 10;
            if (this.levelNumber === 2) damage = 20;
            this.damageCharacter(damage);
        });
    }

    /**
     * DE: Prüft, ob die Spielfigur den Endboss berührt.
     * EN: Checks main boss contact for the game.
     */
    checkMainBossContact() {
        const boss = this.getBoss();
        if (!boss || boss.isDead || !this.bossUnlocked) return;
        if (this.character.energy <= 0 || !this.character.isColliding(boss)) return;
        if (!this.canTakeHitFrom(boss)) return;
        let damage = 10;
            if (this.levelNumber === 2) damage = 20;
            this.damageCharacter(damage);
        boss.lastHitPosition = { x: this.character.x, y: this.character.y };
    }

    /**
     * DE: Unterscheidet Sprungtreffer von schädlichen Gegnerkontakten.
     * EN: Distinguishes stomp hits from harmful enemy contact.
     * @param {MovableObject} enemy - DE: enemy. EN: enemy.
     */
    checkEnemyCollision(enemy) {
        if (enemy instanceof MiniBoss && !enemy.isDead) return this.checkMiniBossCollision(enemy);
        const isChicken = enemy instanceof chicken || enemy instanceof chickenSmall;
        if (!isChicken || enemy.isDead || this.character.energy <= 0) return;
        if (!this.character.isColliding(enemy)) return;
        if (this.isJumpAttack(enemy)) return this.killChicken(enemy);
        if (!this.canChickenDamageCharacter(enemy) || !this.canTakeHitFrom(enemy)) return;
        let damage = 5;
        if (this.levelNumber === 2) damage = 10;
        this.damageCharacter(damage);
        enemy.lastHitPosition = { x: this.character.x, y: this.character.y };
        this.statusBar.setPercentage(this.character.energy);
    }

    /**
 * DE: Prüft mini Boss Kollision.
 * EN: Checks mini boss collision.
 */
    checkMiniBossCollision(enemy) {
        if (!this.character.isColliding(enemy) || !this.canTakeHitFrom(enemy)) return;
        let damage = 10;
            if (this.levelNumber === 2) damage = 20;
            this.damageCharacter(damage);
        enemy.lastHitPosition = { x: this.character.x, y: this.character.y };
        this.statusBar.setPercentage(this.character.energy);
    }

    /**
 * DE: Prüft, ob Sprung attack.
 * EN: Checks whether jump attack.
 * @param {MovableObject} enemy - DE: Eingabewert. EN: Input value.
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
 * DE: Prüft, ob Huhn Schaden Spielfigur.
 * EN: Checks whether chicken damage character.
 * @param {MovableObject} enemy - DE: Eingabewert. EN: Input value.
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
     * DE: Zieht Lebenspunkte ab und aktualisiert Trefferfolgen.
     * EN: Removes health points and updates hit consequences.
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
 * DE: Prüft, ob take hit from.
 * EN: Checks whether take hit from.
 * @param {MovableObject} enemy - DE: Eingabewert. EN: Input value.
 */
    canTakeHitFrom(enemy) {
        if (!enemy.lastHitPosition) return true;
        const dx = this.character.x - enemy.lastHitPosition.x;
        const dy = this.character.y - enemy.lastHitPosition.y;
        return Math.hypot(dx, dy) >= 45;
    }

    /**
 * DE: Besiegt Huhn.
 * EN: Defeats chicken.
 * @param {MovableObject} enemy - DE: enemy. EN: enemy.
 */
    killChicken(enemy) {
        gameSounds.play("hit_chickens");
        enemy.die();
        this.character.bounceFromEnemy();
    }
}
