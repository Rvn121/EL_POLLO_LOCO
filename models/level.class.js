class Level {
    enemies;
    clouds;
    backgroundObjects;
    level_start_x;
    level_end_x;

    /**
     * DE: Erstellt ein neues Objekt und legt seine Startwerte fest.
     * EN: Creates a new object and sets its initial values.
     * @param {MovableObject[]} enemies - DE: Übergabewert enemies. EN: Argument enemies.
     * @param {cloud[]} clouds - DE: Übergabewert clouds. EN: Argument clouds.
     * @param {BackgroundObject[]} backgroundObjects - DE: Übergabewert backgroundObjects. EN: Argument backgroundObjects.
     */
    constructor(enemies, clouds, backgroundObjects){
        this.enemies = enemies;
        this.clouds = clouds;
        this.backgroundObjects = backgroundObjects;
        this.level_start_x = Math.min(...backgroundObjects.map(object => object.x));
        this.level_end_x = Math.max(...backgroundObjects.map(object => object.x + object.width));


    }


}


