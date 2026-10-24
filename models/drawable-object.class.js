class DrawableObject {
    x = 20;
    y = 180;
    img;
    height = 250;
    width = 200;
    imageCache = {};
    currentImage = 0;
    imageBounds = new WeakMap();

    loadImage(path) {
        this.img = new Image();
        this.img.src = path;
    }

    loadImages(images) {
        images.forEach(path => {
            const img = new Image();
            img.src = path;
            this.imageCache[path] = img;
        });
    }

    getHitbox() {
        if (!this.img || !this.img.complete || !this.img.naturalWidth) return null;
        if (!this.imageBounds.has(this.img)) this.cacheImageBounds();
        const bounds = this.imageBounds.get(this.img);
        if (!bounds) return null;
        return this.scaleHitbox(bounds);
    }

    cacheImageBounds() {
        this.imageBounds.set(this.img, this.measureImageBounds());
    }

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

    measureImageBounds() {
        const canvas = this.createMeasurementCanvas();
        const ctx = canvas.getContext("2d");
        ctx.drawImage(this.img, 0, 0);
        const pixels = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
        return this.findOpaqueBounds(pixels, canvas.width, canvas.height);
    }

    createMeasurementCanvas() {
        const canvas = document.createElement("canvas");
        canvas.width = this.img.naturalWidth;
        canvas.height = this.img.naturalHeight;
        return canvas;
    }

    findOpaqueBounds(pixels, width, height) {
        const bounds = { left: width, top: height, right: 0, bottom: 0 };
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                if (pixels[(y * width + x) * 4 + 3] > 0) this.expandBounds(bounds, x, y);
            }
        }
        return bounds.right > bounds.left ? bounds : null;
    }

    expandBounds(bounds, x, y) {
        bounds.left = Math.min(bounds.left, x);
        bounds.top = Math.min(bounds.top, y);
        bounds.right = Math.max(bounds.right, x + 1);
        bounds.bottom = Math.max(bounds.bottom, y + 1);
    }
}
