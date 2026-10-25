/** Creates the longer and more difficult second level. */
function createLevel2() {
    return new Level(createLevel2Enemies(), createLevelClouds(), createLevel2Backgrounds());
}

/** Spreads 60 chickens through the level, with patrols throughout the map. */
function createLevel2Enemies() {
    const enemies = [];
    for (let i = 0; i < 60; i++) {
        const small = i % 2 === 0;
        const smallIndex = i / 2;
        const behindStart = small && smallIndex < 3;
        const x = small
            ? (behindStart
                ? -600 + smallIndex * 120 + Math.random() * 20
                : 1050 + (smallIndex - 3) * 335 + Math.random() * 80)
            : 1050 + i * 135 + Math.random() * 130;
        const enemy = i % 2 ? new chicken(x) : new chickenSmall(x);
        if ((small && (i / 2) % 5 !== 4) || (!small && i % 6 === 1)) {
            const range = 140 + Math.random() * 160;
            enemy.startPatrol(
                Math.max(behindStart ? -620 : 850, x - range),
                Math.min(behindStart ? -300 : 10100, x + range));
        }
        enemies.push(enemy);
    }
    enemies.push(new MiniBoss(3800), new MiniBoss(6900));
    enemies.push(new Endboss(10300, true));
    return enemies;
}

/** Reuses the existing background assets for the new level. */
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
