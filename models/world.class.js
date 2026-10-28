class World extends WorldBase {
    canvas;
    ctx;
    keyboard;
    level;
    character;
    statusBar;
    camera_x = -100;
    characterScreenX = 100;
    debugMode = false;
    isDisposed = false;
    isGameOver = false;
    isWin = false;
    isPaused = false;
    throwChargeStart = null;
    bottleCount = 0;
    coinValue = 0;
    coinsCollected = 0;
    coinInventory = 0;
    minibossSoundIds = [];
    minibossDeadIds = [];
    bossUnlocked = false;
    levelIntroActive = true;
    bottles = [];
    coins = [];
    signs = [];
    thrownBottles = [];
    lastUpdate = Date.now();
    /** DE: Erstellt das Objekt und setzt seine Startwerte. EN: Creates the object and sets its initial values.
 * @param {HTMLElement} canvas - DE: Parameter canvas. EN: canvas parameter.
 * @param {*} keyboard - DE: Parameter keyboard. EN: keyboard parameter.
 * @param {*} onGameOver - DE: Parameter onGameOver. EN: onGameOver parameter.
 * @param {number} [levelNumber] - DE: Parameter levelNumber. EN: levelNumber parameter.
 */
    constructor(canvas, keyboard, onGameOver, levelNumber = 1) {
        super();
        this.setupCanvas(canvas, keyboard, onGameOver);
        this.setupWorld(levelNumber);
        this.startGameLoop();
        this.startCollisionLoop();
        this.draw();
    }
    /** DE: Richtet ein canvas. EN: Sets up canvas.
 * @param {HTMLElement} canvas - DE: Parameter canvas. EN: canvas parameter.
 * @param {*} keyboard - DE: Parameter keyboard. EN: keyboard parameter.
 * @param {*} onGameOver - DE: Parameter onGameOver. EN: onGameOver parameter.
 */
    setupCanvas(canvas, keyboard, onGameOver) {
        this.ctx = canvas.getContext("2d");
        this.canvas = canvas;
        this.keyboard = keyboard;
        this.onGameOver = onGameOver;
        this.gameOverImage = new Image();
        this.gameOverImage.src = "img/9_intro_outro_screens/game_over/game over.png";
        this.winImage = new Image();
        this.winImage.src = "img/You won, you lost/You won A.png";
    }
    /** DE: Erstellt Level, Spielfigur und Statusanzeigen. EN: Creates the level, player, and status bars.
 * @param {number} levelNumber - DE: Parameter levelNumber. EN: levelNumber parameter.
 */
    setupWorld(levelNumber) {
        this.levelNumber = levelNumber;
        if (levelNumber === 2) this.level = createLevel2();
        else this.level = createLevel1();
        this.character = new Character(this.keyboard, this.level);
        this.statusBar = new StatusBar();
        this.bottleBar = new StatusBar();
        this.coinBar = new StatusBar();
        this.configureCollectibles();
        this.character.x = this.characterScreenX - this.camera_x;
        this.signs = this.createLevelSigns();
        this.isPaused = true;
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
        return placements.map(([name, x, ratio]) => {
            const sign = new DrawableObject();
            sign.height = 150;
            sign.width = sign.height * ratio;
            sign.x = x;
            sign.y = this.character.groundY + this.character.height - sign.height;
            sign.loadImage(`img/icons_backgrounds/${name}.svg`);
            return sign;
        });
    }
    /** DE: Startet Spiel loop. EN: Starts game loop. */
    startGameLoop() {
        this.gameLoopInterval = setInterval(() => this.updateGame(), 1000 / 60);
    }
    /** DE: Aktualisiert die Spielwelt nur, wenn das Spiel aktiv ist. EN: Updates the world only while the game is running.
 * @returns {*} DE: Berechnetes Ergebnis. EN: Computed result.
 */
    updateGame() {
        if (this.isDisposed || this.isPaused) return;
        this.updateAmbientSounds();
        this.updateClouds();
        if (this.isGameOver || this.isWin) return;
        if (this.character.energy <= 0) return this.checkCharacterDeath();
        if (this.checkChickenEscape()) return;
        this.updateActiveGame();
    }
    /** DE: Prüft, ob ein lebendes Huhn links aus dem Level entkommen ist. EN: Checks whether a living chicken escaped beyond the left level edge.
 * @returns {*} DE: Berechnetes Ergebnis. EN: Computed result.
 */
    checkChickenEscape() {
        let escaped = false;
        for (let i = 0; i < this.level.enemies.length; i++) {
            const enemy = this.level.enemies[i];
            const isChicken = enemy instanceof chicken || enemy instanceof chickenSmall;
            if (isChicken && !enemy.isDead && enemy.x + enemy.width < this.level.level_start_x) escaped = true;
        }
        if (escaped) this.triggerGameOver("Chickens escaped!");
        return escaped;
    }

    /** DE: Prüft, ob die Todesanimation der Spielfigur beendet ist. EN: Checks whether the character death animation has finished. */
    checkCharacterDeath() {
        if (this.character.deathFinished) this.triggerGameOver();
    }
    /** DE: Aktualisiert Bewegung, Kamera und eingesammelte Gegenstände. EN: Updates movement, camera, and collectibles. */
    updateActiveGame() {
        this.updateBossUnlock();
        this.character.updateMovement();
        this.updateFootsteps();
        this.updateCamera();
        this.checkBossApproach();
        this.updateCollectibles();
        this.updateMiniBossSounds();
    }
    /** DE: Spielt Wind und Hühnergeräusche passend zum Levelzustand. EN: Plays wind and chicken ambience according to the level state. */
    updateAmbientSounds() {
        if (this.isGameOver || this.isWin) return;
        gameSounds.play("wind");
        let anyChickensAlive = false;
        for (const enemy of this.level.enemies) {
            if ((enemy instanceof chickenSmall || enemy instanceof chicken) && !enemy.isDead) {
                anyChickensAlive = true;
                break;
            }
        }
        if (anyChickensAlive) gameSounds.play("chicken_background");
        else gameSounds.stop("chicken_background");
    }
    /** DE: Spielt Schrittgeräusche nur während des Laufens am Boden. EN: Plays footsteps only while walking on the ground. */
    updateFootsteps() {
        const moving = this.keyboard.LEFT !== this.keyboard.RIGHT;
        const onGround = this.character.y === this.character.groundY;
        if (moving && onGround) gameSounds.play("steps");
        else gameSounds.stop("steps");
    }
    /** DE: Prüft die Geräusche der Minibosse. EN: Updates mini-boss sounds. */
    updateMiniBossSounds() {
        this.level.enemies.forEach(boss => this.checkMiniBossSound(boss));
    }

    /** DE: Spielt Auftritts- und Todesgeräusche eines Minibosses. EN: Plays a mini-boss entrance and death sounds.
 * @param {*} boss - DE: Parameter boss. EN: boss parameter.
 */
    checkMiniBossSound(boss) {
        if (!(boss instanceof MiniBoss)) return;
        const visible = boss.x + boss.width > -this.camera_x &&
            boss.x < -this.camera_x + this.canvas.width;
        if (visible && this.minibossSoundIds.indexOf(boss) === -1 && !boss.isDead) {
            this.minibossSoundIds.push(boss);
            gameSounds.play("miniboss_llive");
        }
        if (boss.energy <= 0 && this.minibossDeadIds.indexOf(boss) === -1) {
            this.minibossDeadIds.push(boss);
            gameSounds.play("miniboss_dead");
        }
    }
    /** DE: Prüft Boss approach. EN: Checks boss approach. */
    checkBossApproach() {
        const boss = this.getBoss();
        const margin = 80;
        const left = -this.camera_x;
        const right = left + this.canvas.width;
        const nearScreen = boss && boss.x + boss.width > left - margin && boss.x < right + margin;
        if (nearScreen && this.bossUnlocked && boss.energy > 0 && !boss.isDead) {
            gameSounds.play("chicken_boss");
        } else {
            gameSounds.stop("chicken_boss");
        }
    }
    /** DE: Prüft regelmäßig Treffer und das Einsammeln von Gegenständen. EN: Regularly checks collisions and collectible pickups. */
    startCollisionLoop() {
        this.collisionInterval = setInterval(() => {
            if (this.isDisposed || this.isGameOver || this.isWin || this.isPaused) return;
            if (this.character.energy <= 0) return;
            this.level.enemies.forEach(enemy => this.checkEnemyCollision(enemy));
            this.checkMainBossContact();
            this.checkCollectibleCollisions();
        }, 1000 / 60);
    }
    /** DE: Richtet ein collectibles. EN: Configures collectibles. */
    configureCollectibles() {
        this.setupBottleBar();
        this.setupCoinBar();
        this.setupBossBar();
        this.bottles = this.createBottles();
        this.coins = this.createCoins();
    }

    /** DE: Richtet ein Flasche Statusleiste. EN: Sets up bottle bar. */
    setupBottleBar() {
        this.bottleBar.IMAGES_HEALTH = this.createBarImages("img/7_statusbars/1_statusbar/3_statusbar_bottle/orange/", "");
        this.bottleBar.loadImages(this.bottleBar.IMAGES_HEALTH);
        this.bottleBar.y = 42;
        this.bottleBar.setPercentage(0);
    }
    /** DE: Richtet ein Münze Statusleiste. EN: Sets up coin bar. */
    setupCoinBar() {
        this.coinBar.IMAGES_HEALTH = this.createBarImages("img/7_statusbars/1_statusbar/1_statusbar_coin/green/", "");
        this.coinBar.loadImages(this.coinBar.IMAGES_HEALTH);
        this.coinBar.y = 84;
        this.coinBar.setPercentage(0);
    }
    /** DE: Richtet ein Boss Statusleiste. EN: Sets up boss bar. */
    setupBossBar() {
        this.bossBar = new StatusBar();
        this.bossBar.IMAGES_HEALTH = this.createBarImages("img/7_statusbars/2_statusbar_endboss/blue/blue", "");
        this.bossBar.loadImages(this.bossBar.IMAGES_HEALTH);
        this.bossBar.setPercentage(100);
        this.bossBar.x = this.canvas.width - this.bossBar.width - 20;
        this.bossBar.y = 0;
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
        return zones.map(([min, max]) => new CollectibleBottle(min + Math.random() * (max - min)));
    }

    /** Supplies spaced bottle groups before each level-two encounter and sign. */
    createLevelTwoBottles(keepEnoughX, dangerX) {
        const bottles = [new CollectibleBottle(350 + Math.random() * 120)];
        const addGroup = (targetX, count) => {
            for (let index = 0; index < count; index++) {
                const x = targetX - (count - index) * 130 - 60 + Math.random() * 30;
                bottles.push(new CollectibleBottle(x));
            }
        };
        this.level.enemies.filter(enemy => enemy instanceof MiniBoss)
            .forEach(boss => addGroup(boss.x, 3));
        addGroup(keepEnoughX, 3);
        addGroup(dangerX, 2);
        return bottles;
    }
    /** DE: Erstellt Münzen. EN: Creates coins.
 * @returns {*} DE: Berechnetes Ergebnis. EN: Computed result.
 */
    createCoins() {
        const count = 5;
        const coins = [];
        for (let index = 0; index < count; index++) coins.push(this.createCoin(index, count));
        return coins;
    }


    /** DE: Aktualisiert Münze Statusleiste. EN: Updates coin bar. */
    updateCoinBar() {
        const percentage = Math.min(100, this.coinInventory * 20);
        this.coinBar.setPercentage(percentage);
    }

    /** DE: Startet Level. EN: Starts level. */
    startLevel() {
        this.levelIntroActive = false;
        this.isPaused = false;
        this.lastUpdate = Date.now();
        this.character.lastActivity = Date.now();
    }

    /** DE: Aktualisiert collectibles. EN: Updates collectibles. */
    updateCollectibles() {
        const now = Date.now();
        const delta = Math.min(45, now - this.lastUpdate);
        this.lastUpdate = now;
        this.bottles.forEach(b => b.update(delta));
        this.updateBosses(delta);
        this.coins.forEach(c => c.update(delta));
        this.updateThrownBottles(delta);
    }

    /** DE: Aktualisiert bosses. EN: Updates bosses.
 * @param {number} delta - DE: Parameter delta. EN: delta parameter.
 */
    updateBosses(delta) {
        const bosses = [];
        for (const enemy of this.level.enemies) {
            if (enemy instanceof Endboss) bosses.push(enemy);
        }
        bosses.forEach(boss => {
            if (!boss.isMainBoss || this.bossUnlocked) boss.update(delta, this.character);
        });
        this.checkBossAttacks(bosses);
        const boss = this.getBoss();
        if (boss && boss.state === "finished") this.triggerWin();
        if (this.character.energy <= 0 && this.character.deathFinished) this.triggerGameOver();
    }

    /** DE: Aktualisiert thrown Flaschen. EN: Updates thrown bottles.
 * @param {number} delta - DE: Parameter delta. EN: delta parameter.
 */
    updateThrownBottles(delta) {
        this.thrownBottles.forEach(b => this.updateThrownBottle(b, delta));
        const activeBottles = [];
        for (const bottle of this.thrownBottles) {
            if (bottle.state !== "done") activeBottles.push(bottle);
        }
        this.thrownBottles = activeBottles;
    }

    /** DE: Aktualisiert thrown Flasche. EN: Updates thrown bottle.
 * @param {*} bottle - DE: Parameter bottle. EN: bottle parameter.
 * @param {number} delta - DE: Parameter delta. EN: delta parameter.
 */
    updateThrownBottle(bottle, delta) {
        const wasFlying = bottle.state === "flying";
        bottle.update(delta);
        if (wasFlying && bottle.state === "splash") this.applySplashDamage(bottle);
        if (bottle.state !== "flying") return;
        this.level.enemies.forEach(enemy => this.hitEnemyWithBottle(bottle, enemy));
    }

    /** DE: Verteilt den Flaschenschaden an Gegner am Aufprallpunkt. EN: Applies splash damage to enemies around the impact point.
 * @param {*} bottle - DE: Parameter bottle. EN: bottle parameter.
 */
    applySplashDamage(bottle) {
        const x = bottle.x + bottle.width / 2;
        const y = bottle.y + bottle.height / 2;
        this.level.enemies.forEach(enemy => {
            if (enemy.isDead || enemy.state === "dead" || enemy.state === "finished") return;
            if (enemy.isMainBoss && !this.bossUnlocked) return;
            const area = this.getBottleTargetArea(enemy);
            if (!area || !this.isWithinSplashRadius(x, y, area)) return;
            this.damageEnemyWithBottle(enemy, bottle);
        });
    }

    /** DE: Prüft, ob ein Gegner innerhalb des Aufprallradius liegt. EN: Checks whether an enemy is inside the splash radius.
 * @param {number} x - DE: Parameter x. EN: x parameter.
 * @param {number} y - DE: Parameter y. EN: y parameter.
 * @param {*} area - DE: Parameter area. EN: area parameter.
 * @returns {*} DE: Berechnetes Ergebnis. EN: Computed result.
 */
    isWithinSplashRadius(x, y, area) {
        const nearestX = Math.max(area.x, Math.min(x, area.x + area.width));
        const nearestY = Math.max(area.y, Math.min(y, area.y + area.height));
        const dx = x - nearestX;
        const dy = y - nearestY;
        return dx * dx + dy * dy <= 13 * 13;
    }

    /** DE: Bestimmt die Trefferfläche für einen Flaschenaufprall. EN: Determines the hit area for a bottle impact.
 * @param {*} enemy - DE: Parameter enemy. EN: enemy parameter.
 * @returns {*} DE: Berechnetes Ergebnis. EN: Computed result.
 */
    getBottleTargetArea(enemy) {
        if (!(enemy instanceof Endboss)) return enemy.getHitbox();
        return { x: enemy.x, y: enemy.y, width: enemy.width, height: enemy.height };
    }

    /** DE: Verarbeitet enemy with Flasche. EN: Handles enemy with bottle.
 * @param {*} enemy - DE: Parameter enemy. EN: enemy parameter.
 * @param {*} bottle - DE: Parameter bottle. EN: bottle parameter.
 */
    damageEnemyWithBottle(enemy, bottle) {
        if (!bottle.damagedEnemies) bottle.damagedEnemies = [];
        if (bottle.damagedEnemies.indexOf(enemy) !== -1) return;
        bottle.damagedEnemies.push(enemy);
        if (enemy instanceof chicken || enemy instanceof chickenSmall) enemy.die();
        else if (enemy instanceof Endboss) {
            gameSounds.play("boss_hit");
            enemy.takeBottleHit();
            if (enemy.isMainBoss) {
                this.bossBar.setPercentage(enemy.energy);
                if (enemy.energy <= 0) gameSounds.stop("chicken_boss");
            }
        }
    }

    /** DE: Verarbeitet enemy with Flasche. EN: Handles enemy with bottle.
 * @param {*} bottle - DE: Parameter bottle. EN: bottle parameter.
 * @param {*} enemy - DE: Parameter enemy. EN: enemy parameter.
 */
    hitEnemyWithBottle(bottle, enemy) {
        if (bottle.state !== "flying" || enemy.isDead) return;
        if (enemy.state === "dead" || enemy.state === "finished") return;
        if (enemy instanceof Endboss && enemy.isMainBoss && !this.bossUnlocked) return;
        if (!this.boxesOverlap(bottle, enemy)) return;
        this.placeBottleAtImpact(bottle, enemy);
        bottle.splash();
        this.applySplashDamage(bottle);
        this.damageEnemyWithBottle(enemy, bottle);
    }

    /** DE: Verarbeitet Flasche at impact. EN: Handles bottle at impact.
 * @param {*} bottle - DE: Parameter bottle. EN: bottle parameter.
 * @param {*} enemy - DE: Parameter enemy. EN: enemy parameter.
 */
    placeBottleAtImpact(bottle, enemy) {
        const area = this.getBottleTargetArea(enemy);
        const centerX = bottle.x + bottle.width / 2;
        const centerY = bottle.y + bottle.height / 2;
        const x = Math.max(area.x, Math.min(centerX, area.x + area.width));
        const y = Math.max(area.y, Math.min(centerY, area.y + area.height));
        bottle.x = x - bottle.width / 2;
        bottle.y = y - bottle.height / 2;
    }

    /** DE: Prüft, ob sich zwei rechteckige Bereiche überschneiden. EN: Checks whether two rectangular areas overlap.
 * @param {*} a - DE: Parameter a. EN: a parameter.
 * @param {*} b - DE: Parameter b. EN: b parameter.
 * @returns {*} DE: Berechnetes Ergebnis. EN: Computed result.
 */
    boxesOverlap(a, b) {
        const aa = a.getHitbox(), bb = this.getBottleTargetArea(b);
        if (!aa || !bb) return false;
        return aa.x < bb.x + bb.width && aa.x + aa.width > bb.x &&
            aa.y < bb.y + bb.height && aa.y + aa.height > bb.y;
    }
}
