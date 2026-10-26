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
    bossSoundPlayed = false;
    levelIntroActive = true;
    bottles = [];
    coins = [];
    thrownBottles = [];
    lastUpdate = Date.now();

    /**
     * DE: Erstellt das Objekt und legt seine Anfangswerte fest.
     * EN: Creates the object and sets its initial values.
     * @param {HTMLCanvasElement} canvas - DE: canvas. EN: canvas.
     * @param {Keyboard} keyboard - DE: keyboard. EN: keyboard.
     * @param {Function} onGameOver - DE: onGameOver. EN: onGameOver.
     * @param {number} levelNumber - DE: levelNumber. EN: levelNumber.
     */
    constructor(canvas, keyboard, onGameOver, levelNumber = 1) {
        super();
        this.setupCanvas(canvas, keyboard, onGameOver);
        this.setupWorld(levelNumber);
        this.startGameLoop();
        this.startCollisionLoop();
        this.draw();
    }

    /** DE: Bereitet das Canvas und seine Anzeige vor. EN: Sets up canvas for the game. */
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

    /** DE: Erstellt Level, Spielfigur und Statusanzeigen. EN: Creates the level, player, and status bars. */
    setupWorld(levelNumber) {
        this.levelNumber = levelNumber;
        this.level = levelNumber === 2 ? createLevel2() : createLevel1();
        this.character = new Character(this.keyboard, this.level);
        this.statusBar = new StatusBar();
        this.bottleBar = new StatusBar();
        this.coinBar = new StatusBar();
        this.configureCollectibles();
        this.character.x = this.characterScreenX - this.camera_x;
        this.isPaused = true;
    }

    /** DE: Startet die regelmäßige Aktualisierung des Spiels. EN: Starts game loop for the game. */
    startGameLoop() {
        this.gameLoopInterval = setInterval(() => this.updateGame(), 1000 / 60);
    }

    /** DE: Aktualisiert die Spielwelt nur, wenn das Spiel aktiv ist. EN: Updates the world only while the game is running. */
    updateGame() {
        if (this.isDisposed || this.isPaused) return;
        this.updateAmbientSounds();
        this.updateClouds();
        if (this.isGameOver || this.isWin) return;
        if (this.character.energy <= 0) return this.checkCharacterDeath();
        this.updateActiveGame();
    }

    /** DE: Prüft character death für das Spiel. EN: Checks character death for the game. */
    checkCharacterDeath() {
        if (this.character.deathFinished) this.triggerGameOver();
    }

    /** DE: Aktualisiert Bewegung, Kamera und eingesammelte Gegenstände. EN: Updates movement, camera, and collectibles. */
    updateActiveGame() {
        this.character.updateMovement();
        this.updateFootsteps();
        this.checkBossApproach();
        this.updateCamera();
        this.updateCollectibles();
        this.updateMiniBossSounds();
    }

    /** DE: Spielt Wind und Hühnergeräusche passend zum Levelzustand. EN: Plays wind and chicken ambience according to the level state. */
    updateAmbientSounds() {
        if (this.isGameOver || this.isWin) return;
        gameSounds.play("wind");
        const anyChickensAlive = this.level.enemies.some(enemy =>
            (enemy instanceof chickenSmall || enemy instanceof chicken) && !enemy.isDead);
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

    /** DE: Erkennt sichtbare Minibosse und spielt ihre Auftritts- und Todessounds. EN: Detects visible mini bosses and plays their entrance and death sounds. */
    updateMiniBossSounds() {
        this.level.enemies.filter(enemy => enemy instanceof MiniBoss).forEach(boss => {
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
        });
    }

    /** DE: Startet den Endboss-Sound bei ausreichender Nähe. EN: Starts the boss sound when the player gets close enough. */
    checkBossApproach() {
        const boss = this.getBoss();
        if (!boss || !this.bossUnlocked || this.bossSoundPlayed) return;
        if (Math.abs(this.character.x - boss.x) > 600) return;
        this.bossSoundPlayed = true;
        gameSounds.play("chicken_boss");
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

    /** DE: Führt configure collectibles im Spiel aus. EN: Runs configure collectibles in the game. */
    configureCollectibles() {
        this.setupBottleBar();
        this.setupCoinBar();
        this.setupBossBar();
        this.bottles = this.createBottles();
        this.coins = this.createCoins();
    }

    /** DE: Setzt up bottle bar für das Spiel. EN: Sets up bottle bar for the game. */
    setupBottleBar() {
        this.bottleBar.IMAGES_HEALTH = [0,20,40,60,80,100].map(n =>
            `img/7_statusbars/1_statusbar/3_statusbar_bottle/orange/${n}.png`);
        this.bottleBar.loadImages(this.bottleBar.IMAGES_HEALTH);
        this.bottleBar.y = 42;
        this.bottleBar.setPercentage(0);
    }

    /** DE: Setzt up coin bar für das Spiel. EN: Sets up coin bar for the game. */
    setupCoinBar() {
        this.coinBar.IMAGES_HEALTH = [0,20,40,60,80,100].map(n =>
            `img/7_statusbars/1_statusbar/1_statusbar_coin/green/${n}.png`);
        this.coinBar.loadImages(this.coinBar.IMAGES_HEALTH);
        this.coinBar.y = 84;
        this.coinBar.setPercentage(0);
    }

    /** DE: Setzt up boss bar für das Spiel. EN: Sets up boss bar for the game. */
    setupBossBar() {
        this.bossBar = new StatusBar();
        this.bossBar.IMAGES_HEALTH = [0,20,40,60,80,100].map(n =>
            `img/7_statusbars/2_statusbar_endboss/blue/blue${n}.png`);
        this.bossBar.loadImages(this.bossBar.IMAGES_HEALTH);
        this.bossBar.setPercentage(100);
        this.bossBar.x = this.canvas.width - this.bossBar.width - 20;
        this.bossBar.y = 0;
    }

    /** DE: Verteilt einsammelbare Flaschen im Level. EN: Creates bottles for the game. */
    createBottles() {
        const count = this.levelNumber === 2 ? 9 : 8;
        const maxX = this.getBoss().x - 950;
        return Array.from({ length: count }, (_, index) => {
            const x = 550 + (maxX - 800) * (index + Math.random() * 0.4) / count;
            return new CollectibleBottle(x);
        });
    }

    /** DE: Verteilt Münzen im Level. EN: Creates coins for the game. */
    createCoins() {
        const count = 50;
        return Array.from({ length: count }, (_, index) => this.createCoin(index, count));
    }

    /** DE: Erstellt coin für das Spiel. EN: Creates coin for the game. */
    createCoin(index, count) {
        const x = this.getCoinX(index, count);
        const high = this.levelNumber === 2 ? index % 2 === 0 : index % 3 === 0;
        const y = high ? 140 + Math.random() * 35 : 245 + Math.random() * 30;
        const coin = new Coin(x, y);
        coin.behindCharacter = index % 2 === 0;
        return coin;
    }

    /** DE: Gibt coin x für das Spiel. EN: Returns coin x for the game. */
    getCoinX(index, count) {
        const behindCount = 8;
        const minX = this.level.level_start_x + 100;
        const maxX = this.getBoss().x - 1150;
        if (index < behindCount) return minX + (50 - minX) * (index + 0.4) / behindCount;
        return 450 + (maxX - 450) * (index - behindCount + 0.4) / (count - behindCount);
    }

    /** DE: Aktualisiert coin bar für das Spiel. EN: Updates coin bar for the game. */
    updateCoinBar() {
        const percentage = Math.min(100, Math.floor(this.coinInventory / 10) * 20);
        this.coinBar.setPercentage(percentage);
    }

    /** DE: Startet das Level nach der Einblendung. EN: Starts level for the game. */
    startLevel() {
        this.levelIntroActive = false;
        this.isPaused = false;
        this.lastUpdate = Date.now();
        this.character.lastActivity = Date.now();
    }

    /** DE: Aktualisiert collectibles für das Spiel. EN: Updates collectibles for the game. */
    updateCollectibles() {
        const now = Date.now();
        const delta = Math.min(45, now - this.lastUpdate);
        this.lastUpdate = now;
        this.bottles.forEach(b => b.update(delta));
        this.updateBosses(delta);
        this.coins.forEach(c => c.update(delta));
        this.updateThrownBottles(delta);
    }

    /** DE: Aktualisiert bosses für das Spiel. EN: Updates bosses for the game. */
    updateBosses(delta) {
        const bosses = this.level.enemies.filter(enemy => enemy instanceof Endboss);
        bosses.forEach(boss => {
            if (!boss.isMainBoss || this.bossUnlocked) boss.update(delta, this.character);
        });
        this.checkBossAttacks(bosses);
        const boss = this.getBoss();
        if (boss && boss.state === "finished") this.triggerWin();
        if (this.character.energy <= 0 && this.character.deathFinished) this.triggerGameOver();
    }

    /** DE: Aktualisiert die Bewegung aller geworfenen Flaschen. EN: Updates thrown bottles for the game. */
    updateThrownBottles(delta) {
        this.thrownBottles.forEach(b => this.updateThrownBottle(b, delta));
        this.thrownBottles = this.thrownBottles.filter(b => b.state !== "done");
    }

    /**
     * DE: Aktualisiert die Bewegung einer geworfenen Flasche.
     * EN: Updates thrown bottle for the game.
     * @param {ThrowableBottle} bottle - DE: Wert bottle. EN: Value bottle.
     * @param {number} delta - DE: Wert delta. EN: Value delta.
     */
    updateThrownBottle(bottle, delta) {
        const wasFlying = bottle.state === "flying";
        bottle.update(delta);
        if (wasFlying && bottle.state === "splash") this.applySplashDamage(bottle);
        if (bottle.state !== "flying") return;
        this.level.enemies.forEach(enemy => this.hitEnemyWithBottle(bottle, enemy));
    }

    /**
     * DE: Prüft Gegner innerhalb des Aufprallbereichs einer Flasche.
     * EN: Checks enemies inside a bottle splash area.
     * @param {ThrowableBottle} bottle - DE: Wert bottle. EN: Value bottle.
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

    /**
     * DE: Prüft einen Treffer im Umkreis von 13 Pixeln um den Aufprallpunkt.
     * EN: Checks a hit within 13 pixels of the impact point.
     * @param {number} x - Aufprall X / Impact X.
     * @param {number} y - Aufprall Y / Impact Y.
     * @param {Object} area - Trefferfläche / Hit area.
     * @returns {boolean} Treffer / Hit.
     */
    isWithinSplashRadius(x, y, area) {
        const nearestX = Math.max(area.x, Math.min(x, area.x + area.width));
        const nearestY = Math.max(area.y, Math.min(y, area.y + area.height));
        const dx = x - nearestX;
        const dy = y - nearestY;
        return dx * dx + dy * dy <= 13 * 13;
    }

    /**
     * DE: Gibt beim Boss die gesamte Zeichenfläche als Trefferbereich zurück.
     * EN: Uses the entire drawn rectangle as the boss hit area.
     * @param {MovableObject} enemy - Der Gegner / The enemy.
     * @returns {Object|null} Trefferbereich / Hit area.
     */
    getBottleTargetArea(enemy) {
        if (!(enemy instanceof Endboss)) return enemy.getHitbox();
        return { x: enemy.x, y: enemy.y, width: enemy.width, height: enemy.height };
    }

    /**
     * DE: Fügt einem getroffenen Gegner Flaschenschaden zu.
     * EN: Applies bottle damage to an enemy that was hit.
     * @param {MovableObject} enemy - DE: Wert enemy. EN: Value enemy.
     * @param {ThrowableBottle} bottle - DE: Wert bottle. EN: Value bottle.
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

    /**
     * DE: Führt hit enemy with bottle im Spiel aus.
     * EN: Runs hit enemy with bottle in the game.
     * @param {CollectibleBottle} bottle - DE: bottle. EN: bottle.
     * @param {MovableObject} enemy - DE: enemy. EN: enemy.
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

    /**
     * DE: Platziert die Flasche direkt an der getroffenen Gegnerfläche.
     * EN: Places the bottle at the point where it touches the enemy.
     * @param {ThrowableBottle} bottle - Flasche / Bottle.
     * @param {MovableObject} enemy - Gegner / Enemy.
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

    /**
     * DE: Prüft, ob sich zwei rechteckige Trefferbereiche überschneiden.
     * EN: Checks whether two rectangular hitboxes overlap.
     * @param {DrawableObject} a - DE: Wert a. EN: Value a.
     * @param {DrawableObject} b - DE: Wert b. EN: Value b.
     */
    boxesOverlap(a, b) {
        const aa = a.getHitbox(), bb = this.getBottleTargetArea(b);
        if (!aa || !bb) return false;
        return aa.x < bb.x + bb.width && aa.x + aa.width > bb.x &&
            aa.y < bb.y + bb.height && aa.y + aa.height > bb.y;
    }
}
