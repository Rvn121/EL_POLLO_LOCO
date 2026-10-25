class DrawableObject {
    x = 20;
    y = 180;
    img;
    height = 250;
    width = 200;
    imageCache = {};
    currentImage = 0;
    imageBounds = new WeakMap();

    /**
     * DE: Lädt ein Bild.
     * EN: Load image.
     * @param {string} path - DE: path. EN: path.
     */
    loadImage(path) {
        this.img = new Image();
        this.img.src = path;
    }

    /**
     * DE: Lädt mehrere Bilder.
     * EN: Load images.
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
     * DE: Liefert hitbox.
     * EN: Returns hitbox.
     */
    getHitbox() {
        if (!this.img || !this.img.complete || !this.img.naturalWidth) return null;
        if (!this.imageBounds.has(this.img)) this.cacheImageBounds();
        const bounds = this.imageBounds.get(this.img);
        if (!bounds) return null;
        return this.scaleHitbox(bounds);
    }

    /**
     * DE: Speichert zwischen image bounds.
     * EN: Caches image bounds.
     */
    cacheImageBounds() {
        this.imageBounds.set(this.img, this.measureImageBounds());
    }

    /**
     * DE: Skaliert hitbox.
     * EN: Scales hitbox.
     * @param {Object} bounds - DE: Übergabewert bounds. EN: Argument bounds.
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
     * DE: Misst image bounds.
     * EN: Measures image bounds.
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
     * @param {Uint8ClampedArray} pixels - DE: Übergabewert pixels. EN: Argument pixels.
     * @param {number} width - DE: Übergabewert width. EN: Argument width.
     * @param {number} height - DE: Übergabewert height. EN: Argument height.
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
     * DE: Erweitert bounds.
     * EN: Expands bounds.
     * @param {Object} bounds - DE: Übergabewert bounds. EN: Argument bounds.
     * @param {number} x - DE: Übergabewert x. EN: Argument x.
     * @param {number} y - DE: Übergabewert y. EN: Argument y.
     */
    expandBounds(bounds, x, y) {
        bounds.left = Math.min(bounds.left, x);
        bounds.top = Math.min(bounds.top, y);
        bounds.right = Math.max(bounds.right, x + 1);
        bounds.bottom = Math.max(bounds.bottom, y + 1);
    }
}
