/** Creates the longer and more difficult second level. */
function createLevel2() {
    return new Level(createLevel2Enemies(), createLevelClouds(), createLevel2Backgrounds());
}

/** Creates 60 chickens, including 20 patrolling to the right. */
function createLevel2Enemies() {
    const enemies = [];
    for (let i = 0; i < 60; i++) {
        const x = 1050 + i * 135 + Math.random() * 130;
        const enemy = i % 2 ? new chicken(x) : new chickenSmall(x);
        if (i < 20) enemy.startPatrol(x - 140, x + 140);
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
