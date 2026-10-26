class BackgroundObject extends MovableObject {

    width = 720;
    height = 480;
    /**
 * DE: Verarbeitet.
 * EN: Processes.
 * @param {string} imagePath - DE: Eingabewert. EN: Input value.
 * @param {number} x - DE: x. EN: x.
 */
    constructor(imagePath, x,){
        super().loadImage(imagePath);
        this.x = x;
        this.y = 480 - this.height;
    }


}