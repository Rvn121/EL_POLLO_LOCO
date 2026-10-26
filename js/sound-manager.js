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
 * DE: Fügt hinzu: Hintergrund Töne.
 * EN: Adds: background sounds.
 */
    addBackgroundSounds() {
        this.addSound("steps", "audio/steps.mp3", 0.32, true);
        this.addSound("wind", "audio/wind.mp3", 0.26, true);
        this.addSound("chicken_background", "audio/chicken_background.mp3", 0.28, true);
        this.addSound("snoring", "audio/snoring.mp3", 0.32, true);
    }

    /**
 * DE: Fügt hinzu: action Töne.
 * EN: Adds: action sounds.
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
 * DE: Fügt hinzu: Boss Töne.
 * EN: Adds: boss sounds.
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
 * DE: Fügt hinzu: Ton.
 * EN: Adds: sound.
 * @param {string} name - DE: Eingabewert. EN: Input value.
 * @param {string} path - DE: Eingabewert. EN: Input value.
 * @param {Object} volume - DE: Eingabewert. EN: Input value.
 * @param {Object} loop - DE: Eingabewert. EN: Input value.
 */
    addSound(name, path, volume, loop = false) {
        const sound = new Audio(path);
        sound.preload = "auto";
        sound.volume = volume;
        sound.loop = loop;
        this.sounds[name] = sound;
    }

    /**
 * DE: Spielt.
 * EN: Plays.
 * @param {string} name - DE: Eingabewert. EN: Input value.
 */
    play(name) {
        if (this.muted || !this.sounds[name]) return;
        const sound = this.sounds[name];
        if (sound.loop && !sound.paused) return;
        if (!sound.loop) sound.currentTime = 0;
        sound.play().catch(() => {});
    }

    /**
 * DE: Stoppt.
 * EN: Stops.
 * @param {string} name - DE: Eingabewert. EN: Input value.
 */
    stop(name) {
        const sound = this.sounds[name];
        if (!sound) return;
        sound.pause();
        sound.currentTime = 0;
    }

    /**
 * DE: Stoppt all.
 * EN: Stops all.
 */
    stopAll() {
        for (const name in this.sounds) {
            this.stop(name);
        }
    }

    /**
 * DE: Setzt muted.
 * EN: Sets muted.
 * @param {Object} muted - DE: Eingabewert. EN: Input value.
 */
    setMuted(muted) {
        this.muted = muted;
        if (muted) this.stopAll();
    }
}

const gameSounds = new SoundManager();
