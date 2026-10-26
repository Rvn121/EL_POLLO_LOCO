/**
 * DE: Erstellt das zweite Level mit Gegnern, Wolken und Hintergründen.
 * EN: Creates the second level with enemies, clouds, and backgrounds.
 */
function createLevel2() {
    return new Level(createLevel2Enemies(), createLevelClouds(), createLevel2Backgrounds());
}

/**
 * DE: Erstellt die Gegner und Bosse für Level 2.
 * EN: Creates enemies and bosses for level 2.
 */
function createLevel2Enemies() {
    const enemies = [];
    for (let i = 0; i < 60; i++) enemies.push(createLevel2Chicken(i));
    enemies.push(new MiniBoss(3800), new MiniBoss(6900));
    const boss = new Endboss(10300, true);
    boss.healthPhases = true;
    enemies.push(boss);
    return enemies;
}

/**
 * DE: Erstellt level2chicken für das Spiel.
 * EN: Creates level2chicken for the game.
 */
function createLevel2Chicken(index) {
    const small = index % 2 === 0;
    const smallIndex = index / 2;
    const behindStart = small && smallIndex < 3;
    let x = 1050 + index * 135 + Math.random() * 130;
    if (small) x = getSmallChickenX(smallIndex, behindStart);
    let enemy = new chickenSmall(x);
    if (index % 2) enemy = new chicken(x);
    if ((small && smallIndex % 5 !== 4) || (!small && index % 6 === 1)) {
        setLevel2Patrol(enemy, x, behindStart);
    }
    return enemy;
}

/**
 * DE: Gibt small chicken x für das Spiel.
 * EN: Returns small chicken x for the game.
 */
function getSmallChickenX(index, behindStart) {
    if (behindStart) return -600 + index * 120 + Math.random() * 20;
    return 1050 + (index - 3) * 335 + Math.random() * 80;
}

/**
 * DE: Setzt level2patrol für das Spiel.
 * EN: Sets level2patrol for the game.
 */
function setLevel2Patrol(enemy, x, behindStart) {
    const range = 140 + Math.random() * 160;
    let minLimit = 850;
    let maxLimit = 10100;
    if (behindStart) { minLimit = -620; maxLimit = -300; }
    enemy.startPatrol(Math.max(minLimit, x - range), Math.min(maxLimit, x + range));
}

/**
 * DE: Erstellt level2backgrounds für das Spiel.
 * EN: Creates level2backgrounds for the game.
 */
function createLevel2Backgrounds() {
    const backgrounds = createLevelBackgrounds();
    const extra = [];
    for (let i = 16; i < 18; i++) {
        const images = ["air.png", "3_third_layer/1.png", "2_second_layer/1.png", "1_first_layer/1.png"];
        images.forEach(path => extra.push(new BackgroundObject(
            "img/5_background/layers/" + path.replace("air.png", "air.png"), i * 720)));
    }
    return [...backgrounds, ...extra];
}
