class Level {
    enemies;
    clouds;
    backgroundObjects;
    level_start_x;
    level_end_x;

    /** DE: Erstellt das Objekt und setzt seine Startwerte. EN: Creates the object and sets its initial values.
 * @param {Array} enemies - DE: Parameter enemies. EN: enemies parameter.
 * @param {Array} clouds - DE: Parameter clouds. EN: clouds parameter.
 * @param {Array} backgroundObjects - DE: Parameter backgroundObjects. EN: backgroundObjects parameter.
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


