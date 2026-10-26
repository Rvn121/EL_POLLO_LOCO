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
let menuMuted = false;
let menuMuteBtn;
let menuEffectsBtn;

document.addEventListener("DOMContentLoaded", init);

/**
 * DE: Initialisiert Spieloberfläche, Musik und Startbildschirm.
 * EN: Initializes the game interface, audio, and start screen.
 */
function init() {
    cacheDomElements();
    loadTitleAssets();
    bindUiEvents();
    setupTouchControls();
    initTitleClouds();
    startTitleScreen();
    setupMenuMusic();
}

/**
 * DE: Führt cache dom elements im Spiel aus.
 * EN: Runs cache dom elements in the game.
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
 * DE: Lädt title assets für das Spiel.
 * EN: Loads title assets for the game.
 */
function loadTitleAssets() {
    titleBackground.src = "img/5_background/layers/air.png";
    startScreenImage.src = "img/9_intro_outro_screens/start/startscreen_1.png";
}

/**
 * DE: Verknüpft ui events für das Spiel.
 * EN: Binds ui events for the game.
 */
function bindUiEvents() {
    bindMenuButtons();
    bindGameplayButtons();
    bindKeyboardEvents();
    updateOrientationState();
    updateFullscreenUi();
}

/**
 * DE: Verknüpft menu buttons für das Spiel.
 * EN: Binds menu buttons for the game.
 */
function bindMenuButtons() {
    menuMuteBtn.addEventListener("click", toggleMenuMute);
    menuEffectsBtn.addEventListener("click", toggleEffectsMute);
    document.getElementById("startBtn").addEventListener("click", openLevelSelection);
    document.getElementById("tutorialChoice").addEventListener("click", () => startSelectedLevel(1));
    document.getElementById("levelOneChoice").addEventListener("click", () => startSelectedLevel(2));
    document.getElementById("controlsBtn").addEventListener("click", openControlsModal);
    document.getElementById("closeModalBtn").addEventListener("click", closeControlsModal);
    controlsModal.addEventListener("click", handleBackdropClick);
}

/**
 * DE: Verknüpft gameplay buttons für das Spiel.
 * EN: Binds gameplay buttons for the game.
 */
function bindGameplayButtons() {
    document.getElementById("allSoundsBtn").addEventListener("click", toggleAllSounds);
    document.getElementById("restartBtn").addEventListener("click", restartGame);
    document.getElementById("nextBtn").addEventListener("click", nextLevel);
    document.getElementById("backToStartBtn").addEventListener("click", backToStart);
    document.getElementById("toolbarBackToStartBtn").addEventListener("click", backToStart);
    document.getElementById("pauseBtn").addEventListener("click", togglePause);
    document.getElementById("fullscreenBtn").addEventListener("click", toggleFullscreen);
}

/**
 * DE: Verknüpft keyboard events für das Spiel.
 * EN: Binds keyboard events for the game.
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
 * DE: Führt init title clouds im Spiel aus.
 * EN: Runs init title clouds in the game.
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
 * DE: Startet title screen für das Spiel.
 * EN: Starts title screen for the game.
 */
function startTitleScreen() {
    titleActive = true;
    cancelAnimationFrame(titleLoopId);
    titleLoopId = requestAnimationFrame(drawTitleScreen);
}

/**
 * DE: Zeichnet title screen für das Spiel.
 * EN: Draws title screen for the game.
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
 * DE: Zeichnet title background für das Spiel.
 * EN: Draws title background for the game.
 * @param {CanvasRenderingContext2D} ctx - DE: Wert ctx. EN: Value ctx.
 */
function drawTitleBackground(ctx) {
    if (titleBackground.complete && titleBackground.naturalWidth) ctx.drawImage(titleBackground, 0, 0, canvas.width, canvas.height);
    else {
        ctx.fillStyle = "#71d9ff";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
}

/**
 * DE: Zeichnet title clouds für das Spiel.
 * EN: Draws title clouds for the game.
 * @param {CanvasRenderingContext2D} ctx - DE: Wert ctx. EN: Value ctx.
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
 * DE: Aktualisiert title clouds für das Spiel.
 * EN: Updates title clouds for the game.
 */
function updateTitleClouds() {
    titleClouds.forEach(cloudObject => {
        cloudObject.x -= cloudObject.speed;
        if (cloudObject.x + cloudObject.width < 0) resetTitleCloud(cloudObject);
    });
}

/**
 * DE: Setzt title cloud für das Spiel.
 * EN: Resets title cloud for the game.
 * @param {Object} cloudObject - DE: Wert cloudObject. EN: Value cloudObject.
 */
function resetTitleCloud(cloudObject) {
    cloudObject.x = canvas.width + 120 + Math.random() * 120;
    cloudObject.y = 10 + Math.random() * 95;
}

/**
 * DE: Öffnet level selection für das Spiel.
 * EN: Opens level selection for the game.
 */
function openLevelSelection() {
    if (world || menuSelectionOpen) return;
    menuSelectionOpen = true;
    document.getElementById("startBtn").classList.add("hidden");
    levelChoices.classList.remove("hidden");
}

/**
 * DE: Startet selected level für das Spiel.
 * EN: Starts selected level for the game.
 * @param {Object} levelNumber - DE: Wert levelNumber. EN: Value levelNumber.
 */
function startSelectedLevel(levelNumber) {
    if (world) return;
    currentLevel = levelNumber;
    startGame();
}

/**
 * DE: Setzt up menu music für das Spiel.
 * EN: Sets up menu music for the game.
 */
function setupMenuMusic() {
    menuMuted = false;
    menuMusic.muted = menuMuted;
    updateMenuMuteButton();
    updateAllSoundsButton();
    updateEffectsMuteButton();
    menuMusic.volume = 0.45;
    menuMusic.addEventListener("canplay", playMenuMusic);
    playMenuMusic();
    document.addEventListener("pointerdown", playMenuMusicOnInteraction);
    document.addEventListener("pointerup", playMenuMusicOnInteraction);
    document.addEventListener("keydown", playMenuMusicOnInteraction);
}

/**
 * DE: Spielt menu music on interaction für das Spiel.
 * EN: Plays menu music on interaction for the game.
 */
function playMenuMusicOnInteraction() {
    if (!titleActive || world) return;
    playMenuMusic();
}

/**
 * DE: Versucht die Titelmusik abzuspielen, sofern sie erlaubt ist.
 * EN: Attempts to play title music when playback is allowed.
 */
function playMenuMusic() {
    if (menuMuted || !titleActive || world || !menuMusic.paused) return;
    menuMusic.play().catch(() => {});
}

/**
 * DE: Schaltet menu mute für das Spiel.
 * EN: Toggles menu mute for the game.
 */
function toggleMenuMute() {
    menuMuted = !menuMuted;
    menuMusic.muted = menuMuted;
    if (menuMuted) menuMusic.pause();
    else playMenuMusic();
    updateMenuMuteButton();
}

/**
 * DE: Aktualisiert menu mute button für das Spiel.
 * EN: Updates menu mute button for the game.
 */
function updateMenuMuteButton() {
    menuMuteBtn.textContent = "Music Off";
    if (menuMuted) menuMuteBtn.textContent = "Music On";
    menuMuteBtn.setAttribute("aria-pressed", String(menuMuted));
}

/**
 * DE: Schaltet effects mute für das Spiel.
 * EN: Toggles effects mute for the game.
 */
function toggleEffectsMute() {
    gameSounds.setMuted(!gameSounds.muted);
    localStorage.setItem("elPolloLocoEffectsMuted", String(gameSounds.muted));
    if (!gameSounds.muted && world && !world.isPaused) world.updateAmbientSounds();
    updateEffectsMuteButton();
    updateAllSoundsButton();
}

/**
 * DE: Aktualisiert effects mute button für das Spiel.
 * EN: Updates effects mute button for the game.
 */
function updateEffectsMuteButton() {
    menuEffectsBtn.textContent = "Effects Off";
    if (gameSounds.muted) menuEffectsBtn.textContent = "Effects On";
    menuEffectsBtn.setAttribute("aria-pressed", String(gameSounds.muted));
}

/**
 * DE: Schaltet all sounds für das Spiel.
 * EN: Toggles all sounds for the game.
 */
function toggleAllSounds() {
    toggleEffectsMute();
}

/**
 * DE: Aktualisiert die Beschriftung des Schalters für alle Sounds.
 * EN: Updates the label of the all-sounds toggle.
 */
function updateAllSoundsButton() {
    const button = document.getElementById("allSoundsBtn");
    button.textContent = "All Sounds Off";
    if (gameSounds.muted) button.textContent = "All Sounds On";
    button.setAttribute("aria-pressed", String(gameSounds.muted));
}

