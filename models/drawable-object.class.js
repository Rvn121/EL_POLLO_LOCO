class DrawableObject {
    static sharedImages = new Map();

    /** Reuses decoded graphics across actors and level restarts. */
    static getImage(path) {
        if (!this.sharedImages.has(path)) {
            const image = new Image();
            image.src = path;
            this.sharedImages.set(path, image);
        }
        return this.sharedImages.get(path);
    }

    static async waitForImages() {
        await Promise.allSettled([...this.sharedImages.values()].map(image => image.decode()));
    }
    x = 20;
    y = 180;
    img;
    height = 250;
    width = 200;
    imageCache = {};
    currentImage = 0;
    imageBounds = {};

    /** DE: Lädt Bild. EN: Loads image.
 * @param {string} path - DE: Parameter path. EN: path parameter.
 */
    loadImage(path) {
        this.img = DrawableObject.getImage(path);
    }

    /** DE: Lädt Bilder. EN: Loads images.
 * @param {Array} images - DE: Parameter images. EN: images parameter.
 */
    loadImages(images) {
        images.forEach(path => {
            this.imageCache[path] = DrawableObject.getImage(path);
        });
    }

    /** DE: Berechnet die Hitbox des aktuellen Bildes. EN: Calculates the hitbox of the current image.
 * @returns {*} DE: Berechnetes Ergebnis. EN: Computed result.
 */
    getHitbox() {
        if (!this.img || !this.img.complete || !this.img.naturalWidth) return null;
        if (!this.img.visibleBoundsCalculated) this.cacheImageBounds();
        const bounds = this.img.visibleBounds;
        if (!bounds) return null;
        return this.scaleHitbox(bounds);
    }

    /** DE: Speichert den sichtbaren Bildbereich für spätere Kollisionen. EN: Caches visible image bounds for later collisions.
 * @param {number} x - DE: Parameter x. EN: x parameter.
 * @param {number} y - DE: Parameter y. EN: y parameter.
 * @returns {*} DE: Berechnetes Ergebnis. EN: Computed result.
 */
    hasVisiblePixelAt(x, y) {
        const image = this.img;
        if (!image || !image.collisionPixels) return false;
        let sourceX = Math.floor((x - this.x) * image.naturalWidth / this.width);
        const sourceY = Math.floor((y - this.y) * image.naturalHeight / this.height);
        if (this.otherDirection) sourceX = image.naturalWidth - 1 - sourceX;
        if (sourceX < 0 || sourceX >= image.naturalWidth || sourceY < 0 || sourceY >= image.naturalHeight) return false;
        return image.collisionPixels[(sourceY * image.naturalWidth + sourceX) * 4 + 3] > 0;
    }

    /** DE: Verarbeitet Bild Grenzen. EN: Handles image bounds. */
    cacheImageBounds() {
        this.img.visibleBounds = this.measureImageBounds();
        this.img.visibleBoundsCalculated = true;
    }

    /** DE: Skaliert Hitbox. EN: Scales hitbox.
 * @param {*} bounds - DE: Parameter bounds. EN: bounds parameter.
 * @returns {*} DE: Berechnetes Ergebnis. EN: Computed result.
 */
    scaleHitbox(bounds) {
        const scaleX = this.width / this.img.naturalWidth;
        const scaleY = this.height / this.img.naturalHeight;
        let left = bounds.left;
        if (this.otherDirection) left = this.img.naturalWidth - bounds.right;
        return {
            x: this.x + left * scaleX,
            y: this.y + bounds.top * scaleY,
            width: (bounds.right - bounds.left) * scaleX,
            height: (bounds.bottom - bounds.top) * scaleY
        };
    }

    /** DE: Liest Bildpixel aus, um den sichtbaren Bereich zu ermitteln. EN: Reads image pixels to measure the visible area.
 * @returns {*} DE: Berechnetes Ergebnis. EN: Computed result.
 */
    measureImageBounds() {
        const canvas = this.createMeasurementCanvas();
        const ctx = canvas.getContext("2d");
        ctx.drawImage(this.img, 0, 0);
        const pixels = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
        this.img.collisionPixels = pixels;
        return this.findOpaqueBounds(pixels, canvas.width, canvas.height);
    }

    /** DE: Erstellt measurement canvas. EN: Creates measurement canvas.
 * @returns {*} DE: Berechnetes Ergebnis. EN: Computed result.
 */
    createMeasurementCanvas() {
        const canvas = document.createElement("canvas");
        canvas.width = this.img.naturalWidth;
        canvas.height = this.img.naturalHeight;
        return canvas;
    }

    /** DE: Sucht opaque Grenzen. EN: Finds opaque bounds.
 * @param {*} pixels - DE: Parameter pixels. EN: pixels parameter.
 * @param {number} width - DE: Parameter width. EN: width parameter.
 * @param {number} height - DE: Parameter height. EN: height parameter.
 * @returns {*} DE: Berechnetes Ergebnis. EN: Computed result.
 */
    findOpaqueBounds(pixels, width, height) {
        const bounds = { left: width, top: height, right: 0, bottom: 0 };
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                if (pixels[(y * width + x) * 4 + 3] > 0) this.expandBounds(bounds, x, y);
            }
        }
        if (bounds.right > bounds.left) return bounds;
        return null;
    }

    /** DE: Erweitert Grenzen. EN: Expands bounds.
 * @param {*} bounds - DE: Parameter bounds. EN: bounds parameter.
 * @param {number} x - DE: Parameter x. EN: x parameter.
 * @param {number} y - DE: Parameter y. EN: y parameter.
 */
    expandBounds(bounds, x, y) {
        bounds.left = Math.min(bounds.left, x);
        bounds.top = Math.min(bounds.top, y);
        bounds.right = Math.max(bounds.right, x + 1);
        bounds.bottom = Math.max(bounds.bottom, y + 1);
    }
}
