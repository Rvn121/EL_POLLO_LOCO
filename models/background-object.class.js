class BackgroundObject extends MovableObject {

    width = 720;
    height = 480;
    /**
     * DE: Erstellt ein neues Objekt und legt seine Startwerte fest.
     * EN: Creates a new object and sets its initial values.
     * @param {string} imagePath - DE: Übergabewert imagePath. EN: Argument imagePath.
     * @param {number} x - DE: x. EN: x.
     */
    constructor(imagePath, x,){
        super().loadImage(imagePath);
        this.x = x;
        this.y = 480 - this.height;
    }


}