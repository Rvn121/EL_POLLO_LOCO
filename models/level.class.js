class Level {
    enemies;
    clouds;
    backgroundObjects;
    level_start_x;
    level_end_x;

    constructor(enemies, clouds, backgroundObjects){
        this.enemies = enemies;
        this.clouds = clouds;
        this.backgroundObjects = backgroundObjects;
        this.level_start_x = Math.min(...backgroundObjects.map(object => object.x));
        this.level_end_x = Math.max(...backgroundObjects.map(object => object.x + object.width));


    }


}


