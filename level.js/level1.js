/**
 * Creates the tutorial level with its enemies, clouds, and background.
 * @returns {*} The result of create level1().
 */
function createLevel1() {
    return new Level(
        createLevelEnemies(),
        createLevelClouds(),
        createLevelBackgrounds()
    );
}

/**
 * Creates the enemies assigned to the tutorial level.
 * @returns {*} The result of create level enemies().
 */
function createLevelEnemies() {
    const enemies = createSmallChickens();
    const normalChickens = createNormalChickens();
    for (let i = 0; i < normalChickens.length; i++) enemies.push(normalChickens[i]);
    for (let i = 0; i < 7; i++) {
        const x = 1120 + i * 640 + Math.random() * 100;
        enemies.push(new chicken(x));
    }
    const boss = new Endboss(6100, true);
    boss.healthPhases = true;
    boss.hitPhases = true;
    enemies.push(boss);
    return enemies;
}

/**
 * Places small chickens throughout the level.
 * @returns {*} The result of create small chickens().
 */
function createSmallChickens() {
    const enemies = [];
    for (let index = 0; index < 28; index++) enemies.push(createSmallChicken(index));
    return enemies;
}

/**
 * Creates one small chicken at its assigned start position.
 * @param {number} index - The position of an item in a list.
 * @returns {*} The result of create small chicken().
 */
function createSmallChicken(index) {
    const behindStart = index < 3;
    let x = 1050 + (index - 3) * 190 + Math.random() * 70;
    if (behindStart) x = -600 + index * 120 + Math.random() * 20;
    const enemy = new chickenSmall(x);
    if (index % 4 !== 3) {
        const range = 110 + Math.random() * 100;
        let minLimit = 850;
        let maxLimit = 5900;
        if (behindStart) { minLimit = -620; maxLimit = -300; }
        enemy.startPatrol(Math.max(minLimit, x - range), Math.min(maxLimit, x + range));
    }
    return enemy;
}

/**
 * Places normal chickens throughout the level.
 * @returns {*} The result of create normal chickens().
 */
function createNormalChickens() {
    const enemies = [];
    for (let index = 0; index < 10; index++) {
        const x = 2700 + index * 220 + Math.random() * 180;
        enemies.push(new chicken(x));
    }
    return enemies;
}

/**
 * Distributes clouds across the level sky.
 * @returns {*} The result of create level clouds().
 */
function createLevelClouds() {
    const clouds = [];
    for (let index = 0; index < 14; index++) {
        const x = -300 + index * 520 + Math.random() * 220;
        const y = 5 + Math.random() * 115;
        clouds.push(new cloud(x, y));
    }
    return clouds;
}

/**
 * Creates the repeating background layers for the tutorial.
 * @returns {*} The result of create level backgrounds().
 */
function createLevelBackgrounds() {
    const backgrounds = [];
    const pattern = [
        ["air.png", "3_third_layer/1.png", "2_second_layer/1.png", "1_first_layer/1.png"],
        ["air.png", "3_third_layer/2.png", "2_second_layer/2.png", "1_first_layer/2.png"]
    ];
    for (let i = -1; i < 16; i++) {
        const images = pattern[Math.abs(i) % 2];
        images.forEach(image => backgrounds.push(new BackgroundObject(
            "img/5_background/layers/" + image, 720 * i)));
    }
    return backgrounds;
}
