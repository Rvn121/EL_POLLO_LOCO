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
        if (bottle.collected || this.bottleCount >= 5) return;
        if (!this.boxesOverlap(this.character, bottle)) return;
        bottle.collect();
        gameSounds.play("bottlecollect");
        this.bottleCount++;
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
        this.coinValue = Math.min(100, this.coinsCollected * 20);
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
        return this.bottleCount * 20;
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
            this.damageCharacter(damage, boss);
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
            this.damageCharacter(damage, boss);
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
        this.damageCharacter(damage, enemy);
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
            this.damageCharacter(damage, enemy);
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
    damageCharacter(amount, attacker) {
        if (this.character.energy <= 0) return;
        this.character.takeDamage(amount, attacker);
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
        const jumpHeight = this.character.jumpSpeed * this.character.jumpSpeed / (2 * this.character.gravity);
        const ground = this.character.groundY + this.character.height;
        // Keep the center between belly and jump height, including the 7px bob.
        const bellyHeight = this.character.height * 0.45;
        const minHeight = bellyHeight + 7;
        const maxHeight = Math.max(minHeight, jumpHeight - 7);
        const height = minHeight + Math.random() * (maxHeight - minHeight);
        const y = ground - height - 186 / 2 + 20;
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
        const minX = this.level.level_start_x + 100;
        if (index === 0) return minX + Math.random() * (50 - minX);
        const start = 450;
        const end = this.getBoss().x - 250;
        const section = (end - start) / (count - 1);
        return start + section * (index - 1 + Math.random() * 0.8);
    }
    /** Places scenery signs along the route from Pepe's spawn to the boss. */
    createLevelSigns() {
        const startX = this.character.x;
        const bossX = this.getBoss().x;
        const placements = [
            ["coinsarrow", startX + this.character.width + 30, 1191 / 1320],
            ["keep_enough", startX + (bossX - startX) * 0.75, 800 / 1000],
            ["danger", bossX - 550, 640 / 830]
        ];
        const signs = [];
        for (let i = 0; i < placements.length; i++) {
            signs.push(this.createLevelSign(placements[i]));
        }
        return signs;
    }

    /** DE: Erstellt Flaschen. EN: Creates bottles.
 * @returns {*} DE: Berechnetes Ergebnis. EN: Computed result.
 */
    createBottles() {
        const bossX = this.getBoss().x;
        const keepEnoughX = 200 + (bossX - 200) * 0.75;
        const dangerX = bossX - 550;
        if (this.levelNumber === 2) return this.createLevelTwoBottles(keepEnoughX, dangerX);
        // Keep the final bottle wholly between the two signs. The other
        // random bottles remain earlier along the route, making this the last.
        const zones = [[350, 470], [600, keepEnoughX - 80],
            [600, keepEnoughX - 80], [600, keepEnoughX - 80],
            [keepEnoughX + 120 + 20, dangerX - 52 - 20]];
        return this.createBottlesInZones(zones);
    }

    /** DE: Verteilt Flaschen zufällig in den Bereichen. EN: Places bottles randomly in the given zones. */
    createBottlesInZones(zones) {
        const bottles = [];
        for (let i = 0; i < zones.length; i++) {
            const min = zones[i][0];
            const max = zones[i][1];
            bottles.push(new CollectibleBottle(min + Math.random() * (max - min)));
        }
        return bottles;
    }

    /** Supplies spaced bottle groups before each level-two encounter and sign. */
    createLevelTwoBottles(keepEnoughX, dangerX) {
        const bottles = [new CollectibleBottle(350 + Math.random() * 120)];
        for (let i = 0; i < this.level.enemies.length; i++) {
            const enemy = this.level.enemies[i];
            if (enemy instanceof MiniBoss) this.addBottleGroup(bottles, enemy.x, 3);
        }
        this.addBottleGroup(bottles, keepEnoughX, 3);
        this.addBottleGroup(bottles, dangerX, 2);
        return bottles;
    }

    /** DE: Fügt eine Gruppe von Flaschen hinzu. EN: Adds a group of bottles. */
    addBottleGroup(bottles, targetX, count) {
        for (let index = 0; index < count; index++) {
            const x = targetX - (count - index) * 130 - 60 + Math.random() * 30;
            bottles.push(new CollectibleBottle(x));
        }
    }

    /**
     * DE: Erstellt ein Holzschild aus den angegebenen Positionsdaten.
     * EN: Creates a wooden sign using the given position data.
     * @param {Array} placement - DE: Name, Position und Seitenverhältnis. EN: Name, position and aspect ratio.
     * @returns {DrawableObject} DE: Das neue Schild. EN: The new sign.
     */
    createLevelSign(placement) {
        const sign = new DrawableObject();
        sign.height = 150;
        sign.width = sign.height * placement[2];
        sign.x = placement[1];
        sign.y = this.character.groundY + this.character.height - sign.height;
        sign.loadImage("img/icons_backgrounds/" + placement[0] + ".svg");
        return sign;
    }

}
