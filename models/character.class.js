class Character extends CharacterBase {
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

    /**
     * DE: Erstellt das Objekt und legt seine Anfangswerte fest.
     * EN: Creates the object and sets its initial values.
     * @param {Keyboard} keyboard - DE: keyboard. EN: keyboard.
     * @param {Level} level - DE: Wert level. EN: Value level.
     */
    constructor(keyboard, level) {
        super();
        this.loadImage(this.IMAGES_WALKING[0]);
        this.keyboard = keyboard;
        this.level = level;
        this.loadCharacterImages();
        this.startAnimationLoop();
    }

    /**
     * DE: Lädt character images für das Spiel.
     * EN: Loads character images for the game.
     */
    loadCharacterImages() {
        this.loadImages(this.IMAGES_WALKING);
        this.loadImages(this.IMAGES_JUMPING);
        this.loadImages(this.IMAGES_IDLE);
        this.loadImages([this.HURT_IMAGE]);
    }

    /**
     * DE: Startet animation loop für das Spiel.
     * EN: Starts animation loop for the game.
     */
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

    /**
     * DE: Führt should start idle im Spiel aus.
     * EN: Runs should start idle in the game.
     */
    shouldStartIdle() {
        const standingStill = !this.keyboard.LEFT && !this.keyboard.RIGHT;
        return standingStill && this.y === this.groundY && Date.now() - this.lastActivity >= 7000;
    }

    /**
     * DE: Spielt walking animation für das Spiel.
     * EN: Plays walking animation for the game.
     */
    playWalkingAnimation() {
        const path = this.IMAGES_WALKING[this.currentImage];
        this.img = this.imageCache[path];
        this.currentImage = (this.currentImage + 1) % this.IMAGES_WALKING.length;
    }
}
