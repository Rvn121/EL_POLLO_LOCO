/** Keeps hover and keyboard hints inside the canvas at every screen size. */
let currentTooltipControl = null;

/**
 * Updates music playback when the game is paused or resumed.
 * @returns {*} The result of update pause music().
 */
function updatePauseMusic() {
    const pausedLevel = world && world.isPaused && !world.levelIntroActive && !world.isWin && !world.isGameOver;
    if (!pausedLevel) return stopPauseMusic();
    pauseMusic.muted = menuMuted;
    if (pauseMusic.paused) pauseMusic.play().catch(() => {});
}

/**
 * Stops music associated with the paused game.
 */
function stopPauseMusic() {
    pauseMusic.pause();
    pauseMusic.currentTime = 0;
}


/**
 * Shows the music button only in the appropriate game screens.
 */
function updateMusicButtonVisibility() {
    if (!menuMuteBtn) return;
    const show = !world || world.isPaused || world.isWin || world.isGameOver;
    menuMuteBtn.classList.toggle("music-hidden", !show);
}

/**
 * Shows or hides the paused message over the game canvas.
 */
function updatePauseOverlay() {
    const overlay = document.getElementById("pausedOverlay");
    if (!overlay) return;
    const paused = world && world.isPaused && !world.levelIntroActive;
    const active = paused && !world.isGameOver && !world.isWin;
    overlay.classList.toggle("hidden", !active);
}
