class DrawableObject {
    x = 20;
    y = 180;
    img;
    height = 250;
    width = 200;
    imageCache = {};
    currentImage = 0;
    imageBounds = {};

    /**
 * DE: Lädt Bild.
 * EN: Loads image.
 * @param {string} path - DE: path. EN: path.
 */
    loadImage(path) {
        this.img = new Image();
        this.img.src = path;
    }

    /**
     * DE: Lädt mehrere Bilder in den Bildspeicher.
     * EN: Loads images for the game.
     * @param {string[]} images - DE: images. EN: images.
     */
    loadImages(images) {
        images.forEach(path => {
            const img = new Image();
            img.src = path;
            this.imageCache[path] = img;
        });
    }

    /**
     * DE: Berechnet den sichtbaren Trefferbereich der aktuellen Grafik.
     * EN: Calculates the visible hitbox of the current image.
     */
    getHitbox() {
        if (!this.img || !this.img.complete || !this.img.naturalWidth) return null;
        if (!this.img.visibleBoundsCalculated) this.cacheImageBounds();
        const bounds = this.img.visibleBounds;
        if (!bounds) return null;
        return this.scaleHitbox(bounds);
    }

    /**
     * DE: Speichert den sichtbaren Bildbereich für spätere Kollisionen.
     * EN: Caches visible image bounds for later collisions.
     */
    cacheImageBounds() {
        this.img.visibleBounds = this.measureImageBounds();
        this.img.visibleBoundsCalculated = true;
    }

    /**
 * DE: Verarbeitet Trefferbereich.
 * EN: Processes hitbox.
 * @param {Object} bounds - DE: Eingabewert. EN: Input value.
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

    /**
     * DE: Liest Bildpixel aus, um den sichtbaren Bereich zu ermitteln.
     * EN: Reads image pixels to measure the visible area.
     */
    measureImageBounds() {
        const canvas = this.createMeasurementCanvas();
        const ctx = canvas.getContext("2d");
        ctx.drawImage(this.img, 0, 0);
        const pixels = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
        return this.findOpaqueBounds(pixels, canvas.width, canvas.height);
    }

    /**
 * DE: Erstellt measurement canvas.
 * EN: Creates measurement canvas.
 */
    createMeasurementCanvas() {
        const canvas = document.createElement("canvas");
        canvas.width = this.img.naturalWidth;
        canvas.height = this.img.naturalHeight;
        return canvas;
    }

    /**
 * DE: Sucht opaque bounds.
 * EN: Finds opaque bounds.
 * @param {Uint8ClampedArray} pixels - DE: Eingabewert. EN: Input value.
 * @param {number} width - DE: Eingabewert. EN: Input value.
 * @param {number} height - DE: Eingabewert. EN: Input value.
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

    /**
 * DE: Verarbeitet bounds.
 * EN: Processes bounds.
 * @param {Object} bounds - DE: Eingabewert. EN: Input value.
 * @param {number} x - DE: Eingabewert. EN: Input value.
 * @param {number} y - DE: Eingabewert. EN: Input value.
 */
    expandBounds(bounds, x, y) {
        bounds.left = Math.min(bounds.left, x);
        bounds.top = Math.min(bounds.top, y);
        bounds.right = Math.max(bounds.right, x + 1);
        bounds.bottom = Math.max(bounds.bottom, y + 1);
    }
}
