class Character extends MovableObject {
    speed = 4;
    otherDirection = false;
    groundY = 180;
    speedY = 0;
    jumpPressed = false;
    jumpFrame = 0;
    jumpSpeed = 15;
    gravity = 0.8;
    lastHit = 0;
    deathAnimationStarted = false;
    deathFrame = 0;

    HURT_IMAGE = "img/2_character_pepe/4_hurt/H-41.png";

    IMAGES_DEAD = [
        "img/2_character_pepe/5_dead/D-51.png",
        "img/2_character_pepe/5_dead/D-52.png",
        "img/2_character_pepe/5_dead/D-53.png",
        "img/2_character_pepe/5_dead/D-54.png",
        "img/2_character_pepe/5_dead/D-55.png",
        "img/2_character_pepe/5_dead/D-56.png"
    ];

    IMAGES_JUMPING = [
        "img/2_character_pepe/3_jump/J-31.png",
        "img/2_character_pepe/3_jump/J-32.png",
        "img/2_character_pepe/3_jump/J-33.png",
        "img/2_character_pepe/3_jump/J-34.png",
        "img/2_character_pepe/3_jump/J-35.png",
        "img/2_character_pepe/3_jump/J-36.png",
        "img/2_character_pepe/3_jump/J-37.png",
        "img/2_character_pepe/3_jump/J-38.png",
        "img/2_character_pepe/3_jump/J-39.png"
    ];

    IMAGES_WALKING = [
        "img/2_character_pepe/2_walk/W-21.png",
        "img/2_character_pepe/2_walk/W-22.png",
        "img/2_character_pepe/2_walk/W-23.png",
        "img/2_character_pepe/2_walk/W-24.png",
        "img/2_character_pepe/2_walk/W-25.png",
        "img/2_character_pepe/2_walk/W-26.png"
    ];

    constructor(keyboard, level) {
        super();
        this.loadImage(this.IMAGES_WALKING[0]);
        this.keyboard = keyboard;
        this.level = level;
        this.loadCharacterImages();
        this.animate();
    }

    loadCharacterImages() {
        this.loadImages(this.IMAGES_WALKING);
        this.loadImages(this.IMAGES_JUMPING);
        this.loadImages(this.IMAGES_DEAD);
        this.loadImages([this.HURT_IMAGE]);
    }

    animate() {
        setInterval(() => {
            if (this.energy <= 0) return;
            if (this.isHurt()) return this.showHurtImage();
            if (this.y !== this.groundY || this.keyboard.LEFT === this.keyboard.RIGHT) return;
            this.playWalkingAnimation();
        }, 100);
    }

    playWalkingAnimation() {
        const path = this.IMAGES_WALKING[this.currentImage];
        this.img = this.imageCache[path];
        this.currentImage = (this.currentImage + 1) % this.IMAGES_WALKING.length;
    }

    updateMovement() {
        if (this.energy <= 0) return;
        this.updateHorizontalMovement();
        this.updateJumpInput();
        this.applyGravity();
    }

    updateHorizontalMovement() {
        if (this.keyboard.RIGHT && !this.keyboard.LEFT) this.moveCharacterRight();
        if (this.keyboard.LEFT && !this.keyboard.RIGHT) this.moveCharacterLeft();
    }

    moveCharacterRight() {
        const maxX = this.level.level_end_x - this.width;
        this.x = Math.min(maxX, this.x + this.speed);
        this.otherDirection = false;
    }

    moveCharacterLeft() {
        const minX = this.level.level_start_x + 100;
        this.x = Math.max(minX, this.x - this.speed);
        this.otherDirection = true;
    }

    updateJumpInput() {
        const jumpKeyPressed = this.keyboard.SPACE || this.keyboard.UP;
        if (jumpKeyPressed && !this.jumpPressed) this.jump();
        this.jumpPressed = jumpKeyPressed;
    }

    applyGravity() {
        this.y -= this.speedY;
        if (this.y < this.groundY) return this.continueJump();
        this.landOnGround();
    }

    continueJump() {
        this.speedY -= this.gravity;
        if (!this.isHurt()) this.animateJump();
    }

    landOnGround() {
        if (this.jumpFrame > 0 && !this.isHurt()) this.resetWalkingImage();
        this.y = this.groundY;
        this.speedY = 0;
    }

    resetWalkingImage() {
        this.img = this.imageCache[this.IMAGES_WALKING[0]];
        this.currentImage = 0;
        this.jumpFrame = 0;
    }

    animateJump() {
        const jumpDuration = Math.ceil(2 * this.jumpSpeed / this.gravity + 1);
        const frame = Math.floor(this.jumpFrame * this.IMAGES_JUMPING.length / jumpDuration);
        const index = Math.min(frame, this.IMAGES_JUMPING.length - 1);
        this.img = this.imageCache[this.IMAGES_JUMPING[index]];
        this.jumpFrame++;
    }

    jump() {
        if (this.y !== this.groundY) return;
        this.speedY = this.jumpSpeed;
        this.jumpFrame = 0;
    }

    isAboveGround() {
        return this.y < this.groundY;
    }

    bounceFromEnemy() {
        this.speedY = this.jumpSpeed * 0.6;
        this.jumpFrame = 0;
    }

    takeDamage(damage) {
        const nextEnergy = Math.max(0, this.energy - damage);
        if (this.energy <= 0) return;
        if (nextEnergy === 0) return this.die();
        this.energy = nextEnergy;
        this.lastHit = Date.now();
        this.showHurtImage();
    }

    die() {
        this.energy = 0;
        this.startDeathAnimation();
    }

    isHurt() {
        return Date.now() - this.lastHit < 200;
    }

    showHurtImage() {
        this.img = this.imageCache[this.HURT_IMAGE];
    }

    startDeathAnimation() {
        if (this.deathAnimationStarted) return;
        this.deathAnimationStarted = true;
        this.deathFrame = 0;
        this.y = this.groundY;
        this.showNextDeathFrame();
        this.deathInterval = setInterval(() => this.showNextDeathFrame(), 150);
    }

    showNextDeathFrame() {
        if (this.deathFrame >= this.IMAGES_DEAD.length) {
            clearInterval(this.deathInterval);
            return;
        }
        this.img = this.imageCache[this.IMAGES_DEAD[this.deathFrame]];
        if (this.deathFrame >= 2) this.y += 100;
        this.deathFrame++;
    }
}
