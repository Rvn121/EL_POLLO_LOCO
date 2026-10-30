class Level {
    enemies;
    clouds;
    backgroundObjects;
    level_start_x;
    level_end_x;

    /**
     * Initializes this object and sets up its required game data.
     * @param {*} enemies - The enemies used by this method.
     * @param {*} clouds - The clouds used by this method.
     * @param {*} backgroundObjects - The background objects used by this method.
     */
    constructor(enemies, clouds, backgroundObjects){
        this.enemies = enemies;
        this.clouds = clouds;
        this.backgroundObjects = backgroundObjects;
        this.level_start_x = backgroundObjects[0].x;
        this.level_end_x = backgroundObjects[0].x + backgroundObjects[0].width;
        for (let i = 1; i < backgroundObjects.length; i++) {
            const object = backgroundObjects[i];
            this.level_start_x = Math.min(this.level_start_x, object.x);
            this.level_end_x = Math.max(this.level_end_x, object.x + object.width);
        }


    }


}
