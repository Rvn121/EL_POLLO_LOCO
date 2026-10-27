class BackgroundObject extends MovableObject {

    width = 720;
    height = 480;
    /** DE: Erstellt das Objekt und setzt seine Startwerte. EN: Creates the object and sets its initial values.
 * @param {string} imagePath - DE: Parameter imagePath. EN: imagePath parameter.
 * @param {number} x - DE: Parameter x. EN: x parameter.
 */
    constructor(imagePath, x,){
        super().loadImage(imagePath);
        this.x = x;
        this.y = 480 - this.height;
    }


}