/** DE: Erstellt das zweite Level mit Gegnern, Wolken und Hintergründen. EN: Creates the second level with enemies, clouds, and backgrounds.
 * @returns {*} DE: Berechnetes Ergebnis. EN: Computed result.
 */
function createLevel2() {
    return new Level(createLevel2Enemies(), createLevelClouds(), createLevel2Backgrounds());
}

/** DE: Erstellt die Gegner und Bosse für Level 2. EN: Creates enemies and bosses for level 2.
 * @returns {*} DE: Berechnetes Ergebnis. EN: Computed result.
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

/** DE: Erstellt Level 2 Huhn. EN: Creates level 2 chicken.
 * @param {number} index - DE: Parameter index. EN: index parameter.
 * @returns {*} DE: Berechnetes Ergebnis. EN: Computed result.
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

/** DE: Bestimmt die Startposition eines kleinen Huhns. EN: Calculates the start position of a small chicken.
 * @param {number} index - DE: Parameter index. EN: index parameter.
 * @param {*} behindStart - DE: Parameter behindStart. EN: behindStart parameter.
 * @returns {*} DE: Berechnetes Ergebnis. EN: Computed result.
 */
function getSmallChickenX(index, behindStart) {
    if (behindStart) return -600 + index * 120 + Math.random() * 20;
    return 1050 + (index - 3) * 335 + Math.random() * 80;
}

/** DE: Setzt Level 2 Patrouille. EN: Sets level 2 patrol.
 * @param {*} enemy - DE: Parameter enemy. EN: enemy parameter.
 * @param {number} x - DE: Parameter x. EN: x parameter.
 * @param {*} behindStart - DE: Parameter behindStart. EN: behindStart parameter.
 */
function setLevel2Patrol(enemy, x, behindStart) {
    const range = 140 + Math.random() * 160;
    let minLimit = 850;
    let maxLimit = 10100;
    if (behindStart) { minLimit = -620; maxLimit = -300; }
    enemy.startPatrol(Math.max(minLimit, x - range), Math.min(maxLimit, x + range));
}

/** DE: Erstellt Level 2 backgrounds. EN: Creates level 2 backgrounds.
 * @returns {*} DE: Berechnetes Ergebnis. EN: Computed result.
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
