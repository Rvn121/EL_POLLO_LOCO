class WorldBase extends WorldDrawBase {
    /** DE: Prüft collectible Kollisionen. EN: Checks collectible collisions. */
    checkCollectibleCollisions() {
        this.bottles.forEach(b => this.pickupBottle(b));
        this.coins.forEach(c => this.pickupCoin(c));
    }

    /** DE: Sammelt ein Flasche. EN: Picks up bottle.
 * @param {*} bottle - DE: Parameter bottle. EN: bottle parameter.
 */
    pickupBottle(bottle) {
        if (bottle.collected || this.bottleCount >= 20) return;
        if (!this.boxesOverlap(this.character, bottle)) return;
        bottle.collect();
        gameSounds.play("bottlecollect");
        this.bottleCount = Math.min(20, this.bottleCount + 4);
        this.bottleBar.setPercentage(this.getBottlePercentage());
    }

    /** DE: Prüft, ob die Voraussetzungen für den Endboss erfüllt sind. EN: Checks whether the boss unlock requirements are met. */
    updateBossUnlock() {
        const allCoinsCollected = this.coinsCollected === this.coins.length;
        let allChickensDefeated = true;
        for (const enemy of this.level.enemies) {
            const isChicken = enemy instanceof chicken || enemy instanceof chickenSmall;
            if (isChicken && !enemy.isDead) allChickensDefeated = false;
        }
        this.bossUnlocked = allCoinsCollected && allChickensDefeated;
    }

    /** DE: Sammelt ein Münze. EN: Picks up coin.
 * @param {*} coin - DE: Parameter coin. EN: coin parameter.
 */
    pickupCoin(coin) {
        if (coin.collected || !this.boxesOverlap(this.character, coin)) return;
        coin.collect();
        this.coinsCollected++;
        this.coinInventory++;
        this.coinValue = Math.min(100, Math.floor(this.coinsCollected / 10) * 20);
        this.updateBossUnlock();
        this.updateCoinBar();
        gameSounds.play("drop_coin");
    }

    /** DE: Erstellt eine geworfene Flasche und verringert den Vorrat. EN: Creates a thrown bottle and decreases the supply.
 * @param {number} [power] - DE: Parameter power. EN: power parameter.
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

    /** DE: Berechnet den Flaschenvorrat als Prozentwert. EN: Calculates bottle inventory as a percentage.
 * @returns {*} DE: Berechnetes Ergebnis. EN: Computed result.
 */
    getBottlePercentage() {
        return Math.ceil(this.bottleCount / 4) * 20;
    }

    /** DE: Ermittelt Boss. EN: Gets boss.
 * @returns {*} DE: Berechnetes Ergebnis. EN: Computed result.
 */
    getBoss() {
        for (const enemy of this.level.enemies) {
            if (enemy instanceof Endboss && enemy.isMainBoss) return enemy;
        }
        return undefined;
    }

    /** DE: Schaltet um Pause. EN: Toggles pause.
 * @returns {*} DE: Berechnetes Ergebnis. EN: Computed result.
 */
    togglePause() {
        if (this.levelIntroActive) return true;
        this.isPaused = !this.isPaused;
        if (this.isPaused) gameSounds.stopAll();
        updatePauseMusic();
        this.lastUpdate = Date.now();
        if (!this.isPaused) this.character.lastActivity = Date.now();
        return this.isPaused;
    }

    /** DE: Prüft Boss attacks. EN: Checks boss attacks.
 * @param {*} bosses - DE: Parameter bosses. EN: bosses parameter.
 */
    checkBossAttacks(bosses) {
        bosses.forEach(boss => {
            if (boss.isMainBoss && !this.bossUnlocked) return;
            if (!boss.moving || boss.state !== "attack" || boss.frame !== 4) return;
            if (boss.attackHitDone || this.character.energy <= 0) return;
            if (!this.character.isTouchingVisiblePixels(boss)) return;
            boss.attackHitDone = true;
            let damage = 10;
            if (this.levelNumber === 2) damage = 20;
            this.damageCharacter(damage);
        });
    }

    /** DE: Prüft, ob die Spielfigur den Endboss berührt. EN: Checks main boss contact for the game. */
    checkMainBossContact() {
        const boss = this.getBoss();
        if (!boss || boss.isDead || !this.bossUnlocked) return;
        if (this.character.energy <= 0 || !this.character.isTouchingVisiblePixels(boss)) return;
        if (!this.canTakeHitFrom(boss)) return;
        let damage = 10;
            if (this.levelNumber === 2) damage = 20;
            this.damageCharacter(damage);
        boss.lastHitPosition = { x: this.character.x, y: this.character.y };
    }

    /** DE: Unterscheidet Sprungtreffer von schädlichen Gegnerkontakten. EN: Distinguishes stomp hits from harmful enemy contact.
 * @param {*} enemy - DE: Parameter enemy. EN: enemy parameter.
 * @returns {*} DE: Berechnetes Ergebnis. EN: Computed result.
 */
    checkEnemyCollision(enemy) {
        if (enemy instanceof MiniBoss && !enemy.isDead) return this.checkMiniBossCollision(enemy);
        const isChicken = enemy instanceof chicken || enemy instanceof chickenSmall;
        if (!isChicken || enemy.isDead || this.character.energy <= 0) return;
        if (!this.character.isColliding(enemy)) return;
        if (this.isJumpAttack(enemy)) return this.killChicken(enemy);
        if (!this.character.isTouchingVisiblePixels(enemy)) return;
        if (!this.canChickenDamageCharacter(enemy) || !this.canTakeHitFrom(enemy)) return;
        let damage = 5;
        if (this.levelNumber === 2) damage = 10;
        this.damageCharacter(damage);
        enemy.lastHitPosition = { x: this.character.x, y: this.character.y };
        this.statusBar.setPercentage(this.character.energy);
    }

    /** DE: Prüft Mini Boss Kollision. EN: Checks mini boss collision.
 * @param {*} enemy - DE: Parameter enemy. EN: enemy parameter.
 */
    checkMiniBossCollision(enemy) {
        if (!this.character.isTouchingVisiblePixels(enemy) || !this.canTakeHitFrom(enemy)) return;
        let damage = 10;
            if (this.levelNumber === 2) damage = 20;
            this.damageCharacter(damage);
        enemy.lastHitPosition = { x: this.character.x, y: this.character.y };
        this.statusBar.setPercentage(this.character.energy);
    }

    /** DE: Prüft, ob die Spielfigur von oben auf einen Gegner fällt. EN: Checks whether the character lands on an enemy from above.
 * @param {*} enemy - DE: Parameter enemy. EN: enemy parameter.
 * @returns {*} DE: Berechnetes Ergebnis. EN: Computed result.
 */
    isJumpAttack(enemy) {
        const player = this.character.getHitbox();
        const target = enemy.getHitbox();
        if (!player || !target || this.character.speedY >= 0) return false;
        const feet = player.y + player.height;
        const startedAbove = this.character.jumpStartedAboveEnemy(enemy);
        return startedAbove && feet >= target.y && player.y < target.y;
    }

    /** DE: Prüft, ob ein Huhn seitlichen Schaden verursachen darf. EN: Checks whether a chicken may deal side-contact damage.
 * @param {*} enemy - DE: Parameter enemy. EN: enemy parameter.
 * @returns {*} DE: Berechnetes Ergebnis. EN: Computed result.
 */
    canChickenDamageCharacter(enemy) {
        const player = this.character.getHitbox();
        const target = enemy.getHitbox();
        if (!player || !target) return false;
        if (this.character.isDescendingOnto(enemy)) return false;
        return player.y + player.height > target.y + target.height * 0.35 &&
            player.y < target.y + target.height;
    }

    /** DE: Zieht Lebensenergie nach einem Gegnertreffer ab. EN: Reduces player energy after an enemy hit.
 * @param {number} amount - DE: Parameter amount. EN: amount parameter.
 */
    damageCharacter(amount) {
        if (this.character.energy <= 0) return;
        this.character.takeDamage(amount);
        if (this.coinInventory > 0) this.coinInventory--;
        this.updateCoinBar();
        this.statusBar.setPercentage(this.character.energy);
    }

    /** DE: Prüft, ob der Gegner die Spielfigur erneut treffen darf. EN: Checks whether the enemy may hit the character again.
 * @param {*} enemy - DE: Parameter enemy. EN: enemy parameter.
 * @returns {*} DE: Berechnetes Ergebnis. EN: Computed result.
 */
    canTakeHitFrom(enemy) {
        if (!enemy.lastHitPosition) return true;
        const dx = this.character.x - enemy.lastHitPosition.x;
        const dy = this.character.y - enemy.lastHitPosition.y;
        return Math.hypot(dx, dy) >= 45;
    }

    /** DE: Verarbeitet Huhn. EN: Handles chicken.
 * @param {*} enemy - DE: Parameter enemy. EN: enemy parameter.
 */
    killChicken(enemy) {
        gameSounds.play("hit_chickens");
        enemy.die();
        this.character.bounceFromEnemy();
    }

    /** DE: Erstellt Bildpfade für die sechs Stufen einer Statusleiste. EN: Builds image paths for six status-bar levels.
 * @param {string} folder - DE: Parameter folder. EN: folder parameter.
 * @param {string} ending - DE: Parameter ending. EN: ending parameter.
 * @returns {*} DE: Berechnetes Ergebnis. EN: Computed result.
 */
    createBarImages(folder, ending) {
        const images = [];
        for (let value = 0; value <= 100; value += 20) {
            images.push(folder + value + ending + ".png");
        }
        return images;
    }

    /** DE: Erstellt Münze. EN: Creates coin.
 * @param {number} index - DE: Parameter index. EN: index parameter.
 * @param {number} count - DE: Parameter count. EN: count parameter.
 * @returns {*} DE: Berechnetes Ergebnis. EN: Computed result.
 */
    createCoin(index, count) {
        const x = this.getCoinX(index, count);
        let high = index % 3 === 0;
        if (this.levelNumber === 2) high = index % 2 === 0;
        let y = 245 + Math.random() * 30;
        if (high) y = 140 + Math.random() * 35;
        const coin = new Coin(x, y);
        coin.behindCharacter = index % 2 === 0;
        return coin;
    }

    /** DE: Bestimmt die horizontale Position einer Münze. EN: Calculates a coin horizontal position.
 * @param {number} index - DE: Parameter index. EN: index parameter.
 * @param {number} count - DE: Parameter count. EN: count parameter.
 * @returns {*} DE: Berechnetes Ergebnis. EN: Computed result.
 */
    getCoinX(index, count) {
        const behindCount = 8;
        const minX = this.level.level_start_x + 100;
        const maxX = this.getBoss().x - 1150;
        if (index < behindCount) return minX + (50 - minX) * (index + 0.4) / behindCount;
        return 450 + (maxX - 450) * (index - behindCount + 0.4) / (count - behindCount);
    }
}
