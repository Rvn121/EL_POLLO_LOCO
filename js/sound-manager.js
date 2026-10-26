/** Centralized sound effects, controlled by the existing Sound On/Off setting. */
class SoundManager {
    /**
     * DE: Erstellt das Objekt und legt seine Anfangswerte fest.
     * EN: Creates the object and sets its initial values.
     */
    constructor() {
        this.muted = localStorage.getItem("elPolloLocoEffectsMuted") === "true";
        this.sounds = {};
        this.addBackgroundSounds();
        this.addActionSounds();
        this.addBossSounds();
    }

    /**
     * DE: Fügt background sounds für das Spiel.
     * EN: Adds background sounds for the game.
     */
    addBackgroundSounds() {
        this.addSound("steps", "audio/steps.mp3", 0.32, true);
        this.addSound("wind", "audio/wind.mp3", 0.26, true);
        this.addSound("chicken_background", "audio/chicken_background.mp3", 0.28, true);
        this.addSound("snoring", "audio/snoring.mp3", 0.32, true);
    }

    /**
     * DE: Fügt action sounds für das Spiel.
     * EN: Adds action sounds for the game.
     */
    addActionSounds() {
        this.addSound("jump", "audio/jump.mp3", 0.55);
        this.addSound("splash", "audio/slime_splash.mp3", 0.55);
        this.addSound("hit_pepe", "audio/scream.mp3", 0.65);
        this.addSound("drop_coin", "audio/drop_coin.mp3", 0.55);
        this.addSound("bottlecollect", "audio/bottlecollect.mp3", 0.55);
        this.addSound("hit_chickens", "audio/hit_chickens.mp3", 0.65);
    }

    /**
     * DE: Fügt boss sounds für das Spiel.
     * EN: Adds boss sounds for the game.
     */
    addBossSounds() {
        this.addSound("miniboss_llive", "audio/miniboss_llive.mp3", 0.50);
        this.addSound("miniboss_dead", "audio/miniboss_dead.mp3", 0.65);
        this.addSound("gameover", "audio/gameover.mp3", 0.65);
        this.addSound("chicken_boss", "audio/chicken_boss.mp3", 0.65, true);
        this.addSound("win", "audio/win.mp3", 0.75);
        this.addSound("boss_hit", "audio/hit.mp3", 0.65);
    }

    /**
     * DE: Fügt sound für das Spiel.
     * EN: Adds sound for the game.
     * @param {string} name - DE: Wert name. EN: Value name.
     * @param {string} path - DE: Wert path. EN: Value path.
     * @param {Object} volume - DE: Wert volume. EN: Value volume.
     * @param {Object} loop - DE: Wert loop. EN: Value loop.
     */
    addSound(name, path, volume, loop = false) {
        const sound = new Audio(path);
        sound.preload = "auto";
        sound.volume = volume;
        sound.loop = loop;
        this.sounds[name] = sound;
    }

    /**
     * DE: Führt play im Spiel aus.
     * EN: Runs play in the game.
     * @param {string} name - DE: Wert name. EN: Value name.
     */
    play(name) {
        if (this.muted || !this.sounds[name]) return;
        const sound = this.sounds[name];
        if (sound.loop && !sound.paused) return;
        if (!sound.loop) sound.currentTime = 0;
        sound.play().catch(() => {});
    }

    /**
     * DE: Führt stop im Spiel aus.
     * EN: Runs stop in the game.
     * @param {string} name - DE: Wert name. EN: Value name.
     */
    stop(name) {
        const sound = this.sounds[name];
        if (!sound) return;
        sound.pause();
        sound.currentTime = 0;
    }

    /**
     * DE: Stoppt all für das Spiel.
     * EN: Stops all for the game.
     */
    stopAll() {
        Object.keys(this.sounds).forEach(name => this.stop(name));
    }

    /**
     * DE: Setzt muted für das Spiel.
     * EN: Sets muted for the game.
     * @param {Object} muted - DE: Wert muted. EN: Value muted.
     */
    setMuted(muted) {
        this.muted = muted;
        if (muted) this.stopAll();
    }
}

const gameSounds = new SoundManager();
