let gameLoading = false;

/**
 * Stops the title music when a level starts.
 */
function stopMenuMusic() {
    gameSounds.stopAll();
    menuMusic.pause();
    menuMusic.currentTime = 0;
}

/**
 * Begins the selected level and removes the start menu.
 */
function startGame() {
    if (world || gameLoading) return;
    gameLoading = true;
    setTouchMenuOpen(false, false);
    stopMenuMusic();
    titleActive = false;
    cancelAnimationFrame(titleLoopId);
    resetTouchControls();
    hideStartMenu();
    hideRestartButton();
    document.getElementById("canvasFrame").classList.add("level-loading");
    prepareGameView();
}

/**
 * Prepares the canvas and controls for the selected level.
 */
async function prepareGameView() {
    window.gamePaused = true;
    const transition = document.getElementById("levelTransitionImage");
    transition.src = `img/icons_backgrounds/El_Pollo_Loco_Level_${currentLevel}_2D.png`;
    showLevelAnnouncement();
    setLoading(true);
    await waitForGameFrame();
    world = new World(canvas, keyboard, handleGameOver, currentLevel);
    const loadingWorld = world;
    await loadLevelImages(loadingWorld, transition);
    if (world !== loadingWorld) return;
    finishPreparingGame(loadingWorld);
}

/**
 * Waits until the game screen is ready for the next step.
 */
async function waitForGameFrame() {
    await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
}

/**
 * Loads the level images before gameplay begins.
 * @param {*} loadingWorld - The loading world used by this method.
 * @param {*} transition - The transition used by this method.
 */
async function loadLevelImages(loadingWorld, transition) {
    await Promise.allSettled([DrawableObject.waitForImages(), transition.decode(),
        loadingWorld.gameOverImage.decode(), loadingWorld.winImage.decode()]);
}

/**
 * Completes level setup after its images are ready.
 * @param {*} loadingWorld - The loading world used by this method.
 */
function finishPreparingGame(loadingWorld) {
    gameLoading = false;
    setLoading(false);
    window.setTimeout(() => finishLevelLoading(loadingWorld), 3000);
    updateFullscreenUi();
    document.getElementById("canvasFrame").classList.remove("level-loading");
}

/**
 * Displays the level name before the player can move.
 */
function showLevelAnnouncement() {
    const image = document.getElementById("levelTransitionImage");
    image.src = "img/icons_backgrounds/El_Pollo_Loco_Level_2_2D.png";
    if (currentLevel === 1) image.src = "img/icons_backgrounds/El_Pollo_Loco_Level_1_2D.png";
    image.classList.remove("hidden");
    const announcement = document.getElementById("levelAnnouncement");
    announcement.textContent = "Collect all coins and defeat all chickens to unlock the final boss!";
    announcement.classList.remove("hidden");
}

/**
 * Enables gameplay after the level introduction.
 * @param {*} currentWorld - The current world used by this method.
 */
function finishLevelLoading(currentWorld) {
    if (world !== currentWorld) return;
    document.getElementById("levelAnnouncement").classList.add("hidden");
    document.getElementById("levelTransitionImage").classList.add("hidden");
    world.startLevel();
    window.gamePaused = false;
    pauseForTouchMenu();
    updateTouchControls();
}

/**
 * Advances from the completed level to the next level.
 */
function nextLevel() {
    currentLevel = 2;
    disposeWorld();
    startGame();
}

/**
 * Restarts the current level without reloading the page.
 */
function restartGame() {
    disposeWorld();
    startGame();
}

/**
 * Stops the current game and returns to the title screen.
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
 * Restores the menu buttons and images to their initial state.
 */
function resetMenuElements() {
    document.getElementById("levelAnnouncement").classList.add("hidden");
    document.getElementById("levelTransitionImage").classList.add("hidden");
    closeControlsModal();
    showStartMenu();
}

/**
 * Stops the previous game world and clears its running timers.
 */
function disposeWorld() {
    document.getElementById("canvasFrame").classList.remove("level-loading");
    gameLoading = false;
    setLoading(false);
    stopPauseMusic();
    setTouchMenuOpen(false, false);
    gameSounds.stopAll();
    if (world) world.dispose();
    world = null;
    window.gamePaused = false;
}

/**
 * Displays the result screen after the player loses.
 * @param {*} won - The won used by this method.
 */
function handleGameOver(won = false) {
    stopPauseMusic();
    updateMusicButtonVisibility();
    updateTouchControls();
    window.gamePaused = false;
    const finishedWorld = world;
    window.setTimeout(() => showResultButtons(finishedWorld, won), 2000);
}

/**
 * Shows the available actions after a win or loss.
 * @param {*} finishedWorld - The finished world used by this method.
 * @param {boolean} won - The won used by this method.
 */
function showResultButtons(finishedWorld, won) {
    if (world !== finishedWorld) return;
    if (won && currentLevel === 1) document.getElementById("nextBtn").classList.remove("hidden");
    showRestartButton();
    restartBtn.classList.toggle("icon-pulse", !won);
    document.getElementById("nextBtn").classList.toggle("icon-pulse", won && currentLevel === 1);
    document.getElementById("toolbarBackToStartBtn").classList.toggle("icon-pulse", won && currentLevel === 2);
}

/**
 * Makes the restart button visible on the result screen.
 */
function showRestartButton() {
    restartBtn.classList.remove("hidden");
}

/**
 * Hides the restart button outside the result screen.
 */
function hideRestartButton() {
    restartBtn.classList.remove("icon-pulse");
    document.getElementById("nextBtn").classList.remove("icon-pulse");
    document.getElementById("toolbarBackToStartBtn").classList.remove("icon-pulse");
    document.getElementById("nextBtn").classList.add("hidden");
    restartBtn.classList.add("hidden");
}

/**
 * Hides the start menu when gameplay begins.
 */
function hideStartMenu() {
    levelChoices.classList.add("hidden");
    menuButtons.classList.add("hidden");
    menuButtons.classList.add("game-running");
}

/**
 * Displays the title menu again after leaving the game.
 */
function showStartMenu() {
    menuSelectionOpen = false;
    levelChoices.classList.add("hidden");
    document.getElementById("startBtn").classList.remove("hidden");
    menuButtons.classList.remove("hidden");
    menuButtons.classList.remove("game-running");
}

/**
 * Opens the dialog explaining keyboard and touch controls.
 */
function openControlsModal() {
    controlsModal.classList.remove("hidden");
}

/**
 * Closes the controls explanation dialog.
 */
function closeControlsModal() {
    controlsModal.classList.add("hidden");
}

/**
 * Closes the controls dialog when the backdrop is clicked.
 * @param {Event} event - The keyboard, pointer, or mouse event to handle.
 */
function handleBackdropClick(event) {
    if (event.target === controlsModal) closeControlsModal();
}

/**
 * Enters or leaves fullscreen mode.
 */
function toggleFullscreen() {
    if (document.fullscreenElement) document.exitFullscreen();
    else requestFullscreenMode();
}

/**
 * Requests fullscreen mode for the game area.
 */
function requestFullscreenMode() {
    if (canvasShell.requestFullscreen) canvasShell.requestFullscreen().catch(() => {});
}

/**
 * Handles pressed keyboard keys and menu shortcuts.
 * @param {Event} event - The keyboard, pointer, or mouse event to handle.
 * @returns {*} The result of handle key down().
 */
function handleKeyDown(event) {
    if (event.code === "Escape" && world) return exitWithEscape(event);
    if (event.code === "Space") return handleSpaceDown(event);
    if (event.code === "KeyP" && !event.repeat) return togglePause();
    setKey(event, true);
}

/**
 * Returns to the start screen when Escape is pressed.
 * @param {Event} event - The keyboard, pointer, or mouse event to handle.
 */
function exitWithEscape(event) {
    event.preventDefault();
    backToStart();
}

/**
 * Handles the space bar for level selection or bottle charging.
 * @param {Event} event - The keyboard, pointer, or mouse event to handle.
 * @returns {*} The result of handle space down().
 */
function handleSpaceDown(event) {
    event.preventDefault();
    if (!world) return openLevelSelection();
    if (!event.repeat && !world.isPaused && !world.levelIntroActive) {
        world.throwChargeStart = Date.now();
    }
}

/**
 * Handles released keyboard keys, including bottle throws.
 * @param {Event} event - The keyboard, pointer, or mouse event to handle.
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
 * Pauses or resumes the current level and its sounds.
 * @returns {*} The result of toggle pause().
 */
function togglePause() {
    if (touchMenuOpen) return setTouchMenuOpen(false);
    if (!world || world.levelIntroActive || world.isGameOver || world.isWin) return;
    if (isTouchDevice()) return setTouchMenuOpen(true);
    const paused = world.togglePause();
    if (paused) resetTouchControls();
    window.gamePaused = paused;
    updateTouchControls();
    updatePauseOverlay();
}

/**
 * Updates the stored state of a keyboard key.
 * @param {Event} event - The keyboard, pointer, or mouse event to handle.
 * @param {boolean} pressed - Whether the control is currently pressed.
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
 * Resets movement and action keys to prevent stuck input.
 */
function resetKeys() {
    keyboard.LEFT = false;
    keyboard.RIGHT = false;
    keyboard.SPACE = false;
    keyboard.UP = false;
}
