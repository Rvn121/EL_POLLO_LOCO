/**
 * Shows a rotate-device hint when a mobile screen is in portrait mode.
 */
function updateOrientationState() {
    const mobileDevice = isTouchDevice();
    const showNotice = mobileDevice && window.innerHeight > window.innerWidth;
    orientationOverlay.classList.toggle("hidden", !showNotice);
}

/**
 * Checks whether the viewport uses the tablet or mobile layout.
 * @returns {*} The result of is tablet or mobile().
 */
function isTabletOrMobile() {
    return window.innerWidth <= 1024;
}

/**
 * Shows the correct buttons for the current menu state.
 * @param {boolean} startScreen - The start screen used by this method.
 */
function updateStartScreenButtons(startScreen) {
    document.getElementById("startBtn").classList.toggle("hidden", !startScreen);
    document.getElementById("controlsBtn").classList.toggle("hidden", !startScreen);
    document.getElementById("imprintLink").classList.toggle("hidden", !startScreen);
    document.getElementById("toolbarBackToStartBtn").classList.toggle("hidden", startScreen);
}

/**
 * Updates button visibility and labels for fullscreen mode.
 */
function updateFullscreenUi() {
    updateOrientationState();
    updateTouchControls();
    const fullscreen = !!document.fullscreenElement;
    setControlIcon(document.getElementById("fullscreenBtn"),
        getFullscreenIcon(fullscreen), getFullscreenLabel(fullscreen));
    const startScreen = !world && !menuSelectionOpen;
    menuButtons.classList.toggle("hidden", !!world);
    updateStartScreenButtons(startScreen);
    updateMusicButtonVisibility();
    updatePauseOverlay();
}

/**
 * Sets the icon used for a control button.
 * @param {HTMLElement} button - The HTML button being configured.
 * @param {*} icon - The icon used by this method.
 * @param {string} label - The label used by this method.
 */
function setControlIcon(button, icon, label) {
    button.querySelector("img").src = `img/icons_backgrounds/${icon}.svg`;
    button.setAttribute("aria-label", label);
    button.dataset.tooltip = label;
}

/**
 * Returns the icon matching the current fullscreen state.
 * @param {boolean} fullscreen - The fullscreen used by this method.
 * @returns {*} The result of get fullscreen icon().
 */
function getFullscreenIcon(fullscreen) {
    if (fullscreen) return "close_fullscreen";
    return "fullscreen";
}

/**
 * Returns the label matching the current fullscreen state.
 * @param {boolean} fullscreen - The fullscreen used by this method.
 * @returns {*} The result of get fullscreen label().
 */
function getFullscreenLabel(fullscreen) {
    if (fullscreen) return "Exit fullscreen";
    return "Enter fullscreen";
}
