/**
 * DE: Erstellt level 2.
 * EN: Creates level 2.
 */
function createLevel2() {
    return new Level(createLevel2Enemies(), createLevelClouds(), createLevel2Backgrounds());
}

/**
 * DE: Erstellt level 2 enemies.
 * EN: Creates level 2 enemies.
 */
function createLevel2Enemies() {
    const enemies = [];
    for (let i = 0; i < 60; i++) enemies.push(createLevel2Chicken(i));
    enemies.push(new MiniBoss(3800), new MiniBoss(6900));
    enemies.push(new Endboss(10300, true));
    return enemies;
}

/** DE: Erstellt einen Gegner in Level 1. EN: Creates an enemy for Level 1. */
function createLevel2Chicken(index) {
    const small = index % 2 === 0;
    const smallIndex = index / 2;
    const behindStart = small && smallIndex < 3;
    const x = small ? getSmallChickenX(smallIndex, behindStart)
        : 1050 + index * 135 + Math.random() * 130;
    const enemy = index % 2 ? new chicken(x) : new chickenSmall(x);
    if ((small && smallIndex % 5 !== 4) || (!small && index % 6 === 1)) {
        setLevel2Patrol(enemy, x, behindStart);
    }
    return enemy;
}

/** DE: Berechnet die Startposition. EN: Calculates the starting position. */
function getSmallChickenX(index, behindStart) {
    if (behindStart) return -600 + index * 120 + Math.random() * 20;
    return 1050 + (index - 3) * 335 + Math.random() * 80;
}

/** DE: Legt die Patrouillengrenzen fest. EN: Sets patrol boundaries. */
function setLevel2Patrol(enemy, x, behindStart) {
    const range = 140 + Math.random() * 160;
    enemy.startPatrol(Math.max(behindStart ? -620 : 850, x - range),
        Math.min(behindStart ? -300 : 10100, x + range));
}

/**
 * DE: Erstellt level 2 backgrounds.
 * EN: Creates level 2 backgrounds.
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
