/**
 * DE: Erstellt das Tutorial mit Gegnern, Wolken und Hintergründen.
 * EN: Creates the tutorial with enemies, clouds, and backgrounds.
 */
function createLevel1() {
    return new Level(
        createLevelEnemies(),
        createLevelClouds(),
        createLevelBackgrounds()
    );
}

/**
 * DE: Erstellt die Gegner für das Tutorial.
 * EN: Creates enemies for the tutorial.
 */
function createLevelEnemies() {
    const enemies = [ ...createSmallChickens(), ...createNormalChickens() ];
    for (let i = 0; i < 7; i++) {
        const x = 1120 + i * 640 + Math.random() * 100;
        enemies.push(new chicken(x));
    }
    const boss = new Endboss(6100, true);
    boss.healthPhases = false;
    enemies.push(boss);
    return enemies;
}

/**
 * DE: Erstellt small chickens für das Spiel.
 * EN: Creates small chickens for the game.
 */
function createSmallChickens() {
    const enemies = [];
    for (let index = 0; index < 28; index++) enemies.push(createSmallChicken(index));
    return enemies;
}

/**
 * DE: Erstellt small chicken für das Spiel.
 * EN: Creates small chicken for the game.
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
 * DE: Erstellt normal chickens für das Spiel.
 * EN: Creates normal chickens for the game.
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
 * DE: Erstellt level clouds für das Spiel.
 * EN: Creates level clouds for the game.
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
 * DE: Erstellt level backgrounds für das Spiel.
 * EN: Creates level backgrounds for the game.
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
