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
const pauseMusic = new Audio("img/icons_backgrounds/pause.mp3");
pauseMusic.loop = true;
pauseMusic.volume = 0.45;

document.addEventListener("DOMContentLoaded", init);

/** DE: Initialisiert das Spiel und seine Bedienelemente. EN: Initializes the game and its controls. */
function init() {
    cacheDomElements();
    loadTitleAssets();
    bindUiEvents();
    setupTouchControls();
    setupIconTooltips();
    initTitleClouds();
    startTitleScreen();
    setupMenuMusic();
}

/** DE: Speichert häufig verwendete HTML-Elemente. EN: Stores frequently used HTML elements. */
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

/** DE: Lädt die Grafiken des Startmenüs. EN: Loads the start menu graphics. */
function loadTitleAssets() {
    titleBackground.src = "img/5_background/layers/air.png";
    startScreenImage.src = "img/9_intro_outro_screens/start/startscreen_1.png";
}

/** DE: Verbindet die Bedienelemente mit ihren Funktionen. EN: Connects user interface elements with their actions. */
function bindUiEvents() {
    bindMenuButtons();
    bindGameplayButtons();
    bindKeyboardEvents();
    updateOrientationState();
    updateFullscreenUi();
}

/** DE: Richtet die Schaltflächen des Hauptmenüs ein. EN: Sets up the main menu buttons. */
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

/** DE: Richtet die Schaltflächen während des Spiels ein. EN: Sets up the in-game buttons. */
function bindGameplayButtons() {
    document.getElementById("restartBtn").addEventListener("click", restartGame);
    document.getElementById("nextBtn").addEventListener("click", nextLevel);
    document.getElementById("toolbarBackToStartBtn").addEventListener("click", backToStart);
    document.getElementById("fullscreenBtn").addEventListener("click", toggleFullscreen);
}

/** DE: Richtet die Tastatursteuerung ein. EN: Sets up keyboard controls. */
function bindKeyboardEvents() {
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    window.addEventListener("blur", resetKeys);
    document.addEventListener("fullscreenchange", updateFullscreenUi);
    window.addEventListener("resize", updateOrientationState);
    window.addEventListener("orientationchange", updateOrientationState);
}

/** DE: Führt init title clouds im Spiel aus. EN: Runs init title clouds in the game. */
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

/** DE: Startet title Bildschirm. EN: Starts title screen. */
function startTitleScreen() {
    titleActive = true;
    cancelAnimationFrame(titleLoopId);
    titleLoopId = requestAnimationFrame(drawTitleScreen);
}

/** DE: Zeichnet title Bildschirm. EN: Draws title screen. */
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

/** DE: Zeichnet title Hintergrund. EN: Draws title background.
 * @param {*} ctx - DE: Parameter ctx. EN: ctx parameter.
 */
function drawTitleBackground(ctx) {
    if (titleBackground.complete && titleBackground.naturalWidth) ctx.drawImage(titleBackground, 0, 0, canvas.width, canvas.height);
    else {
        ctx.fillStyle = "#71d9ff";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
}

/** DE: Zeichnet title Wolken. EN: Draws title clouds.
 * @param {*} ctx - DE: Parameter ctx. EN: ctx parameter.
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

/** DE: Aktualisiert title Wolken. EN: Updates title clouds. */
function updateTitleClouds() {
    titleClouds.forEach(cloudObject => {
        cloudObject.x -= cloudObject.speed;
        if (cloudObject.x + cloudObject.width < 0) resetTitleCloud(cloudObject);
    });
}

/** DE: Setzt zurück title Wolke. EN: Resets title cloud.
 * @param {*} cloudObject - DE: Parameter cloudObject. EN: cloudObject parameter.
 */
function resetTitleCloud(cloudObject) {
    cloudObject.x = canvas.width + 120 + Math.random() * 120;
    cloudObject.y = 10 + Math.random() * 95;
}

/** DE: Öffnet Level Auswahl. EN: Opens level selection. */
function openLevelSelection() {
    if (world || menuSelectionOpen) return;
    setTouchMenuOpen(false);
    menuSelectionOpen = true;
    document.getElementById("startBtn").classList.add("hidden");
    levelChoices.classList.remove("hidden");
    updateFullscreenUi();
}

/** DE: Startet selected Level. EN: Starts selected level.
 * @param {number} levelNumber - DE: Parameter levelNumber. EN: levelNumber parameter.
 */
function startSelectedLevel(levelNumber) {
    if (world) return;
    currentLevel = levelNumber;
    startGame();
}

/** DE: Richtet ein Menü Musik. EN: Sets up menu music. */
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

/** DE: Spielt Menü Musik on interaction. EN: Plays menu music on interaction. */
function playMenuMusicOnInteraction() {
    if (!titleActive || world) return;
    playMenuMusic();
}

/** DE: Versucht die Titelmusik abzuspielen, sofern sie erlaubt ist. EN: Attempts to play title music when playback is allowed. */
function playMenuMusic() {
    if (menuMuted || !titleActive || world || !menuMusic.paused) return;
    menuMusic.play().catch(() => {});
}

/** DE: Schaltet um Menü mute. EN: Toggles menu mute. */
function toggleMenuMute() {
    menuMuted = !menuMuted;
    menuMusic.muted = menuMuted;
    if (menuMuted) menuMusic.pause();
    else playMenuMusic();
    updateMenuMuteButton();
    updatePauseMusic();
}

/** DE: Aktualisiert Menü mute Schaltfläche. EN: Updates menu mute button. */
function updateMenuMuteButton() {
    let icon = "music_on";
    let label = "Turn music off";
    if (menuMuted) { icon = "music_off"; label = "Turn music on"; }
    setControlIcon(menuMuteBtn, icon, label);
    menuMuteBtn.setAttribute("aria-pressed", String(menuMuted));
}

/** DE: Schaltet um Effekte mute. EN: Toggles effects mute. */
function toggleEffectsMute() {
    gameSounds.setMuted(!gameSounds.muted);
    localStorage.setItem("elPolloLocoEffectsMuted", String(gameSounds.muted));
    if (!gameSounds.muted && world && !world.isPaused) world.updateAmbientSounds();
    updateEffectsMuteButton();
    updateAllSoundsButton();
}

/** DE: Aktualisiert Effekte mute Schaltfläche. EN: Updates effects mute button. */
function updateEffectsMuteButton() {
    let icon = "sfx_on";
    let label = "Turn sound effects off";
    if (gameSounds.muted) { icon = "sfx_off"; label = "Turn sound effects on"; }
    setControlIcon(menuEffectsBtn, icon, label);
    menuEffectsBtn.setAttribute("aria-pressed", String(gameSounds.muted));
}

/** DE: Schaltet um alle Geräusche. EN: Toggles all sounds. */
function toggleAllSounds() {
    toggleEffectsMute();
}

/** DE: Aktualisiert die Beschriftung des Schalters für alle Sounds. EN: Updates the label of the all-sounds toggle. */
function updateAllSoundsButton() {

}


/** Keeps hover and keyboard hints inside the canvas at every screen size. */
let currentTooltipControl = null;

/** DE: Erstellt die kleinen Hinweise für Symbolschaltflächen. EN: Creates tooltips for icon buttons. */
function setupIconTooltips() {
    const frame = document.getElementById("canvasFrame");
    const tooltip = document.createElement("div");
    tooltip.id = "canvasTooltip";
    tooltip.className = "canvas-tooltip hidden";
    tooltip.setAttribute("role", "tooltip");
    frame.appendChild(tooltip);
    bindIconTooltips(frame);
}

/** DE: Verbindet die Symbolschaltflächen mit ihren Hinweisen. EN: Connects icon buttons to their tooltips.
 * @param {number} frame - DE: Parameter frame. EN: frame parameter.
 */
function bindIconTooltips(frame) {
    frame.querySelectorAll(".icon-control").forEach(control => {
        control.addEventListener("pointerenter", () => showIconTooltip(control));
        control.addEventListener("pointerleave", hideIconTooltip);
        control.addEventListener("focus", () => showIconTooltip(control));
        control.addEventListener("blur", hideIconTooltip);
        control.addEventListener("click", hideIconTooltip);
    });
    window.addEventListener("resize", hideIconTooltip);
    document.addEventListener("fullscreenchange", hideIconTooltip);
}

/** DE: Blendet einen Hinweis aus. EN: Hides a tooltip. */
function hideIconTooltip() {
    if (currentTooltipControl) currentTooltipControl.removeAttribute("aria-describedby");
    currentTooltipControl = null;
    document.getElementById("canvasTooltip").classList.add("hidden");
}

/** DE: Zeigt den Hinweis einer Schaltfläche an. EN: Shows the tooltip for a button.
 * @param {HTMLElement} control - DE: Parameter control. EN: control parameter.
 */
function showIconTooltip(control) {
    hideIconTooltip();
    currentTooltipControl = control;
    const tooltip = document.getElementById("canvasTooltip");
    tooltip.textContent = control.dataset.tooltip;
    tooltip.classList.remove("hidden");
    control.setAttribute("aria-describedby", tooltip.id);
    positionIconTooltip(control, tooltip);
}

/** DE: Positioniert den Hinweis innerhalb des Spielfeldbereichs. EN: Positions a tooltip inside the game frame.
 * @param {HTMLElement} control - DE: Parameter control. EN: control parameter.
 * @param {HTMLElement} tooltip - DE: Parameter tooltip. EN: tooltip parameter.
 */
function positionIconTooltip(control, tooltip) {
    const frame = document.getElementById("canvasFrame");
    const bounds = frame.getBoundingClientRect();
    const icon = control.getBoundingClientRect();
    const inset = 12;
    const left = icon.left - bounds.left + (icon.width - tooltip.offsetWidth) / 2;
    const top = icon.top - bounds.top - tooltip.offsetHeight - 10;
    tooltip.style.left = `${Math.max(inset, Math.min(left, frame.clientWidth - tooltip.offsetWidth - inset))}px`;
    tooltip.style.top = `${Math.max(inset, Math.min(top, frame.clientHeight - tooltip.offsetHeight - inset))}px`;
}

/** DE: Steuert die Musik bei pausiertem Spiel. EN: Controls music while the game is paused.
 * @returns {*} DE: Berechnetes Ergebnis. EN: Computed result.
 */
function updatePauseMusic() {
    const pausedLevel = world && world.isPaused && !world.levelIntroActive && !world.isWin && !world.isGameOver;
    if (!pausedLevel) return stopPauseMusic();
    if (menuMuted) return pauseMusic.pause();
    if (pauseMusic.paused) pauseMusic.play().catch(() => {});
}

/** DE: Stoppt die Pausenmusik. EN: Stops the pause music. */
function stopPauseMusic() {
    pauseMusic.pause();
    pauseMusic.currentTime = 0;
}
