/** DE: Erstellt das Tutorial mit Gegnern, Wolken und Hintergründen. EN: Creates the tutorial with enemies, clouds, and backgrounds.
 * @returns {*} DE: Berechnetes Ergebnis. EN: Computed result.
 */
function createLevel1() {
    return new Level(
        createLevelEnemies(),
        createLevelClouds(),
        createLevelBackgrounds()
    );
}

/** DE: Erstellt Level enemies. EN: Creates level enemies.
 * @returns {*} DE: Berechnetes Ergebnis. EN: Computed result.
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
    boss.healthPhases = false;
    enemies.push(boss);
    return enemies;
}

/** DE: Erstellt small Hühner. EN: Creates small chickens.
 * @returns {*} DE: Berechnetes Ergebnis. EN: Computed result.
 */
function createSmallChickens() {
    const enemies = [];
    for (let index = 0; index < 28; index++) enemies.push(createSmallChicken(index));
    return enemies;
}

/** DE: Erstellt small Huhn. EN: Creates small chicken.
 * @param {number} index - DE: Parameter index. EN: index parameter.
 * @returns {*} DE: Berechnetes Ergebnis. EN: Computed result.
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

/** DE: Erstellt normal Hühner. EN: Creates normal chickens.
 * @returns {*} DE: Berechnetes Ergebnis. EN: Computed result.
 */
function createNormalChickens() {
    const enemies = [];
    for (let index = 0; index < 10; index++) {
        const x = 2700 + index * 220 + Math.random() * 180;
        enemies.push(new chicken(x));
    }
    return enemies;
}

/** DE: Erstellt Level Wolken. EN: Creates level clouds.
 * @returns {*} DE: Berechnetes Ergebnis. EN: Computed result.
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

/** DE: Erstellt Level backgrounds. EN: Creates level backgrounds.
 * @returns {*} DE: Berechnetes Ergebnis. EN: Computed result.
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
