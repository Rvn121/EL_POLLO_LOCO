/**
 * DE: Stoppt menu music für das Spiel.
 * EN: Stops menu music for the game.
 */
function stopMenuMusic() {
    gameSounds.stopAll();
    menuMusic.pause();
    menuMusic.currentTime = 0;
}

/**
 * DE: Startet game für das Spiel.
 * EN: Starts game for the game.
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

/**
 * DE: Führt prepare game view im Spiel aus.
 * EN: Runs prepare game view in the game.
 */
function prepareGameView() {
    if (isTabletOrMobile()) requestFullscreenMode();
    window.gamePaused = true;
    world = new World(canvas, keyboard, handleGameOver, currentLevel);
    document.getElementById("pauseBtn").classList.remove("hidden");
    showLevelAnnouncement();
    updateFullscreenUi();
}

/**
 * DE: Zeigt das Übergangsbild vor dem Start des Levels.
 * EN: Shows the transition image before the level begins.
 */
function showLevelAnnouncement() {
    const image = document.getElementById("levelTransitionImage");
    const currentWorld = world;
    image.src = "img/El_Pollo_Loco_Level_2_2D.png";
    if (currentLevel === 1) image.src = "img/El_Pollo_Loco_Level_1_2D.png";
    image.classList.remove("hidden");
    showLevelGoal(currentWorld);
}

/**
 * DE: Zeigt das Spielziel kurz vor Beginn jedes Levels.
 * EN: Briefly shows the objective before each level starts.
 * @param {World} currentWorld - Das aktuelle Level / The current level.
 */
function showLevelGoal(currentWorld) {
    const announcement = document.getElementById("levelAnnouncement");
    announcement.textContent = "Defeat all chickens to reach the final boss!";
    announcement.classList.remove("hidden");
    window.setTimeout(() => {
        if (world !== currentWorld) return;
        announcement.classList.add("hidden");
        document.getElementById("levelTransitionImage").classList.add("hidden");
        world.startLevel();
        window.gamePaused = false;
    }, 2800);
}

/**
 * DE: Führt next level im Spiel aus.
 * EN: Runs next level in the game.
 */
function nextLevel() {
    currentLevel = 2;
    disposeWorld();
    startGame();
}

/**
 * DE: Führt restart game im Spiel aus.
 * EN: Runs restart game in the game.
 */
function restartGame() {
    disposeWorld();
    startGame();
}

/**
 * DE: Beendet die aktuelle Spielrunde und zeigt das Hauptmenü.
 * EN: Ends the current run and returns to the main menu.
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

/**
 * DE: Setzt menu elements für das Spiel.
 * EN: Resets menu elements for the game.
 */
function resetMenuElements() {
    document.getElementById("levelAnnouncement").classList.add("hidden");
    document.getElementById("levelTransitionImage").classList.add("hidden");
    document.getElementById("pauseBtn").classList.add("hidden");
    document.getElementById("pauseBtn").textContent = "Pause";
    closeControlsModal();
    showStartMenu();
}

/**
 * DE: Beendet world für das Spiel.
 * EN: Disposes of world for the game.
 */
function disposeWorld() {
    gameSounds.stopAll();
    if (world) world.dispose();
    world = null;
    window.gamePaused = false;
}

/**
 * DE: Zeigt nach einem Sieg oder einer Niederlage die Aktionsbuttons.
 * EN: Shows action buttons after a win or a loss.
 * @param {Object} won - DE: Wert won. EN: Value won.
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
 * DE: Zeigt restart button für das Spiel.
 * EN: Shows restart button for the game.
 */
function showRestartButton() {
    restartBtn.classList.remove("hidden");
}

/**
 * DE: Blendet restart button für das Spiel.
 * EN: Hides restart button for the game.
 */
function hideRestartButton() {
    document.getElementById("backToStartBtn").classList.add("hidden");
    document.getElementById("nextBtn").classList.add("hidden");
    restartBtn.classList.add("hidden");
}

/**
 * DE: Blendet start menu für das Spiel.
 * EN: Hides start menu for the game.
 */
function hideStartMenu() {
    levelChoices.classList.add("hidden");
    menuButtons.classList.add("hidden");
    menuButtons.classList.add("game-running");
}

/**
 * DE: Zeigt start menu für das Spiel.
 * EN: Shows start menu for the game.
 */
function showStartMenu() {
    menuSelectionOpen = false;
    levelChoices.classList.add("hidden");
    document.getElementById("startBtn").classList.remove("hidden");
    menuButtons.classList.remove("hidden");
    menuButtons.classList.remove("game-running");
}

/**
 * DE: Öffnet controls modal für das Spiel.
 * EN: Opens controls modal for the game.
 */
function openControlsModal() {
    controlsModal.classList.remove("hidden");
}

/**
 * DE: Schließt controls modal für das Spiel.
 * EN: Closes controls modal for the game.
 */
function closeControlsModal() {
    controlsModal.classList.add("hidden");
}

/**
 * DE: Verarbeitet backdrop click für das Spiel.
 * EN: Handles backdrop click for the game.
 * @param {Object} event - DE: Wert event. EN: Value event.
 */
function handleBackdropClick(event) {
    if (event.target === controlsModal) closeControlsModal();
}

/**
 * DE: Schaltet fullscreen für das Spiel.
 * EN: Toggles fullscreen for the game.
 */
function toggleFullscreen() {
    if (document.fullscreenElement) document.exitFullscreen();
    else requestFullscreenMode();
}

/**
 * DE: Führt request fullscreen mode im Spiel aus.
 * EN: Runs request fullscreen mode in the game.
 */
function requestFullscreenMode() {
    if (canvasShell.requestFullscreen) canvasShell.requestFullscreen().catch(() => {});
}

/**
 * DE: Reagiert auf das Drücken einer Taste.
 * EN: Handles key down for the game.
 * @param {Object} event - DE: Wert event. EN: Value event.
 */
function handleKeyDown(event) {
    if (event.code === "Escape" && world) return exitWithEscape(event);
    if (event.code === "Space") return handleSpaceDown(event);
    if (event.code === "KeyP" && !event.repeat) return togglePause();
    setKey(event, true);
}

/**
 * DE: Führt exit with escape im Spiel aus.
 * EN: Runs exit with escape in the game.
 */
function exitWithEscape(event) {
    event.preventDefault();
    backToStart();
}

/**
 * DE: Verarbeitet space down für das Spiel.
 * EN: Handles space down for the game.
 */
function handleSpaceDown(event) {
    event.preventDefault();
    if (!world) return openLevelSelection();
    if (!event.repeat && !world.isPaused && !world.levelIntroActive) {
        world.throwChargeStart = Date.now();
    }
}

/**
 * DE: Reagiert auf das Loslassen einer Taste.
 * EN: Handles key up for the game.
 * @param {Object} event - DE: Wert event. EN: Value event.
 */
function handleKeyUp(event) {
    if (event.code === "Space" && world && world.throwChargeStart !== null) {
        const duration = Date.now() - world.throwChargeStart;
        const power = Math.min(1, Math.max(0, duration / 900));
        world.throwChargeStart = null;
        world.throwBottle(power);
    }
    setKey(event, false);
}

/**
 * DE: Schaltet pause für das Spiel.
 * EN: Toggles pause for the game.
 */
function togglePause() {
    if (!world || world.levelIntroActive || world.isGameOver || world.isWin) return;
    const paused = world.togglePause();
    if (paused) resetTouchControls();
    window.gamePaused = paused;
    document.getElementById("pauseBtn").textContent = "Pause";
    if (paused) document.getElementById("pauseBtn").textContent = "Resume";
}

/**
 * DE: Setzt key für das Spiel.
 * EN: Sets key for the game.
 * @param {Object} event - DE: Wert event. EN: Value event.
 * @param {Object} pressed - DE: Wert pressed. EN: Value pressed.
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
 * DE: Setzt keys für das Spiel.
 * EN: Resets keys for the game.
 */
function resetKeys() {
    keyboard.LEFT = false;
    keyboard.RIGHT = false;
    keyboard.SPACE = false;
    keyboard.UP = false;
}

/**
 * DE: Aktualisiert orientation state für das Spiel.
 * EN: Updates orientation state for the game.
 */
function updateOrientationState() {
    const showNotice = isTabletOrMobile() && window.innerHeight > window.innerWidth;
    orientationOverlay.classList.toggle("hidden", !showNotice);
}

/**
 * DE: Prüft tablet or mobile für das Spiel.
 * EN: Checks tablet or mobile for the game.
 */
function isTabletOrMobile() {
    return window.innerWidth <= 1024;
}

/**
 * DE: Aktualisiert die Knöpfe für Vollbild und Normalansicht.
 * EN: Updates controls for fullscreen and windowed mode.
 */
function updateFullscreenUi() {
    const fullscreen = document.fullscreenElement === canvasShell;
    const button = document.getElementById("fullscreenBtn");
    button.textContent = "Fullscreen";
    if (fullscreen) button.textContent = "Minimize";
    menuButtons.classList.toggle("hidden", !!world);
    document.getElementById("controlsBtn").classList.remove("hidden");
    document.getElementById("toolbarBackToStartBtn").classList.toggle("hidden", !world);
    menuMuteBtn.classList.toggle("hidden", !!world);
    menuEffectsBtn.classList.toggle("hidden", !!world);
    document.getElementById("allSoundsBtn").classList.toggle("hidden", !world);
    updateAllSoundsButton();
}
