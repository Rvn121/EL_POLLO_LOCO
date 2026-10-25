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

function init() {
    cacheDomElements();
    loadTitleAssets();
    bindUiEvents();
    initTitleClouds();
    startTitleScreen();
    setupMenuMusic();
}

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

function loadTitleAssets() {
    titleBackground.src = "img/5_background/layers/air.png";
    startScreenImage.src = "img/9_intro_outro_screens/start/startscreen_1.png";
}

function bindUiEvents() {
    menuMuteBtn.addEventListener("click", toggleMenuMute);
    menuEffectsBtn.addEventListener("click", toggleEffectsMute);
    document.getElementById("allSoundsBtn").addEventListener("click", toggleAllSounds);
    document.getElementById("startBtn").addEventListener("click", openLevelSelection);
    document.getElementById("tutorialChoice").addEventListener("click", () => startSelectedLevel(1));
    document.getElementById("levelOneChoice").addEventListener("click", () => startSelectedLevel(2));
    document.getElementById("restartBtn").addEventListener("click", restartGame);
    document.getElementById("nextBtn").addEventListener("click", nextLevel);
    document.getElementById("backToStartBtn").addEventListener("click", backToStart);
    document.getElementById("pauseBtn").addEventListener("click", togglePause);
    document.getElementById("controlsBtn").addEventListener("click", openControlsModal);
    document.getElementById("closeModalBtn").addEventListener("click", closeControlsModal);
    document.getElementById("fullscreenBtn").addEventListener("click", toggleFullscreen);
    controlsModal.addEventListener("click", handleBackdropClick);
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    window.addEventListener("blur", resetKeys);
    document.addEventListener("fullscreenchange", updateFullscreenUi);
    window.addEventListener("resize", updateOrientationState);
    window.addEventListener("orientationchange", updateOrientationState);
    updateOrientationState();
    updateFullscreenUi();
}

function initTitleClouds() {
    titleClouds = Array.from({ length: 8 }, (_, index) => ({
        x: index * 160 + Math.random() * 140,
        y: 10 + Math.random() * 95,
        width: 250 + Math.random() * 70,
        height: 90 + Math.random() * 40,
        speed: 0.25 + Math.random() * 0.25
    }));
}

function startTitleScreen() {
    titleActive = true;
    cancelAnimationFrame(titleLoopId);
    drawTitleScreen();
}

function drawTitleScreen() {
    if (!titleActive || world) return;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawTitleBackground(ctx);
    drawTitleClouds(ctx);
    ctx.drawImage(startScreenImage, 0, 0, canvas.width, canvas.height);
    updateTitleClouds();
    titleLoopId = requestAnimationFrame(drawTitleScreen);
}

function drawTitleBackground(ctx) {
    if (titleBackground.complete) ctx.drawImage(titleBackground, 0, 0, canvas.width, canvas.height);
    else {
        ctx.fillStyle = "#71d9ff";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
}

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

function updateTitleClouds() {
    titleClouds.forEach(cloudObject => {
        cloudObject.x -= cloudObject.speed;
        if (cloudObject.x + cloudObject.width < 0) resetTitleCloud(cloudObject);
    });
}

function resetTitleCloud(cloudObject) {
    cloudObject.x = canvas.width + 120 + Math.random() * 120;
    cloudObject.y = 10 + Math.random() * 95;
}

/** Opens artwork-based level selection without changing the title background. */
function openLevelSelection() {
    if (world || menuSelectionOpen) return;
    menuSelectionOpen = true;
    document.getElementById("startBtn").classList.add("hidden");
    levelChoices.classList.remove("hidden");
}

/** Starts the chosen level after the menu selection. */
function startSelectedLevel(levelNumber) {
    if (world) return;
    currentLevel = levelNumber;
    startGame();
}

/** Attempts menu playback; browsers may require an initial user gesture. */
function setupMenuMusic() {
    menuMuted = false;
    menuMusic.muted = menuMuted;
    updateMenuMuteButton();
    updateAllSoundsButton();
    updateEffectsMuteButton();
    menuMusic.volume = 0.45;
    playMenuMusic();
    document.addEventListener("pointerdown", playMenuMusicOnInteraction);
    document.addEventListener("keydown", playMenuMusicOnInteraction);
}

function playMenuMusicOnInteraction() {
    if (!titleActive || world) return;
    playMenuMusic();
}

function playMenuMusic() {
    if (menuMuted || !titleActive || world || !menuMusic.paused) return;
    menuMusic.play().catch(() => {});
}

/** Switches menu music on and off for the current page visit. */
function toggleMenuMute() {
    menuMuted = !menuMuted;
    menuMusic.muted = menuMuted;
    if (menuMuted) menuMusic.pause();
    else playMenuMusic();
    updateMenuMuteButton();
}

/** Updates the button label and accessibility state. */
function updateMenuMuteButton() {
    menuMuteBtn.textContent = menuMuted ? "Music On" : "Music Off";
    menuMuteBtn.setAttribute("aria-pressed", String(menuMuted));
}

/** Independent game sound-effects toggle. */
function toggleEffectsMute() {
    gameSounds.setMuted(!gameSounds.muted);
    localStorage.setItem("elPolloLocoEffectsMuted", String(gameSounds.muted));
    if (!gameSounds.muted && world && !world.isPaused) world.updateAmbientSounds();
    updateEffectsMuteButton();
    updateAllSoundsButton();
}

function updateEffectsMuteButton() {
    menuEffectsBtn.textContent = gameSounds.muted ? "Effects On" : "Effects Off";
    menuEffectsBtn.setAttribute("aria-pressed", String(gameSounds.muted));
}

function toggleAllSounds() {
    toggleEffectsMute();
}

function updateAllSoundsButton() {
    const button = document.getElementById("allSoundsBtn");
    button.textContent = gameSounds.muted ? "All Sounds On" : "All Sounds Off";
    button.setAttribute("aria-pressed", String(gameSounds.muted));
}

function stopMenuMusic() {
    gameSounds.stopAll();
    menuMusic.pause();
    menuMusic.currentTime = 0;
}

function startGame() {
    if (world) return;
    stopMenuMusic();
    titleActive = false;
    cancelAnimationFrame(titleLoopId);
    resetKeys();
    hideStartMenu();
    hideRestartButton();
    if (isTabletOrMobile()) requestFullscreenMode();
    window.gamePaused = true;
    world = new World(canvas, keyboard, handleGameOver, currentLevel);
    document.getElementById("pauseBtn").classList.remove("hidden");
    showLevelAnnouncement();
    updateFullscreenUi();
}

/** Starts the next level after winning the tutorial. */
function showLevelAnnouncement() {
    const announcement = document.getElementById("levelAnnouncement");
    const image = document.getElementById("levelTransitionImage");
    const currentWorld = world;
    announcement.classList.add("hidden");
    image.src = currentLevel === 1 ? "img/tutorial_transition.png" : "img/level1_transition.png";
    image.classList.remove("hidden");
    window.setTimeout(() => {
        if (world !== currentWorld) return;
        image.classList.add("hidden");
        world.startLevel();
        window.gamePaused = false;
    }, 1000);
}

function nextLevel() {
    currentLevel = 2;
    disposeWorld();
    startGame();
}

function restartGame() {
    disposeWorld();
    startGame();
}

/** Returns from the result screen to the main menu without reloading. */
function backToStart() {
    disposeWorld();
    currentLevel = 1;
    resetKeys();
    hideRestartButton();
    document.getElementById("levelAnnouncement").classList.add("hidden");
    document.getElementById("levelTransitionImage").classList.add("hidden");
    document.getElementById("pauseBtn").classList.add("hidden");
    document.getElementById("pauseBtn").textContent = "Pause";
    closeControlsModal();
    showStartMenu();
    initTitleClouds();
    titleActive = true;
    startTitleScreen();
    updateFullscreenUi();
    playMenuMusic();
}

function disposeWorld() {
    gameSounds.stopAll();
    if (world) world.dispose();
    world = null;
    window.gamePaused = false;
}

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

function showRestartButton() {
    restartBtn.classList.remove("hidden");
}

function hideRestartButton() {
    document.getElementById("backToStartBtn").classList.add("hidden");
    document.getElementById("nextBtn").classList.add("hidden");
    restartBtn.classList.add("hidden");
}

function hideStartMenu() {
    levelChoices.classList.add("hidden");
    menuButtons.classList.add("hidden");
    menuButtons.classList.add("game-running");
}

function showStartMenu() {
    menuSelectionOpen = false;
    levelChoices.classList.add("hidden");
    document.getElementById("startBtn").classList.remove("hidden");
    menuButtons.classList.remove("hidden");
    menuButtons.classList.remove("game-running");
}

function openControlsModal() {
    controlsModal.classList.remove("hidden");
}

function closeControlsModal() {
    controlsModal.classList.add("hidden");
}

function handleBackdropClick(event) {
    if (event.target === controlsModal) closeControlsModal();
}

function toggleFullscreen() {
    if (document.fullscreenElement) document.exitFullscreen();
    else requestFullscreenMode();
}

function requestFullscreenMode() {
    if (canvasShell.requestFullscreen) canvasShell.requestFullscreen().catch(() => {});
}

function handleKeyDown(event) {
    if (event.code === "Escape" && world) {
        event.preventDefault();
        backToStart();
        return;
    }
    if (event.code === "Space" && !world) {
        event.preventDefault();
        openLevelSelection();
        return;
    }
    if (event.code === "Space" && world) {
        event.preventDefault();
        if (!event.repeat && !world.isPaused && !world.levelIntroActive) world.throwChargeStart = performance.now();
        return;
    }
    if (event.code === "KeyP" && !event.repeat) return togglePause();
    setKey(event, true);
}

function handleKeyUp(event) {
    if (event.code === "Space" && world?.throwChargeStart !== null && world) {
        const duration = performance.now() - world.throwChargeStart;
        const power = Math.min(1, Math.max(0, duration / 900));
        world.throwChargeStart = null;
        world.throwBottle(power);
    }
    setKey(event, false);
}

function togglePause() {
    if (!world || world.levelIntroActive || world.isGameOver || world.isWin) return;
    const paused = world.togglePause();
    window.gamePaused = paused;
    document.getElementById("pauseBtn").textContent = paused ? "Resume" : "Pause";
}

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

function resetKeys() {
    keyboard.LEFT = false;
    keyboard.RIGHT = false;
    keyboard.SPACE = false;
    keyboard.UP = false;
}

function updateOrientationState() {
    const showNotice = isTabletOrMobile() && window.innerHeight > window.innerWidth;
    orientationOverlay.classList.toggle("hidden", !showNotice);
}

function isTabletOrMobile() {
    return window.innerWidth <= 1024;
}

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
