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

document.addEventListener("DOMContentLoaded", init);

/**
 * DE: Initialisiert die Startseite.
 * EN: Init.
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
 * DE: Speichert zwischen dom elements.
 * EN: Caches dom elements.
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
 * DE: Lädt title assets.
 * EN: Loads title assets.
 */
function loadTitleAssets() {
    titleBackground.src = "img/5_background/layers/air.png";
    startScreenImage.src = "img/9_intro_outro_screens/start/startscreen_1.png";
}

/**
 * DE: Verknüpft ui events.
 * EN: Binds ui events.
 */
function bindUiEvents() {
    bindMenuButtons();
    bindGameplayButtons();
    bindKeyboardEvents();
    updateOrientationState();
    updateFullscreenUi();
}

/** DE: Verbindet Menütasten mit Aktionen. EN: Wires menu buttons. */
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

/** DE: Verbindet Spieltasten mit Aktionen. EN: Wires gameplay buttons. */
function bindGameplayButtons() {
    document.getElementById("allSoundsBtn").addEventListener("click", toggleAllSounds);
    document.getElementById("restartBtn").addEventListener("click", restartGame);
    document.getElementById("nextBtn").addEventListener("click", nextLevel);
    document.getElementById("backToStartBtn").addEventListener("click", backToStart);
    document.getElementById("pauseBtn").addEventListener("click", togglePause);
    document.getElementById("fullscreenBtn").addEventListener("click", toggleFullscreen);
}

/** DE: Verbindet Tastatur- und Fensterereignisse. EN: Wires input events. */
function bindKeyboardEvents() {
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    window.addEventListener("blur", resetKeys);
    document.addEventListener("fullscreenchange", updateFullscreenUi);
    window.addEventListener("resize", updateOrientationState);
    window.addEventListener("orientationchange", updateOrientationState);
}

/**
 * DE: Initialisiert title clouds.
 * EN: Initializes title clouds.
 */
function initTitleClouds() {
    titleClouds = Array.from({ length: 8 }, (_, index) => ({
        x: index * 160 + Math.random() * 140,
        y: 10 + Math.random() * 95,
        width: 250 + Math.random() * 70,
        height: 90 + Math.random() * 40,
        speed: 0.25 + Math.random() * 0.25
    }));
}

/**
 * DE: Startet title screen.
 * EN: Starts title screen.
 */
function startTitleScreen() {
    titleActive = true;
    cancelAnimationFrame(titleLoopId);
    titleLoopId = requestAnimationFrame(drawTitleScreen);
}

/**
 * DE: Zeichnet title screen.
 * EN: Draws title screen.
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
 * DE: Zeichnet title background.
 * EN: Draws title background.
 * @param {CanvasRenderingContext2D} ctx - DE: Übergabewert ctx. EN: Argument ctx.
 */
function drawTitleBackground(ctx) {
    if (titleBackground.complete && titleBackground.naturalWidth) ctx.drawImage(titleBackground, 0, 0, canvas.width, canvas.height);
    else {
        ctx.fillStyle = "#71d9ff";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
}

/**
 * DE: Zeichnet title clouds.
 * EN: Draws title clouds.
 * @param {CanvasRenderingContext2D} ctx - DE: Übergabewert ctx. EN: Argument ctx.
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
 * DE: Aktualisiert title clouds.
 * EN: Updates title clouds.
 */
function updateTitleClouds() {
    titleClouds.forEach(cloudObject => {
        cloudObject.x -= cloudObject.speed;
        if (cloudObject.x + cloudObject.width < 0) resetTitleCloud(cloudObject);
    });
}

/**
 * DE: Setzt zurück title cloud.
 * EN: Resets title cloud.
 * @param {Object} cloudObject - DE: Übergabewert cloudObject. EN: Argument cloudObject.
 */
function resetTitleCloud(cloudObject) {
    cloudObject.x = canvas.width + 120 + Math.random() * 120;
    cloudObject.y = 10 + Math.random() * 95;
}

/**
 * DE: Öffnet level selection.
 * EN: Opens level selection.
 */
function openLevelSelection() {
    if (world || menuSelectionOpen) return;
    menuSelectionOpen = true;
    document.getElementById("startBtn").classList.add("hidden");
    levelChoices.classList.remove("hidden");
}

/**
 * DE: Startet selected level.
 * EN: Starts selected level.
 * @param {Object} levelNumber - DE: Übergabewert levelNumber. EN: Argument levelNumber.
 */
function startSelectedLevel(levelNumber) {
    if (world) return;
    currentLevel = levelNumber;
    startGame();
}

/**
 * DE: Richtet ein menu music.
 * EN: Sets up menu music.
 */
function setupMenuMusic() {
    menuMuted = true;
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
 * DE: Spielt ab menu music on interaction.
 * EN: Plays menu music on interaction.
 */
function playMenuMusicOnInteraction() {
    if (!titleActive || world) return;
    playMenuMusic();
}

/**
 * DE: Spielt die Menümusik ab.
 * EN: Play menu music.
 */
function playMenuMusic() {
    if (menuMuted || !titleActive || world || !menuMusic.paused) return;
    menuMusic.play().catch(() => {});
}

/**
 * DE: Schaltet um menu mute.
 * EN: Toggles menu mute.
 */
function toggleMenuMute() {
    menuMuted = !menuMuted;
    menuMusic.muted = menuMuted;
    if (menuMuted) menuMusic.pause();
    else playMenuMusic();
    updateMenuMuteButton();
}

/**
 * DE: Aktualisiert menu mute button.
 * EN: Updates menu mute button.
 */
function updateMenuMuteButton() {
    menuMuteBtn.textContent = menuMuted ? "Music On" : "Music Off";
    menuMuteBtn.setAttribute("aria-pressed", String(menuMuted));
}

/**
 * DE: Schaltet um effects mute.
 * EN: Toggles effects mute.
 */
function toggleEffectsMute() {
    gameSounds.setMuted(!gameSounds.muted);
    localStorage.setItem("elPolloLocoEffectsMuted", String(gameSounds.muted));
    if (!gameSounds.muted && world && !world.isPaused) world.updateAmbientSounds();
    updateEffectsMuteButton();
    updateAllSoundsButton();
}

/**
 * DE: Aktualisiert effects mute button.
 * EN: Updates effects mute button.
 */
function updateEffectsMuteButton() {
    menuEffectsBtn.textContent = gameSounds.muted ? "Effects On" : "Effects Off";
    menuEffectsBtn.setAttribute("aria-pressed", String(gameSounds.muted));
}

/**
 * DE: Schaltet die Spielgeräusche um.
 * EN: Toggle all sounds.
 */
function toggleAllSounds() {
    toggleEffectsMute();
}

/**
 * DE: Aktualisiert all sounds button.
 * EN: Updates all sounds button.
 */
function updateAllSoundsButton() {
    const button = document.getElementById("allSoundsBtn");
    button.textContent = gameSounds.muted ? "All Sounds On" : "All Sounds Off";
    button.setAttribute("aria-pressed", String(gameSounds.muted));
}

