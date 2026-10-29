/**
 * Creates the second level with its enemies, clouds, and background.
 * @returns {*} The result of create level2().
 */
function createLevel2() {
    return new Level(createLevel2Enemies(), createLevelClouds(), createLevel2Backgrounds());
}

/**
 * Creates the enemies and bosses assigned to the second level.
 * @returns {*} The result of create level2enemies().
 */
function createLevel2Enemies() {
    const enemies = [];
    for (let i = 0; i < 60; i++) enemies.push(createLevel2Chicken(i));
    enemies.push(new MiniBoss(3800), new MiniBoss(6900));
    const boss = new Endboss(10300, true);
    boss.healthPhases = true;
    boss.aggressive = true;
    boss.hitPhases = true;
    boss.combatPhase = "charge";
    boss.phaseRemaining = 1800;
    enemies.push(boss);
    return enemies;
}

/**
 * Creates a chicken of the selected type for level two.
 * @param {number} index - The position of an item in a list.
 * @returns {*} The result of create level2chicken().
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
 * Calculates the starting position of a small chicken.
 * @param {number} index - The position of an item in a list.
 * @param {*} behindStart - The behind start used by this method.
 * @returns {*} The result of get small chicken x().
 */
function getSmallChickenX(index, behindStart) {
    if (behindStart) return -600 + index * 120 + Math.random() * 20;
    return 1050 + (index - 3) * 335 + Math.random() * 80;
}

/**
 * Assigns left and right patrol boundaries to a level-two chicken.
 * @param {*} enemy - The enemy involved in the collision.
 * @param {number} x - The horizontal coordinate.
 * @param {*} behindStart - The behind start used by this method.
 */
function setLevel2Patrol(enemy, x, behindStart) {
    const range = 140 + Math.random() * 160;
    let minLimit = 850;
    let maxLimit = 10100;
    if (behindStart) { minLimit = -620; maxLimit = -300; }
    enemy.startPatrol(Math.max(minLimit, x - range), Math.min(maxLimit, x + range));
}

/**
 * Creates the repeating background layers for level two.
 * @returns {*} The result of create level2backgrounds().
 */
function createLevel2Backgrounds() {
    const backgrounds = createLevelBackgrounds();
    const extra = [];
    for (let i = 16; i < 18; i++) {
        const images = ["air.png", "3_third_layer/1.png", "2_second_layer/1.png", "1_first_layer/1.png"];
        images.forEach(path => extra.push(new BackgroundObject(
            "img/5_background/layers/" + path.replace("air.png", "air.png"), i * 720)));
    }
    for (let i = 0; i < extra.length; i++) backgrounds.push(extra[i]);
    return backgrounds;
}
