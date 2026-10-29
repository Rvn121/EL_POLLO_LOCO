class BackgroundObject extends MovableObject {

    width = 720;
    height = 480;
    /**
     * Initializes this object and sets up its required game data.
     * @param {string} imagePath - The image path used by this method.
     * @param {number} x - The horizontal coordinate.
     */
    constructor(imagePath, x,){
        super().loadImage(imagePath);
        this.x = x;
        this.y = 480 - this.height;
    }


}
