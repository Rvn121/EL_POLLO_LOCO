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
    lastActivity = Date.now();
    idleStarted = false;
    idleFrame = 0;

    HURT_IMAGE = "img/2_character_pepe/4_hurt/H-41.png";

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

    IMAGES_IDLE = [
        "img/2_character_pepe/1_idle/idle/I-1.png",
        "img/2_character_pepe/1_idle/idle/I-2.png",
        "img/2_character_pepe/1_idle/idle/I-3.png",
        "img/2_character_pepe/1_idle/idle/I-4.png",
        "img/2_character_pepe/1_idle/idle/I-5.png",
        "img/2_character_pepe/1_idle/idle/I-6.png",
        "img/2_character_pepe/1_idle/idle/I-7.png",
        "img/2_character_pepe/1_idle/idle/I-8.png",
        "img/2_character_pepe/1_idle/idle/I-9.png",
        "img/2_character_pepe/1_idle/idle/I-10.png",
        "img/2_character_pepe/1_idle/long_idle/I-11.png",
        "img/2_character_pepe/1_idle/long_idle/I-12.png",
        "img/2_character_pepe/1_idle/long_idle/I-13.png",
        "img/2_character_pepe/1_idle/long_idle/I-14.png",
        "img/2_character_pepe/1_idle/long_idle/I-15.png",
        "img/2_character_pepe/1_idle/long_idle/I-16.png",
        "img/2_character_pepe/1_idle/long_idle/I-17.png",
        "img/2_character_pepe/1_idle/long_idle/I-18.png",
        "img/2_character_pepe/1_idle/long_idle/I-19.png",
        "img/2_character_pepe/1_idle/long_idle/I-20.png"
    ];

    IDLE_LOOP_IMAGES = [
        "img/2_character_pepe/1_idle/long_idle/I-11.png",
        "img/2_character_pepe/1_idle/long_idle/I-12.png",
        "img/2_character_pepe/1_idle/long_idle/I-13.png"
    ];

    constructor(keyboard, level) {
        super();
        this.loadImage(this.IMAGES_WALKING[0]);
        this.keyboard = keyboard;
        this.level = level;
        this.loadCharacterImages();
        this.startAnimationLoop();
    }

    loadCharacterImages() {
        this.loadImages(this.IMAGES_WALKING);
        this.loadImages(this.IMAGES_JUMPING);
        this.loadImages(this.IMAGES_IDLE);
        this.loadImages([this.HURT_IMAGE]);
    }

    startAnimationLoop() {
        this.animationInterval = setInterval(() => {
            if (window.gamePaused) return;
            if (this.energy <= 0 || this.idleStarted) return;
            if (this.isHurt()) return;
            if (this.shouldStartIdle()) return this.startIdleAnimation();
            if (this.y !== this.groundY || this.keyboard.LEFT === this.keyboard.RIGHT) return;
            this.playWalkingAnimation();
        }, 100);
    }

    shouldStartIdle() {
        const standingStill = !this.keyboard.LEFT && !this.keyboard.RIGHT;
        return standingStill && this.y === this.groundY && Date.now() - this.lastActivity >= 7000;
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
        this.markActivity();
    }

    moveCharacterLeft() {
        const minX = this.level.level_start_x + 100;
        this.x = Math.max(minX, this.x - this.speed);
        this.otherDirection = true;
        this.markActivity();
    }

    updateJumpInput() {
        const jumpKeyPressed = this.keyboard.UP;
        if (jumpKeyPressed && !this.jumpPressed) this.jump();
        this.jumpPressed = jumpKeyPressed;
    }

    /** Checks the previous landing trajectory so stomps cannot become side hits. */
    jumpStartedAboveEnemy(enemy) {
        const target = enemy.getHitbox();
        if (!target) return false;
        const previousFeet = this.previousFeet ?? this.getHitbox()?.y;
        return previousFeet <= target.y + 12;
    }

    isDescendingOnto(enemy) {
        const box = this.getHitbox();
        const target = enemy.getHitbox();
        if (!box || !target || this.speedY >= 0) return false;
        return this.jumpStartedAboveEnemy(enemy) || box.y < target.y;
    }

    applyGravity() {
        const box = this.getHitbox();
        this.previousFeet = box ? box.y + box.height : this.y + this.height;
        this.y -= this.speedY;
        if (this.y < this.groundY) return this.continueJump();
        this.landOnGround();
    }

    continueJump() {
        this.speedY -= this.gravity;
        this.animateJump();
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
        const duration = Math.ceil(2 * this.jumpSpeed / this.gravity + 1);
        const frame = Math.floor(this.jumpFrame * this.IMAGES_JUMPING.length / duration);
        const index = Math.min(frame, this.IMAGES_JUMPING.length - 1);
        this.img = this.imageCache[this.IMAGES_JUMPING[index]];
        this.jumpFrame++;
    }

    jump() {
        if (this.y !== this.groundY) return;
        this.speedY = this.jumpSpeed;
        this.jumpFrame = 0;
        gameSounds.stop("steps");
        gameSounds.play("jump");
        this.markActivity();
    }

    bounceFromEnemy() {
        this.speedY = this.jumpSpeed * 0.6;
        this.jumpFrame = 0;
        this.markActivity();
    }

    takeDamage(damage) {
        const nextEnergy = Math.max(0, this.energy - damage);
        if (this.energy <= 0) return;
        gameSounds.play("hit_pepe");
        if (nextEnergy === 0) return this.die();
        this.energy = nextEnergy;
        this.lastHit = Date.now();
        this.markActivity();
        this.showHurtImage();
    }

    die() {
        this.energy = 0;
        this.clearTimers();
        this.startDeathAnimation();
    }

    /** Plays all six death sprites before showing Game Over. */
    startDeathAnimation() {
        this.deathImages = [51,52,53,54,55,56].map(n =>
            `img/2_character_pepe/5_dead/D-${n}.png`);
        this.loadImages(this.deathImages);
        this.deathIndex = 0;
        this.img = this.imageCache[this.deathImages[0]];
        this.deathInterval = setInterval(() => this.showNextDeathFrame(), 170);
    }

    showNextDeathFrame() {
        if (++this.deathIndex >= this.deathImages.length) {
            clearInterval(this.deathInterval);
            this.deathFinished = true;
            return;
        }
        this.img = this.imageCache[this.deathImages[this.deathIndex]];
        if (this.deathIndex >= 2) this.y += 90;
    }

    isHurt() {
        return Date.now() - this.lastHit < 270;
    }

    showHurtImage() {
        clearTimeout(this.hurtTimeout);
        this.img = this.imageCache[this.HURT_IMAGE];
        this.hurtTimeout = setTimeout(() => {
            this.lastHit = 0;
            this.img = this.imageCache[this.IMAGES_WALKING[0]];
        }, 270);
    }

    showStandingImage() {
        if (this.energy <= 0 || this.idleStarted || this.y !== this.groundY) return;
        this.img = this.imageCache[this.IMAGES_WALKING[0]];
    }

    markActivity() {
        this.lastActivity = Date.now();
        if (this.idleStarted) this.stopIdleAnimation();
    }

    startIdleAnimation() {
        if (this.idleStarted) return;
        this.idleStarted = true;
        this.idleFrame = 0;
        this.idleInterval = setInterval(() => {
            if (!window.gamePaused) this.showNextIdleFrame();
        }, 500);
    }

    showNextIdleFrame() {
        const path = this.resolveIdleImage();
        this.img = this.imageCache[path];
        this.idleFrame++;
    }

    resolveIdleImage() {
        if (this.idleFrame < this.IMAGES_IDLE.length) return this.IMAGES_IDLE[this.idleFrame];
        const loopIndex = (this.idleFrame - this.IMAGES_IDLE.length) % this.IDLE_LOOP_IMAGES.length;
        return this.IMAGES_IDLE[10 + (this.idleFrame - this.IMAGES_IDLE.length) % 10];
    }

    stopIdleAnimation() {
        this.idleStarted = false;
        this.idleFrame = 0;
        clearInterval(this.idleInterval);
        this.showStandingImage();
    }

    clearTimers() {
        super.clearTimers();
        this.stopIdleAnimation();
    }
}
