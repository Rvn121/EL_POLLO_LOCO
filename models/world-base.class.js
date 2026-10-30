class WorldBase extends WorldDrawBase {
    /**
     * Checks whether the player touches any collectible items.
     */
    checkCollectibleCollisions() {
        this.bottles.forEach(b => this.pickupBottle(b));
        this.coins.forEach(c => this.pickupCoin(c));
    }

    /**
     * Adds collected bottle throws to the inventory and updates the bar.
     * @param {*} bottle - The bottle being collected or thrown.
     */
    pickupBottle(bottle) {
        if (bottle.collected || this.bottleCount >= 5) return;
        if (!this.boxesOverlap(this.character, bottle)) return;
        bottle.collect();
        gameSounds.play("bottlecollect");
        this.bottleCount++;
        this.bottleBar.setPercentage(this.getBottlePercentage());
    }

    /**
     * Unlocks the final boss after the required enemies are defeated.
     */
    updateBossUnlock() {
        const allCoinsCollected = this.coinsCollected === this.coins.length;
        let allChickensDefeated = true;
        for (const enemy of this.level.enemies) {
            const isChicken = enemy instanceof chicken || enemy instanceof chickenSmall;
            if (isChicken && !enemy.isDead) allChickensDefeated = false;
        }
        this.bossUnlocked = allCoinsCollected && allChickensDefeated;
    }

    /**
     * Adds a collected coin, restores health, and updates the status bar.
     * @param {*} coin - The coin to process.
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

    /**
     * Creates a new thrown bottle when the player has ammunition.
     * @param {*} power - The power used by this method.
     */
    throwBottle(power = 1) {
        if (this.isGameOver || this.isWin || this.isPaused || this.levelIntroActive || this.character.energy <= 0 || this.bottleCount <= 0) return;
        this.character.markActivity();
        this.character.showStandingImage();
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
     * Converts bottle inventory into a status bar percentage.
     */
    getBottlePercentage() {
        return this.bottleCount * 20;
    }

    /**
     * Returns the main boss for the current level.
     */
    getBoss() {
        for (const enemy of this.level.enemies) {
            if (enemy instanceof Endboss && enemy.isMainBoss) return enemy;
        }
        return undefined;
    }

    /**
     * Pauses or resumes the current level and its sounds.
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

    /**
     * Checks whether a nearby boss can damage the player.
     * @param {*} bosses - The bosses used by this method.
     */
    checkBossAttacks(bosses) {
        bosses.forEach(boss => {
            if (boss.isMainBoss && !this.bossUnlocked) return;
            if (!boss.canHitPlayer(this.character)) return;
            boss.attackHitDone = true;
            this.applyBossAttackDamage(boss);
        });
    }

    /**
     * Applies the existing damage values for a successful boss attack.
     * @param {Endboss} boss - The boss hitting the character.
     */
    applyBossAttackDamage(boss) {
        let damage = 10;
        if (this.levelNumber === 2 && !boss.isMainBoss) damage = 20;
        this.damageCharacter(damage, boss);
    }

    /**
     * Handles collisions between the player and normal enemies.
     * @param {*} enemy - The enemy involved in the collision.
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

    /**
     * Handles collisions between the player and mini-bosses.
     * @param {*} enemy - The enemy involved in the collision.
     */
    checkMiniBossCollision(enemy) {
        if (!this.character.isTouchingVisiblePixels(enemy) || !this.canTakeHitFrom(enemy)) return;
        let damage = 10;
            if (this.levelNumber === 2) damage = 20;
            this.damageCharacter(damage, enemy);
        enemy.lastHitPosition = { x: this.character.x, y: this.character.y };
        this.statusBar.setPercentage(this.character.energy);
    }

    /**
     * Checks whether the character is hitting an enemy from above.
     * @param {*} enemy - The enemy involved in the collision.
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
     * Checks whether a chicken has a valid side hit on the character.
     * @param {*} enemy - The enemy involved in the collision.
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
     * Applies enemy damage to the character and updates health.
     * @param {*} amount - The amount used by this method.
     * @param {*} attacker - The attacker used by this method.
     */
    damageCharacter(amount, attacker) {
        if (this.character.energy <= 0) return;
        this.character.takeDamage(amount, attacker);
        this.statusBar.setPercentage(this.character.energy);
    }

    /**
     * Checks whether an enemy may deal another hit to the player.
     * @param {*} enemy - The enemy involved in the collision.
     */
    canTakeHitFrom(enemy) {
        if (!enemy.lastHitPosition) return true;
        const dx = this.character.x - enemy.lastHitPosition.x;
        const dy = this.character.y - enemy.lastHitPosition.y;
        return Math.hypot(dx, dy) >= 45;
    }

    /**
     * Defeats a chicken and keeps its dead image on the ground.
     * @param {*} enemy - The enemy involved in the collision.
     */
    killChicken(enemy) {
        gameSounds.play("hit_chickens");
        enemy.die();
        this.character.bounceFromEnemy();
    }

    /**
     * Builds the image paths for a status bar.
     * @param {string} folder - The folder containing the animation images.
     * @param {*} ending - The ending used by this method.
     */
    createBarImages(folder, ending) {
        const images = [];
        for (let value = 0; value <= 100; value += 20) {
            images.push(folder + value + ending + ".png");
        }
        return images;
    }

    /**
     * Creates one collectible coin at its assigned position.
     * @param {number} index - The position of an item in a list.
     * @param {number} count - The count used by this method.
     */
    createCoin(index, count) {
        const x = this.getCoinX(index, count);
        const jumpHeight = this.character.jumpSpeed * this.character.jumpSpeed / (2 * this.character.gravity);
        const ground = this.character.groundY + this.character.height;
        /** Keep the center between belly and jump height, including the 7px bob. */
        const bellyHeight = this.character.height * 0.45;
        const minHeight = bellyHeight + 7;
        const maxHeight = Math.max(minHeight, jumpHeight - 7);
        const height = minHeight + Math.random() * (maxHeight - minHeight);
        const y = ground - height - 186 / 2 + 20;
        const coin = new Coin(x, y);
        coin.behindCharacter = index % 2 === 0;
        return coin;
    }

    /**
     * Calculates the horizontal position of a coin.
     * @param {number} index - The position of an item in a list.
     * @param {number} count - The count used by this method.
     */
    getCoinX(index, count) {
        const minX = this.level.level_start_x + 100;
        if (index === 0) return minX + Math.random() * 120;
        const start = 450;
        const end = this.getBoss().x - 250;
        const section = (end - start) / (count - 1);
        return start + section * (index - 1 + Math.random() * 0.8);
    }
    /**
     * Places the wooden signs used in the level.
     */
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

    /**
     * Creates the collectible bottles for the level.
     */
    createBottles() {
        const bossX = this.getBoss().x;
        const keepEnoughX = 200 + (bossX - 200) * 0.75;
        const dangerX = bossX - 550;
        if (this.levelNumber === 2) return this.createLevelTwoBottles(keepEnoughX, dangerX);
        /**
         * Keep the final bottle wholly between the two signs. The other
         * random bottles remain earlier along the route, making this the last.
         */
        const zones = [[350, 470], [600, keepEnoughX - 80],
            [600, keepEnoughX - 80], [600, keepEnoughX - 80],
            [keepEnoughX + 120 + 20, dangerX - 52 - 20]];
        return this.createBottlesInZones(zones);
    }

    /**
     * Distributes bottles among the allowed parts of the map.
     * @param {*} zones - The zones used by this method.
     */
    createBottlesInZones(zones) {
        const bottles = [];
        for (let i = 0; i < zones.length; i++) {
            const min = zones[i][0];
            const max = zones[i][1];
            bottles.push(new CollectibleBottle(min + Math.random() * (max - min)));
        }
        return bottles;
    }

    /**
     * Places the additional bottles used in level two.
     * @param {*} keepEnoughX - The keep enough x used by this method.
     * @param {*} dangerX - The danger x used by this method.
     */
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

    /**
     * Creates a group of bottles within a map section.
     * @param {*} bottles - The bottles used by this method.
     * @param {*} targetX - The target x used by this method.
     * @param {number} count - The count used by this method.
     */
    addBottleGroup(bottles, targetX, count) {
        for (let index = 0; index < count; index++) {
            const x = targetX - (count - index) * 130 - 60 + Math.random() * 30;
            bottles.push(new CollectibleBottle(x));
        }
    }

    /**
     * Creates one wooden level sign at the given position.
     * @param {*} placement - The placement used by this method.
     * @returns {DrawableObject} The result of create level sign().
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
