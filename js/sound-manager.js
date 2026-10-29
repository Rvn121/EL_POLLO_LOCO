/** Controls music and sound effects independently. */
class SoundManager {
    musicNames = new Set(["gameover", "win", "L1_win", "L2_win", "lose"]);
    /**
     * Initializes this object and sets up its required game data.
     */
    constructor() {
        // Sound effects are enabled on the first visit.
        this.muted = localStorage.getItem("elPolloLocoEffectsMuted") === "true";
        // Music is muted on the first visit.
        this.musicMuted = localStorage.getItem("elPolloLocoMusicMuted") !== "false";
        this.sounds = {};
        this.pendingSequence = null;
        this.addBackgroundSounds();
        this.addActionSounds();
        this.addBossSounds();
    }

    /**
     * Registers looping footsteps, wind, chickens, and sleeping sounds.
     */
    addBackgroundSounds() {
        this.addSound("steps", "audio/steps.mp3", 0.32, true);
        this.addSound("wind", "audio/wind.mp3", 0.26, true);
        this.addSound("chicken_background", "audio/chicken_background.mp3", 0.28, true);
        this.addSound("snoring", "audio/snoring.mp3", 0.32, true);
    }

    /**
     * Registers short sounds for jumping, collecting items, and impacts.
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
     * Registers sounds played during boss fights and result screens.
     */
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

    /**
     * Creates an audio object and saves it under the supplied name.
     * @param {string} name - The identifier of the sound or game object.
     * @param {string} path - The file path of the image or audio asset.
     * @param {*} volume - Audio volume between 0 and 1.
     * @param {*} loop - Whether the sound repeats.
     */
    addSound(name, path, volume, loop = false) {
        const sound = new Audio(path);
        sound.preload = "auto";
        sound.volume = volume;
        sound.loop = loop;
        if (this.musicNames.has(name)) sound.muted = this.musicMuted;
        this.sounds[name] = sound;
    }

    /**
     * Starts the named sound if the current audio settings allow it.
     * @param {string} name - The identifier of the sound or game object.
     */
    play(name) {
        if (!this.canPlay(name)) return;
        const sound = this.sounds[name];
        if (sound.loop && !sound.paused) return;
        if (!sound.loop) sound.currentTime = 0;
        sound.play().catch(() => {});
    }

    /**
     * Plays the first sound and starts the next sound when it ends.
     * @param {number} first - The first sound or frame in the sequence.
     * @param {*} next - The sound or frame played next.
     */
    playSequence(first, next) {
        this.cancelSequence();
        if (!this.sounds[first] || !this.sounds[next]) return;
        if (!this.canPlay(first)) return this.play(next);
        const sound = this.sounds[first];
        const onEnded = () => {
            this.cancelSequence();
            this.play(next);
        };
        this.pendingSequence = { name: first, sound, onEnded };
        sound.addEventListener("ended", onEnded, { once: true });
        this.play(first);
    }

    /**
     * Removes the event handler for a scheduled sound sequence.
     */
    cancelSequence() {
        if (!this.pendingSequence) return;
        const { sound, onEnded } = this.pendingSequence;
        sound.removeEventListener("ended", onEnded);
        this.pendingSequence = null;
    }

/**
 * Pauses the named sound and resets it to the beginning.
 * @param {string} name - The identifier of the sound or game object.
 */
stop(name) {
        if (this.pendingSequence && this.pendingSequence.name === name) this.cancelSequence();
        const sound = this.sounds[name];
        if (!sound) return;
        sound.pause();
        sound.currentTime = 0;
    }

    /**
     * Stops every registered game sound.
     */
    stopAll() {
        this.cancelSequence();
        for (const name in this.sounds) {
            this.stop(name);
        }
    }

    /**
     * Enables or disables sound effects without changing music mute settings.
     * @param {boolean} muted - Whether audio should be muted.
     */
    setMuted(muted) {
        this.muted = muted;
        if (muted) {
            for (const name in this.sounds) {
                if (!this.musicNames.has(name)) this.stop(name);
            }
        }
    }

    /**
     * Checks whether a sound exists and is allowed by the mute settings.
     * @param {string} name - The identifier of the sound or game object.
     * @returns {boolean} The result of can play().
     */
    canPlay(name) {
        return !!this.sounds[name] && (this.musicNames.has(name) || !this.muted);
    }

    /**
     * Mutes or unmutes registered music tracks.
     * @param {boolean} muted - Whether audio should be muted.
     */
    setMusicMuted(muted) {
        this.musicMuted = muted;
        this.musicNames.forEach(name => { this.sounds[name].muted = muted; });
    }
}

const gameSounds = new SoundManager();
