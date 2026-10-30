let canvas;
let currentLevel = 1;
let world;
let keyboard = new Keyboard();
let titleLoopId = 0;
let titleActive = false;
let titleClouds = [];
let titleBackground = new Image();
let startScreenImage = new Image();
let menuButtons;
let levelChoices;
let menuSelectionOpen = false;
let restartBtn;
let controlsModal;
let orientationOverlay;
let canvasShell;
let menuMusic;
let menuMuted = true;
let menuMuteBtn;
let menuEffectsBtn;
const pauseMusic = new Audio("img/icons_backgrounds/pause.mp3");
pauseMusic.loop = true;
pauseMusic.volume = 0.45;

document.addEventListener("DOMContentLoaded", init);

/**
 * Loads the start menu, sets up controls, and prepares the game screen.
 */
async function init() {
    cacheDomElements();
    loadTitleAssets();
    bindUiEvents();
    setupTouchControls();
    setupIconTooltips();
    initTitleClouds();
    startTitleScreen();
    setupMenuMusic();
    await waitForMenuImages();
    setLoading(false);
}


/**
 * Waits for the menu images to finish loading before showing the menu.
 * @returns {Promise<void>} The result of wait for menu images().
 */
async function waitForMenuImages() {
    const promises = [titleBackground.decode(), startScreenImage.decode()];
    for (let i = 0; i < document.images.length; i++) {
        promises.push(document.images[i].decode());
    }
    await Promise.allSettled(promises);
}


/**
 * Shows or hides the loading indicator while assets are prepared.
 * @param {*} loading - The loading used by this method.
 */
function setLoading(loading) {
    const screen = document.getElementById("loadingScreen");
    screen.classList.toggle("hidden", !loading);
    canvasShell.setAttribute("aria-busy", String(loading));
}


/**
 * Stores the HTML elements needed by the game interface.
 */
function cacheDomElements() {
    canvas = document.getElementById("canvas");
    menuButtons = document.getElementById("menuButtons");
    levelChoices = document.getElementById("levelChoices");
    restartBtn = document.getElementById("restartBtn");
    controlsModal = document.getElementById("controlsModal");
    orientationOverlay = document.getElementById("orientationOverlay");
    canvasShell = document.getElementById("canvasShell");
    menuMusic = document.getElementById("menuMusic");
    menuMuteBtn = document.getElementById("menuMuteBtn");
    menuEffectsBtn = document.getElementById("menuEffectsBtn");
}


/**
 * Loads the images used on the title screen.
 */
function loadTitleAssets() {
    titleBackground.src = "img/5_background/layers/air.png";
    startScreenImage.src = "img/9_intro_outro_screens/start/startscreen_1.png";
}


/**
 * Connects the menu and gameplay buttons to their event handlers.
 */
function bindUiEvents() {
    bindMenuButtons();
    bindGameplayButtons();
    bindKeyboardEvents();
    updateOrientationState();
    updateFullscreenUi();
}


/**
 * Connects the start menu buttons to their actions.
 */
function bindMenuButtons() {
    const legalDialog = document.getElementById("legalNoticeDialog");
    document.getElementById("imprintLink").addEventListener("click", () => legalDialog.showModal());
    legalDialog.addEventListener("click", event => {
        const bounds = legalDialog.getBoundingClientRect();
        if (event.target === legalDialog && (event.clientX < bounds.left || event.clientX > bounds.right ||
            event.clientY < bounds.top || event.clientY > bounds.bottom)) legalDialog.close();
    });
    menuMuteBtn.addEventListener("click", toggleMenuMute);
    menuEffectsBtn.addEventListener("click", toggleEffectsMute);
    bindLevelMenuButtons();
}


/**
 * Connects the level selection buttons to their actions.
 */
function bindLevelMenuButtons() {
    document.getElementById("startBtn").addEventListener("click", openLevelSelection);
    document.getElementById("tutorialChoice").addEventListener("click", () => startSelectedLevel(1));
    document.getElementById("levelOneChoice").addEventListener("click", () => startSelectedLevel(2));
    document.getElementById("controlsBtn").addEventListener("click", openControlsModal);
    document.getElementById("closeModalBtn").addEventListener("click", closeControlsModal);
    controlsModal.addEventListener("click", handleBackdropClick);
}


/**
 * Connects gameplay buttons to pause, sound, and fullscreen controls.
 */
function bindGameplayButtons() {
    document.getElementById("restartBtn").addEventListener("click", restartGame);
    document.getElementById("nextBtn").addEventListener("click", nextLevel);
    document.getElementById("toolbarBackToStartBtn").addEventListener("click", backToStart);
    document.getElementById("fullscreenBtn").addEventListener("click", toggleFullscreen);
}


/**
 * Registers keyboard input and key release handlers.
 */
function bindKeyboardEvents() {
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    window.addEventListener("blur", resetKeys);
    document.addEventListener("fullscreenchange", updateFullscreenUi);
    window.addEventListener("resize", updateOrientationState);
    window.addEventListener("orientationchange", updateOrientationState);
}


/**
 * Creates clouds at random starting positions for the title screen.
 */
function initTitleClouds() {
    titleClouds = [];
    for (let index = 0; index < 8; index++) {
        titleClouds.push({
            x: index * 160 + Math.random() * 140,
            y: 10 + Math.random() * 95,
            width: 250 + Math.random() * 70,
            height: 90 + Math.random() * 40,
            speed: 0.25 + Math.random() * 0.25
        });
    }
}


/**
 * Starts the animation of the title screen.
 */
function startTitleScreen() {
    titleActive = true;
    cancelAnimationFrame(titleLoopId);
    titleLoopId = requestAnimationFrame(drawTitleScreen);
}


/**
 * Draws the title background and animated clouds for the current frame.
 */
function drawTitleScreen() {
    if (!titleActive || world) return;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawTitleBackground(ctx);
    drawTitleClouds(ctx);
    if (startScreenImage.complete && startScreenImage.naturalWidth)
        ctx.drawImage(startScreenImage, 0, 0, canvas.width, canvas.height);
    updateTitleClouds();
    titleLoopId = requestAnimationFrame(drawTitleScreen);
}


/**
 * Draws the background picture of the start menu.
 * @param {*} ctx - The canvas drawing context.
 */
function drawTitleBackground(ctx) {
    if (titleBackground.complete && titleBackground.naturalWidth) ctx.drawImage(titleBackground, 0, 0, canvas.width, canvas.height);
    else {
        ctx.fillStyle = "#71d9ff";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
}


/**
 * Draws the moving clouds above the start menu.
 * @param {*} ctx - The canvas drawing context.
 */
function drawTitleClouds(ctx) {
    ctx.fillStyle = "rgba(255, 255, 255, 0.9)";
    titleClouds.forEach(cloudObject => {
        ctx.beginPath();
        ctx.ellipse(cloudObject.x, cloudObject.y, cloudObject.width / 3,
            cloudObject.height / 2, 0, 0, Math.PI * 2);
        ctx.ellipse(cloudObject.x + 70, cloudObject.y + 6, cloudObject.width / 3.2,
            cloudObject.height / 2.4, 0, 0, Math.PI * 2);
        ctx.ellipse(cloudObject.x - 70, cloudObject.y + 8, cloudObject.width / 3.2,
            cloudObject.height / 2.4, 0, 0, Math.PI * 2);
        ctx.fill();
    });
}


/**
 * Moves the title screen clouds and replaces clouds that leave the screen.
 */
function updateTitleClouds() {
    titleClouds.forEach(cloudObject => {
        cloudObject.x -= cloudObject.speed;
        if (cloudObject.x + cloudObject.width < 0) resetTitleCloud(cloudObject);
    });
}


/**
 * Moves a cloud back to the right side of the title screen.
 * @param {*} cloudObject - The cloud object used by this method.
 */
function resetTitleCloud(cloudObject) {
    cloudObject.x = canvas.width + 120 + Math.random() * 120;
    cloudObject.y = 10 + Math.random() * 95;
}


/**
 * Hides the start button and displays the tutorial and level selection images.
 */
function openLevelSelection() {
    if (world || menuSelectionOpen) return;
    setTouchMenuOpen(false);
    menuSelectionOpen = true;
    document.getElementById("startBtn").classList.add("hidden");
    levelChoices.classList.remove("hidden");
    updateFullscreenUi();
}


/**
 * Starts the level chosen by the player.
 * @param {number} levelNumber - The level number used by this method.
 */
function startSelectedLevel(levelNumber) {
    if (world) return;
    currentLevel = levelNumber;
    startGame();
}


/**
 * Prepares title music and restores the saved music setting.
 * Music stays muted until the user enables it.
 */
function setupMenuMusic() {
    menuMuted = localStorage.getItem("elPolloLocoMusicMuted") !== "false";
    menuMusic.muted = menuMuted;
    pauseMusic.muted = menuMuted;
    gameSounds.setMusicMuted(menuMuted);
    updateMenuMuteButton();
    updateEffectsMuteButton();
    menuMusic.volume = 0.45;
    startMenuMusicEvents();
}


/**
 * Registers user interactions that can start the title music.
 */
function startMenuMusicEvents() {
    menuMusic.addEventListener("canplay", playMenuMusic);
    playMenuMusic();
    bindMenuMusicEvents();
}


/**
 * Connects the menu music button to its mute control.
 */
function bindMenuMusicEvents() {
    document.addEventListener("pointerdown", playMenuMusicOnInteraction);
    document.addEventListener("pointerup", playMenuMusicOnInteraction);
    document.addEventListener("keydown", playMenuMusicOnInteraction);
}


/**
 * Tries to start menu music after the player interacts with the page.
 */
function playMenuMusicOnInteraction() {
    if (!titleActive || world) return;
    playMenuMusic();
}


/**
 * Plays the title music unless playback is blocked by the browser.
 */
function playMenuMusic() {
    if (!titleActive || world || !menuMusic.paused) return;
    menuMusic.play().catch(() => {});
}


/**
 * Switches menu music between muted and unmuted and saves the setting.
 */
function toggleMenuMute() {
    menuMuted = !menuMuted;
    localStorage.setItem("elPolloLocoMusicMuted", String(menuMuted));
    gameSounds.setMusicMuted(menuMuted);
    menuMusic.muted = menuMuted;
    pauseMusic.muted = menuMuted;
    playMenuMusic();
    updateMenuMuteButton();
    updatePauseMusic();
}


/**
 * Updates the menu music button to show its current state.
 */
function updateMenuMuteButton() {
    let icon = "music_on";
    let label = "Turn music off";
    if (menuMuted) { icon = "music_off"; label = "Turn music on"; }
    setControlIcon(menuMuteBtn, icon, label);
    menuMuteBtn.setAttribute("aria-pressed", String(menuMuted));
}


/**
 * Switches sound effects on or off and saves the setting.
 */
function toggleEffectsMute() {
    gameSounds.setMuted(!gameSounds.muted);
    localStorage.setItem("elPolloLocoEffectsMuted", String(gameSounds.muted));
    if (!gameSounds.muted && world && !world.isPaused) world.updateAmbientSounds();
    updateEffectsMuteButton();
}


/**
 * Displays the current sound effects setting on the button.
 */
function updateEffectsMuteButton() {
    let icon = "sfx_on";
    let label = "Turn sound effects off";
    if (gameSounds.muted) { icon = "sfx_off"; label = "Turn sound effects on"; }
    setControlIcon(menuEffectsBtn, icon, label);
    menuEffectsBtn.setAttribute("aria-pressed", String(gameSounds.muted));
}
