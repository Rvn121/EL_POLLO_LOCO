const level1 = new Level(
    createLevelEnemies(),
    createLevelClouds(),
    createLevelBackgrounds()
);

function createLevelEnemies() {
    return [
        new chicken(1100),
        new chicken(1500),
        new chicken(1900),
        new chicken(2300),
        new Endboss()
    ];
}

function createLevelClouds() {
    return Array.from({ length: 8 }, () => {
        const x = -200 + Math.random() * 3200;
        const y = 10 + Math.random() * 90;
        return new cloud(x, y);
    });
}

function createLevelBackgrounds() {
    return [
        new BackgroundObject("img/5_background/layers/air.png", -720),
        new BackgroundObject("img/5_background/layers/3_third_layer/2.png", -720),
        new BackgroundObject("img/5_background/layers/2_second_layer/2.png", -720),
        new BackgroundObject("img/5_background/layers/1_first_layer/2.png", -720),

        new BackgroundObject("img/5_background/layers/air.png", 0),
        new BackgroundObject("img/5_background/layers/3_third_layer/1.png", 0),
        new BackgroundObject("img/5_background/layers/2_second_layer/1.png", 0),
        new BackgroundObject("img/5_background/layers/1_first_layer/1.png", 0),

        new BackgroundObject("img/5_background/layers/air.png", 720),
        new BackgroundObject("img/5_background/layers/3_third_layer/2.png", 720),
        new BackgroundObject("img/5_background/layers/2_second_layer/2.png", 720),
        new BackgroundObject("img/5_background/layers/1_first_layer/2.png", 720),

        new BackgroundObject("img/5_background/layers/air.png", 720 * 2),
        new BackgroundObject("img/5_background/layers/3_third_layer/1.png", 720 * 2),
        new BackgroundObject("img/5_background/layers/2_second_layer/1.png", 720 * 2),
        new BackgroundObject("img/5_background/layers/1_first_layer/1.png", 720 * 2),

        new BackgroundObject("img/5_background/layers/air.png", 720 * 3),
        new BackgroundObject("img/5_background/layers/3_third_layer/2.png", 720 * 3),
        new BackgroundObject("img/5_background/layers/2_second_layer/2.png", 720 * 3),
        new BackgroundObject("img/5_background/layers/1_first_layer/2.png", 720 * 3)
    ];
}
