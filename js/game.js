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
let restartBtn;
let controlsModal;
let orientationOverlay;
let canvasShell;
let menuMusic;
let menuMuted = false;
let menuMuteBtn;

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
    restartBtn = document.getElementById("restartBtn");
    controlsModal = document.getElementById("controlsModal");
    orientationOverlay = document.getElementById("orientationOverlay");
    canvasShell = document.getElementById("canvasShell");
    menuMusic = document.getElementById("menuMusic");
    menuMuteBtn = document.getElementById("menuMuteBtn");
}

function loadTitleAssets() {
    titleBackground.src = "img/5_background/layers/air.png";
    startScreenImage.src = "img/9_intro_outro_screens/start/startscreen_1.png";
}

function bindUiEvents() {
    menuMuteBtn.addEventListener("click", toggleMenuMute);
    document.getElementById("allSoundsBtn").addEventListener("click", toggleAllSounds);
    document.getElementById("startBtn").addEventListener("click", () => startSelectedLevel(1));
    document.getElementById("levelOneBtn").addEventListener("click", () => startSelectedLevel(2));
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

/** Starts the chosen level directly from the main menu. */
function startSelectedLevel(levelNumber) {
    if (world) return;
    currentLevel = levelNumber;
    startGame();
}

/** Attempts menu playback; browsers may require an initial user gesture. */
function setupMenuMusic() {
    menuMuted = localStorage.getItem("elPolloLocoMenuMuted") === "true";
    gameSounds.setMuted(menuMuted);
    menuMusic.muted = menuMuted;
    updateMenuMuteButton();
    updateAllSoundsButton();
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

/** Switches menu music on and off and remembers the preference. */
function toggleMenuMute() {
    menuMuted = !menuMuted;
    menuMusic.muted = menuMuted;
    gameSounds.setMuted(menuMuted);
    localStorage.setItem("elPolloLocoMenuMuted", String(menuMuted));
    if (menuMuted) menuMusic.pause();
    else playMenuMusic();
    updateMenuMuteButton();
    updateAllSoundsButton();
}

/** Updates the button label and accessibility state. */
function updateMenuMuteButton() {
    menuMuteBtn.textContent = menuMuted ? "Sound On" : "Sound Off";
    menuMuteBtn.setAttribute("aria-pressed", String(menuMuted));
}

/** Toggles all game sounds using the same saved mute preference as the menu. */
function toggleAllSounds() {
    menuMuted = !menuMuted;
    gameSounds.setMuted(menuMuted);
    menuMusic.muted = menuMuted;
    localStorage.setItem("elPolloLocoMenuMuted", String(menuMuted));
    if (menuMuted) menuMusic.pause();
    else if (world && !world.isPaused && !world.levelIntroActive) world.updateAmbientSounds();
    updateAllSoundsButton();
    updateMenuMuteButton();
}

/** Shows the action performed by clicking the game audio button. */
function updateAllSoundsButton() {
    const button = document.getElementById("allSoundsBtn");
    button.textContent = menuMuted ? "All Sounds On" : "All Sounds Off";
    button.setAttribute("aria-pressed", String(menuMuted));
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
    const currentWorld = world;
    announcement.textContent = currentLevel === 1 ? "Tutorial" : "Level 1";
    announcement.classList.remove("hidden");
    window.setTimeout(() => {
        if (world !== currentWorld) return;
        announcement.classList.add("hidden");
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
    menuButtons.classList.add("hidden");
    menuButtons.classList.add("game-running");
}

function showStartMenu() {
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
    if (event.code === "Space" && !world) {
        event.preventDefault();
        startSelectedLevel(1);
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
    document.getElementById("controlsBtn").classList.toggle("hidden", !fullscreen);
    menuMuteBtn.classList.toggle("hidden", !!world);
    document.getElementById("allSoundsBtn").classList.toggle("hidden", !world);
    updateAllSoundsButton();
}
