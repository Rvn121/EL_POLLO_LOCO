let canvas;
let world;
let keyboard = new Keyboard();
let titleLoopId = 0;
let titleClouds = [];
let titleBackground = new Image();
let startScreenImage = new Image();
let menuButtons;
let restartBtn;
let controlsModal;
let orientationOverlay;
let canvasShell;

function init() {
    cacheDomElements();
    loadTitleAssets();
    bindUiEvents();
    initTitleClouds();
    startTitleScreen();
}

function cacheDomElements() {
    canvas = document.getElementById("canvas");
    menuButtons = document.getElementById("menuButtons");
    restartBtn = document.getElementById("restartBtn");
    controlsModal = document.getElementById("controlsModal");
    orientationOverlay = document.getElementById("orientationOverlay");
    canvasShell = document.getElementById("canvasShell");
}

function loadTitleAssets() {
    titleBackground.src = "img/5_background/layers/air.png";
    startScreenImage.src = "img/9_intro_outro_screens/start/startscreen_1.png";
}

function bindUiEvents() {
    document.getElementById("startBtn").addEventListener("click", startGame);
    document.getElementById("restartBtn").addEventListener("click", restartGame);
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
    cancelAnimationFrame(titleLoopId);
    drawTitleScreen();
}

function drawTitleScreen() {
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

function startGame() {
    if (world) return;
    cancelAnimationFrame(titleLoopId);
    resetKeys();
    hideStartMenu();
    hideRestartButton();
    if (isTabletOrMobile()) requestFullscreenMode();
    window.gamePaused = false;
    world = new World(canvas, keyboard, handleGameOver);
    document.getElementById("pauseBtn").classList.remove("hidden");
    updateFullscreenUi();
}

function restartGame() {
    disposeWorld();
    startGame();
}

function disposeWorld() {
    if (world) world.dispose();
    world = null;
    window.gamePaused = false;
}

function handleGameOver() {
    window.gamePaused = false;
    window.setTimeout(showRestartButton, 2000);
}

function showRestartButton() {
    restartBtn.classList.remove("hidden");
}

function hideRestartButton() {
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
        startGame();
        return;
    }
    if (event.code === "Space" && world) {
        event.preventDefault();
        if (!event.repeat && !world.isPaused) world.throwChargeStart = performance.now();
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
    if (!world || world.isGameOver || world.isWin) return;
    const paused = world.togglePause();
    window.gamePaused = paused;
    document.getElementById("pauseBtn").textContent = paused ? "Weiter" : "Pause";
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
    button.textContent = fullscreen ? "Minimieren" : "Fullscreen";
    menuButtons.classList.toggle("hidden", !!world && !fullscreen);
}
