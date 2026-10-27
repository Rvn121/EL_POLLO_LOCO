/** DE: Stoppt Menü Musik. EN: Stops menu music. */
function stopMenuMusic() {
    gameSounds.stopAll();
    menuMusic.pause();
    menuMusic.currentTime = 0;
}

/** DE: Startet Spiel. EN: Starts game. */
function startGame() {
    if (world) return;
    setTouchMenuOpen(false, false);
    stopMenuMusic();
    titleActive = false;
    cancelAnimationFrame(titleLoopId);
    resetTouchControls();
    hideStartMenu();
    hideRestartButton();
    prepareGameView();
}

/** DE: Führt prepare game view im Spiel aus. EN: Runs prepare game view in the game. */
function prepareGameView() {
    if (isTabletOrMobile()) requestFullscreenMode();
    window.gamePaused = true;
    world = new World(canvas, keyboard, handleGameOver, currentLevel);
    showLevelAnnouncement();
    updateFullscreenUi();
}

/** DE: Zeigt das Übergangsbild vor dem Start des Levels. EN: Shows the transition image before the level begins. */
function showLevelAnnouncement() {
    const image = document.getElementById("levelTransitionImage");
    const currentWorld = world;
    image.src = "img/icons_backgrounds/El_Pollo_Loco_Level_2_2D.png";
    if (currentLevel === 1) image.src = "img/icons_backgrounds/El_Pollo_Loco_Level_1_2D.png";
    image.classList.remove("hidden");
    showLevelGoal(currentWorld);
}

/** DE: Zeigt das Spielziel kurz vor Beginn jedes Levels. EN: Briefly shows the objective before each level starts.
 * @param {*} currentWorld - DE: Parameter currentWorld. EN: currentWorld parameter.
 */
function showLevelGoal(currentWorld) {
    const announcement = document.getElementById("levelAnnouncement");
    announcement.textContent = "Collect all coins and defeat all chickens to unlock the final boss!";
    announcement.classList.remove("hidden");
    window.setTimeout(() => {
        if (world !== currentWorld) return;
        announcement.classList.add("hidden");
        document.getElementById("levelTransitionImage").classList.add("hidden");
        world.startLevel();
        window.gamePaused = false;
        pauseForTouchMenu();
        updateTouchControls();
    }, 2800);
}

/** DE: Verarbeitet Level. EN: Handles level. */
function nextLevel() {
    currentLevel = 2;
    disposeWorld();
    startGame();
}

/** DE: Verarbeitet Spiel. EN: Handles game. */
function restartGame() {
    disposeWorld();
    startGame();
}

/** DE: Beendet die aktuelle Spielrunde und zeigt das Hauptmenü. EN: Ends the current run and returns to the main menu. */
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

/** DE: Setzt zurück Menü Elemente. EN: Resets menu elements. */
function resetMenuElements() {
    document.getElementById("levelAnnouncement").classList.add("hidden");
    document.getElementById("levelTransitionImage").classList.add("hidden");
    closeControlsModal();
    showStartMenu();
}

/** DE: Beendet und bereinigt Spielwelt. EN: Disposes world. */
function disposeWorld() {
    stopPauseMusic();
    setTouchMenuOpen(false, false);
    gameSounds.stopAll();
    if (world) world.dispose();
    world = null;
    window.gamePaused = false;
}

/** DE: Zeigt nach einem Sieg oder einer Niederlage die Aktionsbuttons. EN: Shows action buttons after a win or a loss.
 * @param {*} [won] - DE: Parameter won. EN: won parameter.
 */
function handleGameOver(won = false) {
    stopPauseMusic();
    updateTouchControls();
    window.gamePaused = false;
    const finishedWorld = world;
    window.setTimeout(() => {
        if (world !== finishedWorld) return;
        if (won && currentLevel === 1) document.getElementById("nextBtn").classList.remove("hidden");
        showRestartButton();
        restartBtn.classList.toggle("icon-pulse", !won);
        document.getElementById("nextBtn").classList.toggle("icon-pulse", won && currentLevel === 1);
        document.getElementById("toolbarBackToStartBtn").classList.toggle("icon-pulse", won && currentLevel === 2);
    }, 2000);
}

/** DE: Zeigt restart Schaltfläche. EN: Shows restart button. */
function showRestartButton() {
    restartBtn.classList.remove("hidden");
}

/** DE: Verbirgt restart Schaltfläche. EN: Hides restart button. */
function hideRestartButton() {
    restartBtn.classList.remove("icon-pulse");
    document.getElementById("nextBtn").classList.remove("icon-pulse");
    document.getElementById("toolbarBackToStartBtn").classList.remove("icon-pulse");
    document.getElementById("nextBtn").classList.add("hidden");
    restartBtn.classList.add("hidden");
}

/** DE: Verbirgt start Menü. EN: Hides start menu. */
function hideStartMenu() {
    levelChoices.classList.add("hidden");
    menuButtons.classList.add("hidden");
    menuButtons.classList.add("game-running");
}

/** DE: Zeigt start Menü. EN: Shows start menu. */
function showStartMenu() {
    menuSelectionOpen = false;
    levelChoices.classList.add("hidden");
    document.getElementById("startBtn").classList.remove("hidden");
    menuButtons.classList.remove("hidden");
    menuButtons.classList.remove("game-running");
}

/** DE: Öffnet Steuerung modal. EN: Opens controls modal. */
function openControlsModal() {
    controlsModal.classList.remove("hidden");
}

/** DE: Schließt Steuerung modal. EN: Closes controls modal. */
function closeControlsModal() {
    controlsModal.classList.add("hidden");
}

/** DE: Verarbeitet backdrop click. EN: Handles backdrop click.
 * @param {Event} event - DE: Parameter event. EN: event parameter.
 */
function handleBackdropClick(event) {
    if (event.target === controlsModal) closeControlsModal();
}

/** DE: Schaltet um Vollbild. EN: Toggles fullscreen. */
function toggleFullscreen() {
    if (document.fullscreenElement) document.exitFullscreen();
    else requestFullscreenMode();
}

/** DE: Führt request fullscreen mode im Spiel aus. EN: Runs request fullscreen mode in the game. */
function requestFullscreenMode() {
    if (canvasShell.requestFullscreen) canvasShell.requestFullscreen().catch(() => {});
}

/** DE: Verarbeitet Taste down. EN: Handles key down.
 * @param {Event} event - DE: Parameter event. EN: event parameter.
 * @returns {*} DE: Berechnetes Ergebnis. EN: Computed result.
 */
function handleKeyDown(event) {
    if (event.code === "Escape" && world) return exitWithEscape(event);
    if (event.code === "Space") return handleSpaceDown(event);
    if (event.code === "KeyP" && !event.repeat) return togglePause();
    setKey(event, true);
}

/** DE: Verlässt with Entkommen. EN: Exits with escape.
 * @param {Event} event - DE: Parameter event. EN: event parameter.
 */
function exitWithEscape(event) {
    event.preventDefault();
    backToStart();
}

/** DE: Verarbeitet space down. EN: Handles space down.
 * @param {Event} event - DE: Parameter event. EN: event parameter.
 * @returns {*} DE: Berechnetes Ergebnis. EN: Computed result.
 */
function handleSpaceDown(event) {
    event.preventDefault();
    if (!world) return openLevelSelection();
    if (!event.repeat && !world.isPaused && !world.levelIntroActive) {
        world.throwChargeStart = Date.now();
    }
}

/** DE: Verarbeitet Taste up. EN: Handles key up.
 * @param {Event} event - DE: Parameter event. EN: event parameter.
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

/** DE: Schaltet um Pause. EN: Toggles pause.
 * @returns {*} DE: Berechnetes Ergebnis. EN: Computed result.
 */
function togglePause() {
    if (touchMenuOpen) return setTouchMenuOpen(false);
    if (!world || world.levelIntroActive || world.isGameOver || world.isWin) return;
    const paused = world.togglePause();
    if (paused) resetTouchControls();
    window.gamePaused = paused;
    updateTouchControls();
}

/** DE: Setzt Taste. EN: Sets key.
 * @param {Event} event - DE: Parameter event. EN: event parameter.
 * @param {boolean} pressed - DE: Parameter pressed. EN: pressed parameter.
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

/** DE: Setzt zurück keys. EN: Resets keys. */
function resetKeys() {
    keyboard.LEFT = false;
    keyboard.RIGHT = false;
    keyboard.SPACE = false;
    keyboard.UP = false;
}

/** DE: Aktualisiert orientation Zustand. EN: Updates orientation state. */
function updateOrientationState() {
    const mobileDevice = isTabletOrMobile() || navigator.maxTouchPoints > 0;
    const showNotice = mobileDevice && window.innerHeight > window.innerWidth;
    orientationOverlay.classList.toggle("hidden", !showNotice);
}

/** DE: Prüft, ob tablet or mobile. EN: Checks whether tablet or mobile.
 * @returns {*} DE: Berechnetes Ergebnis. EN: Computed result.
 */
function isTabletOrMobile() {
    return window.innerWidth <= 1024;
}

/** DE: Aktualisiert die Knöpfe für Vollbild und Normalansicht. EN: Updates controls for fullscreen and windowed mode. */
function updateFullscreenUi() {
    updateOrientationState();
    updateTouchControls();
    const fullscreen = !!document.fullscreenElement;
    setControlIcon(document.getElementById("fullscreenBtn"),
        getFullscreenIcon(fullscreen), getFullscreenLabel(fullscreen));
    const startScreen = !world && !menuSelectionOpen;
    menuButtons.classList.toggle("hidden", !!world);
    document.getElementById("startBtn").classList.toggle("hidden", !startScreen);
    document.getElementById("controlsBtn").classList.toggle("hidden", !startScreen);
    document.getElementById("imprintLink").classList.toggle("hidden", !startScreen);
    document.getElementById("toolbarBackToStartBtn").classList.toggle("hidden", startScreen);
}

/** DE: Setzt Steuerung Symbol. EN: Sets control icon.
 * @param {HTMLElement} button - DE: Parameter button. EN: button parameter.
 * @param {*} icon - DE: Parameter icon. EN: icon parameter.
 * @param {string} label - DE: Parameter label. EN: label parameter.
 */
function setControlIcon(button, icon, label) {
    button.querySelector("img").src = `img/icons_backgrounds/${icon}.svg`;
    button.setAttribute("aria-label", label);
    button.dataset.tooltip = label;
}

/** DE: Ermittelt Vollbild Symbol. EN: Gets fullscreen icon.
 * @param {boolean} fullscreen - DE: Parameter fullscreen. EN: fullscreen parameter.
 * @returns {*} DE: Berechnetes Ergebnis. EN: Computed result.
 */
function getFullscreenIcon(fullscreen) {
    if (fullscreen) return "close_fullscreen";
    return "fullscreen";
}

/** DE: Ermittelt Vollbild label. EN: Gets fullscreen label.
 * @param {boolean} fullscreen - DE: Parameter fullscreen. EN: fullscreen parameter.
 * @returns {*} DE: Berechnetes Ergebnis. EN: Computed result.
 */
function getFullscreenLabel(fullscreen) {
    if (fullscreen) return "Exit fullscreen";
    return "Enter fullscreen";
}
