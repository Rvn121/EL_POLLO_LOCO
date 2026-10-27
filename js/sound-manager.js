/** Centralized sound effects, controlled by the existing Sound On/Off setting. */
class SoundManager {
    /** DE: Erstellt das Objekt und setzt seine Startwerte. EN: Creates the object and sets its initial values. */
    constructor() {
        this.muted = localStorage.getItem("elPolloLocoEffectsMuted") === "true";
        this.sounds = {};
        this.pendingSequence = null;
        this.addBackgroundSounds();
        this.addActionSounds();
        this.addBossSounds();
    }

    /** DE: Fügt hinzu Hintergrund Geräusche. EN: Adds background sounds. */
    addBackgroundSounds() {
        this.addSound("steps", "audio/steps.mp3", 0.32, true);
        this.addSound("wind", "audio/wind.mp3", 0.26, true);
        this.addSound("chicken_background", "audio/chicken_background.mp3", 0.28, true);
        this.addSound("snoring", "audio/snoring.mp3", 0.32, true);
    }

    /** DE: Fügt hinzu action Geräusche. EN: Adds action sounds. */
    addActionSounds() {
        this.addSound("jump", "audio/jump.mp3", 0.55);
        this.addSound("splash", "audio/slime_splash.mp3", 0.55);
        this.addSound("hit_pepe", "audio/scream.mp3", 0.65);
        this.addSound("drop_coin", "audio/drop_coin.mp3", 0.55);
        this.addSound("bottlecollect", "audio/bottlecollect.mp3", 0.55);
        this.addSound("hit_chickens", "audio/hit_chickens.mp3", 0.65);
    }

    /** DE: Fügt hinzu Boss Geräusche. EN: Adds boss sounds. */
    addBossSounds() {
        this.addSound("miniboss_llive", "audio/miniboss_llive.mp3", 0.50);
        this.addSound("miniboss_dead", "audio/miniboss_dead.mp3", 0.65);
        this.addSound("gameover", "audio/gameover.mp3", 0.65);
        this.addSound("chicken_boss", "audio/chicken_boss.mp3", 0.65, true);
        this.addSound("win", "audio/win.mp3", 0.75);
        this.addSound("L1_win", "audio/L1_win.mp3", 0.75);
        this.addSound("L2_win", "audio/L2_win.mp3", 0.75);
        this.addSound("lose", "audio/lose.mp3", 0.75);
        this.addSound("boss_hit", "audio/hit.mp3", 0.65);
    }

    /** DE: Fügt hinzu Geräusch. EN: Adds sound.
 * @param {string} name - DE: Parameter name. EN: name parameter.
 * @param {string} path - DE: Parameter path. EN: path parameter.
 * @param {*} volume - DE: Parameter volume. EN: volume parameter.
 * @param {*} [loop] - DE: Parameter loop. EN: loop parameter.
 */
    addSound(name, path, volume, loop = false) {
        const sound = new Audio(path);
        sound.preload = "auto";
        sound.volume = volume;
        sound.loop = loop;
        this.sounds[name] = sound;
    }

    /** DE: Spielt play. EN: Plays play.
 * @param {string} name - DE: Parameter name. EN: name parameter.
 */
    play(name) {
        if (this.muted || !this.sounds[name]) return;
        const sound = this.sounds[name];
        if (sound.loop && !sound.paused) return;
        if (!sound.loop) sound.currentTime = 0;
        sound.play().catch(() => {});
    }

    /** DE: Spielt sequence. EN: Plays sequence.
 * @param {number} first - DE: Parameter first. EN: first parameter.
 * @param {*} next - DE: Parameter next. EN: next parameter.
 */
    playSequence(first, next) {
        this.cancelSequence();
        if (this.muted || !this.sounds[first] || !this.sounds[next]) return;
        const sound = this.sounds[first];
        const onEnded = () => {
            this.cancelSequence();
            this.play(next);
        };
        this.pendingSequence = { name: first, sound, onEnded };
        sound.addEventListener("ended", onEnded, { once: true });
        this.play(first);
    }

    /** DE: Verarbeitet sequence. EN: Handles sequence. */
    cancelSequence() {
        if (!this.pendingSequence) return;
        const { sound, onEnded } = this.pendingSequence;
        sound.removeEventListener("ended", onEnded);
        this.pendingSequence = null;
    }

    /** DE: Stoppt stop. EN: Stops stop.
 * @param {string} name - DE: Parameter name. EN: name parameter.
 */
stop(name) {
        if (this.pendingSequence && this.pendingSequence.name === name) this.cancelSequence();
        const sound = this.sounds[name];
        if (!sound) return;
        sound.pause();
        sound.currentTime = 0;
    }

    /** DE: Stoppt alle. EN: Stops all. */
    stopAll() {
        this.cancelSequence();
        for (const name in this.sounds) {
            this.stop(name);
        }
    }

    /** DE: Setzt muted. EN: Sets muted.
 * @param {boolean} muted - DE: Parameter muted. EN: muted parameter.
 */
    setMuted(muted) {
        this.muted = muted;
        if (muted) this.stopAll();
    }
}

const gameSounds = new SoundManager();
