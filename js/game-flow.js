/**
 * DE: Stoppt menu music.
 * EN: Stops menu music.
 */
function stopMenuMusic() {
    gameSounds.stopAll();
    menuMusic.pause();
    menuMusic.currentTime = 0;
}

/**
 * DE: Startet das gewählte Level.
 * EN: Start game.
 */
function startGame() {
    if (world) return;
    stopMenuMusic();
    titleActive = false;
    cancelAnimationFrame(titleLoopId);
    resetTouchControls();
    hideStartMenu();
    hideRestartButton();
    prepareGameView();
}

/** DE: Bereitet die Levelansicht vor. EN: Prepares the level view. */
function prepareGameView() {
    if (isTabletOrMobile()) requestFullscreenMode();
    window.gamePaused = true;
    world = new World(canvas, keyboard, handleGameOver, currentLevel);
    document.getElementById("pauseBtn").classList.remove("hidden");
    showLevelAnnouncement();
    updateFullscreenUi();
}

/**
 * DE: Zeigt level announcement.
 * EN: Shows level announcement.
 */
function showLevelAnnouncement() {
    const announcement = document.getElementById("levelAnnouncement");
    const image = document.getElementById("levelTransitionImage");
    const currentWorld = world;
    announcement.classList.add("hidden");
    image.src = currentLevel === 1 ? "img/El_Pollo_Loco_Level_1_2D.png" : "img/El_Pollo_Loco_Level_2_2D.png";
    image.classList.remove("hidden");
    window.setTimeout(() => {
        if (world !== currentWorld) return;
        image.classList.add("hidden");
        world.startLevel();
        window.gamePaused = false;
    }, 1000);
}

/**
 * DE: Führt next level aus.
 * EN: Next level.
 */
function nextLevel() {
    currentLevel = 2;
    disposeWorld();
    startGame();
}

/**
 * DE: Startet das aktuelle Level erneut.
 * EN: Restart game.
 */
function restartGame() {
    disposeWorld();
    startGame();
}

/**
 * DE: Kehrt zum Hauptmenü zurück.
 * EN: Back to start.
 */
function backToStart() {
    disposeWorld();
    currentLevel = 1;
    resetTouchControls();
    hideRestartButton();
    resetMenuElements();
    initTitleClouds();
    titleActive = true;
    startTitleScreen();
    updateFullscreenUi();
    playMenuMusic();
}

/** DE: Setzt die Menüelemente zurück. EN: Resets menu elements. */
function resetMenuElements() {
    document.getElementById("levelAnnouncement").classList.add("hidden");
    document.getElementById("levelTransitionImage").classList.add("hidden");
    document.getElementById("pauseBtn").classList.add("hidden");
    document.getElementById("pauseBtn").textContent = "Pause";
    closeControlsModal();
    showStartMenu();
}

/**
 * DE: Beendet und räumt auf world.
 * EN: Disposes of world.
 */
function disposeWorld() {
    gameSounds.stopAll();
    if (world) world.dispose();
    world = null;
    window.gamePaused = false;
}

/**
 * DE: Verarbeitet game over.
 * EN: Handles game over.
 * @param {Object} won - DE: Übergabewert won. EN: Argument won.
 */
function handleGameOver(won = false) {
    window.gamePaused = false;
    const finishedWorld = world;
    window.setTimeout(() => {
        if (world !== finishedWorld) return;
        if (won && currentLevel === 1) document.getElementById("nextBtn").classList.remove("hidden");
        showRestartButton();
        document.getElementById("backToStartBtn").classList.remove("hidden");
    }, 2000);
}

/**
 * DE: Zeigt restart button.
 * EN: Shows restart button.
 */
function showRestartButton() {
    restartBtn.classList.remove("hidden");
}

/**
 * DE: Blendet aus restart button.
 * EN: Hides restart button.
 */
function hideRestartButton() {
    document.getElementById("backToStartBtn").classList.add("hidden");
    document.getElementById("nextBtn").classList.add("hidden");
    restartBtn.classList.add("hidden");
}

/**
 * DE: Blendet aus start menu.
 * EN: Hides start menu.
 */
function hideStartMenu() {
    levelChoices.classList.add("hidden");
    menuButtons.classList.add("hidden");
    menuButtons.classList.add("game-running");
}

/**
 * DE: Zeigt start menu.
 * EN: Shows start menu.
 */
function showStartMenu() {
    menuSelectionOpen = false;
    levelChoices.classList.add("hidden");
    document.getElementById("startBtn").classList.remove("hidden");
    menuButtons.classList.remove("hidden");
    menuButtons.classList.remove("game-running");
}

/**
 * DE: Öffnet controls modal.
 * EN: Opens controls modal.
 */
function openControlsModal() {
    controlsModal.classList.remove("hidden");
}

/**
 * DE: Schließt controls modal.
 * EN: Closes controls modal.
 */
function closeControlsModal() {
    controlsModal.classList.add("hidden");
}

/**
 * DE: Verarbeitet backdrop click.
 * EN: Handles backdrop click.
 * @param {Object} event - DE: Übergabewert event. EN: Argument event.
 */
function handleBackdropClick(event) {
    if (event.target === controlsModal) closeControlsModal();
}

/**
 * DE: Schaltet um fullscreen.
 * EN: Toggles fullscreen.
 */
function toggleFullscreen() {
    if (document.fullscreenElement) document.exitFullscreen();
    else requestFullscreenMode();
}

/**
 * DE: Führt request fullscreen mode aus.
 * EN: Request fullscreen mode.
 */
function requestFullscreenMode() {
    if (canvasShell.requestFullscreen) canvasShell.requestFullscreen().catch(() => {});
}

/**
 * DE: Verarbeitet key down.
 * EN: Handles key down.
 * @param {Object} event - DE: Übergabewert event. EN: Argument event.
 */
function handleKeyDown(event) {
    if (event.code === "Escape" && world) return exitWithEscape(event);
    if (event.code === "Space") return handleSpaceDown(event);
    if (event.code === "KeyP" && !event.repeat) return togglePause();
    setKey(event, true);
}

/** DE: Verlässt das Level mit Escape. EN: Exits the level with Escape. */
function exitWithEscape(event) {
    event.preventDefault();
    backToStart();
}

/** DE: Behandelt die Leertaste im Menü und im Spiel. EN: Handles Space input. */
function handleSpaceDown(event) {
    event.preventDefault();
    if (!world) return openLevelSelection();
    if (!event.repeat && !world.isPaused && !world.levelIntroActive) {
        world.throwChargeStart = performance.now();
    }
}

/**
 * DE: Verarbeitet key up.
 * EN: Handles key up.
 * @param {Object} event - DE: Übergabewert event. EN: Argument event.
 */
function handleKeyUp(event) {
    if (event.code === "Space" && world?.throwChargeStart !== null && world) {
        const duration = performance.now() - world.throwChargeStart;
        const power = Math.min(1, Math.max(0, duration / 900));
        world.throwChargeStart = null;
        world.throwBottle(power);
    }
    setKey(event, false);
}

/**
 * DE: Pausiert das Spiel oder setzt es fort.
 * EN: Toggle pause.
 */
function togglePause() {
    if (!world || world.levelIntroActive || world.isGameOver || world.isWin) return;
    const paused = world.togglePause();
    if (paused) resetTouchControls();
    window.gamePaused = paused;
    document.getElementById("pauseBtn").textContent = paused ? "Resume" : "Pause";
}

/**
 * DE: Setzt key.
 * EN: Sets key.
 * @param {Object} event - DE: Übergabewert event. EN: Argument event.
 * @param {Object} pressed - DE: Übergabewert pressed. EN: Argument pressed.
 */
function setKey(event, pressed) {
    const keys = {
        ArrowLeft: "LEFT",
        ArrowRight: "RIGHT",
        ArrowUp: "UP",
        Space: "SPACE"
    };
    const key = keys[event.code];
    if (!key || !world) return;
    event.preventDefault();
    keyboard[key] = pressed;
}

/**
 * DE: Setzt zurück keys.
 * EN: Resets keys.
 */
function resetKeys() {
    keyboard.LEFT = false;
    keyboard.RIGHT = false;
    keyboard.SPACE = false;
    keyboard.UP = false;
}

/**
 * DE: Aktualisiert orientation state.
 * EN: Updates orientation state.
 */
function updateOrientationState() {
    const showNotice = isTabletOrMobile() && window.innerHeight > window.innerWidth;
    orientationOverlay.classList.toggle("hidden", !showNotice);
}

/**
 * DE: Prüft, ob tablet or mobile zutrifft.
 * EN: Checks whether tablet or mobile is true.
 */
function isTabletOrMobile() {
    return window.innerWidth <= 1024;
}

/**
 * DE: Aktualisiert fullscreen ui.
 * EN: Updates fullscreen ui.
 */
function updateFullscreenUi() {
    const fullscreen = document.fullscreenElement === canvasShell;
    const button = document.getElementById("fullscreenBtn");
    button.textContent = fullscreen ? "Minimize" : "Fullscreen";
    menuButtons.classList.toggle("hidden", !!world);
    document.getElementById("controlsBtn").classList.remove("hidden");
    menuMuteBtn.classList.toggle("hidden", !!world);
    menuEffectsBtn.classList.toggle("hidden", !!world);
    document.getElementById("allSoundsBtn").classList.toggle("hidden", !world);
    updateAllSoundsButton();
}
