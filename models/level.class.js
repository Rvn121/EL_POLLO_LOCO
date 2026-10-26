class Level {
    enemies;
    clouds;
    backgroundObjects;
    level_start_x;
    level_end_x;

    /**
 * DE: Verarbeitet.
 * EN: Processes.
 * @param {MovableObject[]} enemies - DE: Eingabewert. EN: Input value.
 * @param {cloud[]} clouds - DE: Eingabewert. EN: Input value.
 * @param {BackgroundObject[]} backgroundObjects - DE: Eingabewert. EN: Input value.
 */
    constructor(enemies, clouds, backgroundObjects){
        this.enemies = enemies;
        this.clouds = clouds;
        this.backgroundObjects = backgroundObjects;
        this.level_start_x = Math.min(...backgroundObjects.map(object => object.x));
        this.level_end_x = Math.max(...backgroundObjects.map(object => object.x + object.width));


    }


}


