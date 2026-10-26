class Level {
    enemies;
    clouds;
    backgroundObjects;
    level_start_x;
    level_end_x;

    /**
     * DE: Erstellt das Objekt und legt seine Anfangswerte fest.
     * EN: Creates the object and sets its initial values.
     * @param {MovableObject[]} enemies - DE: Wert enemies. EN: Value enemies.
     * @param {cloud[]} clouds - DE: Wert clouds. EN: Value clouds.
     * @param {BackgroundObject[]} backgroundObjects - DE: Wert backgroundObjects. EN: Value backgroundObjects.
     */
    constructor(enemies, clouds, backgroundObjects){
        this.enemies = enemies;
        this.clouds = clouds;
        this.backgroundObjects = backgroundObjects;
        this.level_start_x = Math.min(...backgroundObjects.map(object => object.x));
        this.level_end_x = Math.max(...backgroundObjects.map(object => object.x + object.width));


    }


}


