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
     * DE: Lädt ein einzelnes Bild für das Spiel.
     * EN: Loads image for the game.
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
     * DE: Überträgt Bildkoordinaten auf Größe und Position des Objekts.
     * EN: Scales image coordinates to the object size and position.
     * @param {Object} bounds - DE: Wert bounds. EN: Value bounds.
     */
    scaleHitbox(bounds) {
        const scaleX = this.width / this.img.naturalWidth;
        const scaleY = this.height / this.img.naturalHeight;
        const left = this.otherDirection ? this.img.naturalWidth - bounds.right : bounds.left;
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
     * DE: Erstellt measurement canvas für das Spiel.
     * EN: Creates measurement canvas for the game.
     */
    createMeasurementCanvas() {
        const canvas = document.createElement("canvas");
        canvas.width = this.img.naturalWidth;
        canvas.height = this.img.naturalHeight;
        return canvas;
    }

    /**
     * DE: Findet den Bereich der nicht transparenten Bildpixel.
     * EN: Finds the area occupied by nontransparent pixels.
     * @param {Uint8ClampedArray} pixels - DE: Wert pixels. EN: Value pixels.
     * @param {number} width - DE: Wert width. EN: Value width.
     * @param {number} height - DE: Wert height. EN: Value height.
     */
    findOpaqueBounds(pixels, width, height) {
        const bounds = { left: width, top: height, right: 0, bottom: 0 };
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                if (pixels[(y * width + x) * 4 + 3] > 0) this.expandBounds(bounds, x, y);
            }
        }
        return bounds.right > bounds.left ? bounds : null;
    }

    /**
     * DE: Führt expand bounds im Spiel aus.
     * EN: Runs expand bounds in the game.
     * @param {Object} bounds - DE: Wert bounds. EN: Value bounds.
     * @param {number} x - DE: Wert x. EN: Value x.
     * @param {number} y - DE: Wert y. EN: Value y.
     */
    expandBounds(bounds, x, y) {
        bounds.left = Math.min(bounds.left, x);
        bounds.top = Math.min(bounds.top, y);
        bounds.right = Math.max(bounds.right, x + 1);
        bounds.bottom = Math.max(bounds.bottom, y + 1);
    }
}
