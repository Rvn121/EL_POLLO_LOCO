/** Centralized sound effects, controlled by the existing Sound On/Off setting. */
class SoundManager {
    constructor() {
        this.muted = localStorage.getItem("elPolloLocoMenuMuted") === "true";
        this.sounds = {};
        this.addSound("steps", "audio/steps.mp3", 0.32, true);
        this.addSound("wind", "audio/wind.mp3", 0.26, true);
        this.addSound("chicken_background", "audio/chicken_background.mp3", 0.28, true);
        this.addSound("jump", "audio/jump.mp3", 0.55);
        this.addSound("splash", "audio/slime_splash.mp3", 0.55);
        this.addSound("hit_pepe", "audio/hit_pepe.mp3", 0.65);
        this.addSound("hit_chickens", "audio/hit_chickens.mp3", 0.65);
        this.addSound("chicken_boss", "audio/chicken_boss.mp3", 0.65);
        this.addSound("win", "audio/win.mp3", 0.75);
    }

    addSound(name, path, volume, loop = false) {
        const sound = new Audio(path);
        sound.preload = "auto";
        sound.volume = volume;
        sound.loop = loop;
        this.sounds[name] = sound;
    }

    play(name) {
        if (this.muted || !this.sounds[name]) return;
        const sound = this.sounds[name];
        if (sound.loop && !sound.paused) return;
        if (!sound.loop) sound.currentTime = 0;
        sound.play().catch(() => {});
    }

    stop(name) {
        const sound = this.sounds[name];
        if (!sound) return;
        sound.pause();
        sound.currentTime = 0;
    }

    stopAll() {
        Object.keys(this.sounds).forEach(name => this.stop(name));
    }

    setMuted(muted) {
        this.muted = muted;
        if (muted) this.stopAll();
    }
}

const gameSounds = new SoundManager();
