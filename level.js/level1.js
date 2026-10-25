function createLevel1() {
    return new Level(
        createLevelEnemies(),
        createLevelClouds(),
        createLevelBackgrounds()
    );
}

function createLevelEnemies() {
    const enemies = [ ...createSmallChickens(), ...createNormalChickens() ];
    for (let i = 0; i < 7; i++) {
        const x = 1120 + i * 640 + Math.random() * 100;
        enemies.push(new chicken(x));
    }
    const boss = new Endboss(6100, true);
    boss.healthPhases = true;
    enemies.push(boss);
    return enemies;
}

function createSmallChickens() {
    return Array.from({ length: 28 }, (_, index) => {
        const behindStart = index < 3;
        const x = behindStart
            ? -600 + index * 120 + Math.random() * 20
            : 1050 + (index - 3) * 190 + Math.random() * 70;
        const enemy = new chickenSmall(x);
        if (index % 4 !== 3) {
            const range = 110 + Math.random() * 100;
            enemy.startPatrol(
                Math.max(behindStart ? -620 : 850, x - range),
                Math.min(behindStart ? -300 : 5900, x + range));
        }
        return enemy;
    });
}

function createNormalChickens() {
    return Array.from({ length: 10 }, (_, index) => {
        const x = 2700 + index * 220 + Math.random() * 180;
        return new chicken(x);
    });
}

function createLevelClouds() {
    return Array.from({ length: 14 }, (_, index) => {
        const x = -300 + index * 520 + Math.random() * 220;
        const y = 5 + Math.random() * 115;
        return new cloud(x, y);
    });
}

function createLevelBackgrounds() {
    const backgrounds = [];
    const pattern = [
        ["img/5_background/layers/air.png", "img/5_background/layers/3_third_layer/1.png",
            "img/5_background/layers/2_second_layer/1.png", "img/5_background/layers/1_first_layer/1.png"],
        ["img/5_background/layers/air.png", "img/5_background/layers/3_third_layer/2.png",
            "img/5_background/layers/2_second_layer/2.png", "img/5_background/layers/1_first_layer/2.png"]
    ];

    for (let i = -1; i < 16; i++) {
        const images = pattern[Math.abs(i) % 2];
        backgrounds.push(new BackgroundObject(images[0], 720 * i));
        backgrounds.push(new BackgroundObject(images[1], 720 * i));
        backgrounds.push(new BackgroundObject(images[2], 720 * i));
        backgrounds.push(new BackgroundObject(images[3], 720 * i));
    }
    return backgrounds;
}
