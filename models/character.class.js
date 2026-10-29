class Character extends CharacterBase {
    speed = 4;
    otherDirection = false;
    groundY = 180;
    speedY = 0;
    jumpPressed = false;
    jumpFrame = 0;
    landingFrames = 0;
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

    /**
     * Initializes this object and sets up its required game data.
     * @param {*} keyboard - The keyboard input state.
     * @param {*} level - The level used by this object.
     */
    constructor(keyboard, level) {
        super();
        this.loadImage(this.IMAGES_IDLE[0]);
        this.keyboard = keyboard;
        this.level = level;
        this.loadCharacterImages();
        this.startIdleAnimation();
        this.startAnimationLoop();
    }

    /**
     * Performs the load character images operation for this game object.
     */
    loadCharacterImages() {
        this.loadImages(this.IMAGES_WALKING);
        this.loadImages(this.IMAGES_JUMPING);
        this.loadImages(this.IMAGES_IDLE);
        this.loadImages(this.createDeathImages());
        this.loadImages([this.HURT_IMAGE]);
    }

    /**
     * Performs the start animation loop operation for this game object.
     */
    startAnimationLoop() {
        this.animationInterval = setInterval(() => {
            if (window.gamePaused) return;
            if (this.energy <= 0) return;
            if (this.landingFrames > 0) return;
            if (this.isHurt()) return;
            if (this.shouldStartIdle()) return this.startIdleAnimation();
            if (this.y !== this.groundY || this.keyboard.LEFT === this.keyboard.RIGHT) return;
            this.playWalkingAnimation();
        }, 100);
    }

    /**
     * Performs the should start idle operation for this game object.
     */
    shouldStartIdle() {
        const standingStill = this.keyboard.LEFT === this.keyboard.RIGHT;
        return standingStill && this.y === this.groundY;
    }

    /**
     * Performs the play walking animation operation for this game object.
     */
    playWalkingAnimation() {
        const path = this.IMAGES_WALKING[this.currentImage];
        this.img = this.imageCache[path];
        this.currentImage = (this.currentImage + 1) % this.IMAGES_WALKING.length;
    }
}
