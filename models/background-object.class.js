class BackgroundObject extends MovableObject {

    width = 720;
    height = 480;
    /**
     * DE: Erstellt das Objekt und legt seine Anfangswerte fest.
     * EN: Creates the object and sets its initial values.
     * @param {string} imagePath - DE: Wert imagePath. EN: Value imagePath.
     * @param {number} x - DE: x. EN: x.
     */
    constructor(imagePath, x,){
        super().loadImage(imagePath);
        this.x = x;
        this.y = 480 - this.height;
    }


}