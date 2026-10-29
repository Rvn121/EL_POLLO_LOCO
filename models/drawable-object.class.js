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

/**
     * Waits for all cached images to load.
     * @returns {Promise<void>} Loading completion.
     */
    static async waitForImages() {
        const promises = [];
        for (const image of this.sharedImages.values()) {
            promises.push(image.decode());
        }
        await Promise.allSettled(promises);
    }
    x = 20;
    y = 180;
    img;
    height = 250;
    width = 200;
    imageCache = {};
    currentImage = 0;
    imageBounds = {};

    /**
     * Loads one image into the object.
     * @param {string} path - The file path of the image or audio asset.
     */
    loadImage(path) {
        this.img = DrawableObject.getImage(path);
    }

    /**
     * Loads several animation images into the image cache.
     * @param {*} images - The image paths to load or draw.
     */
    loadImages(images) {
        images.forEach(path => {
            this.imageCache[path] = DrawableObject.getImage(path);
        });
    }

    /**
     * Returns the collision area of the object image.
     */
    getHitbox() {
        if (!this.img || !this.img.complete || !this.img.naturalWidth) return null;
        if (!this.img.visibleBoundsCalculated) this.cacheImageBounds();
        const bounds = this.img.visibleBounds;
        if (!bounds) return null;
        return this.scaleHitbox(bounds);
    }

    /**
     * Checks whether the image pixel at a given position is visible.
     * @param {number} x - The horizontal coordinate.
     * @param {number} y - The vertical coordinate.
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

    /**
     * Saves the visible image boundaries for later collision checks.
     */
    cacheImageBounds() {
        this.img.visibleBounds = this.measureImageBounds();
        this.img.visibleBoundsCalculated = true;
    }

    /**
     * Converts image pixel boundaries into on-screen coordinates.
     * @param {*} bounds - The bounds used by this method.
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
     * Measures the visible pixel boundaries of the current image.
     */
    measureImageBounds() {
        const canvas = this.createMeasurementCanvas();
        const ctx = canvas.getContext("2d");
        ctx.drawImage(this.img, 0, 0);
        const pixels = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
        this.img.collisionPixels = pixels;
        return this.findOpaqueBounds(pixels, canvas.width, canvas.height);
    }

    /**
     * Creates a temporary canvas for reading image pixels.
     */
    createMeasurementCanvas() {
        const canvas = document.createElement("canvas");
        canvas.width = this.img.naturalWidth;
        canvas.height = this.img.naturalHeight;
        return canvas;
    }

    /**
     * Finds the smallest rectangle containing visible image pixels.
     * @param {*} pixels - The pixels used by this method.
     * @param {number} width - The width of the image or hitbox.
     * @param {number} height - The height of the image or hitbox.
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
     * Expands the measured rectangle to include another visible pixel.
     * @param {*} bounds - The bounds used by this method.
     * @param {number} x - The horizontal coordinate.
     * @param {number} y - The vertical coordinate.
     */
    expandBounds(bounds, x, y) {
        bounds.left = Math.min(bounds.left, x);
        bounds.top = Math.min(bounds.top, y);
        bounds.right = Math.max(bounds.right, x + 1);
        bounds.bottom = Math.max(bounds.bottom, y + 1);
    }
}
