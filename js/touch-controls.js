let touchMenuOpen = false;
let touchMenuPausedWorld = null;

/**
 * Registers the mobile movement, jump, and throw buttons.
 */
function setupTouchControls() {
    document.querySelectorAll("[data-touch-key]").forEach(bindTouchButton);
    document.getElementById("touchMenuBtn").addEventListener("click", () => setTouchMenuOpen(!touchMenuOpen));
    window.addEventListener("blur", resetTouchControls);
    window.addEventListener("resize", updateTouchControls);
    window.matchMedia("(any-pointer: coarse)").addEventListener("change", updateTouchControls);
    updateTouchControls();
    document.addEventListener("visibilitychange", handleTouchVisibility);
}

/**
 * Attaches touch and pointer handlers to one control button.
 * @param {HTMLElement} button - The HTML button being configured.
 */
function bindTouchButton(button) {
    button.addEventListener("pointerdown", event => pressTouchButton(event, button));
    button.addEventListener("pointerup", event => releaseTouchButton(event, button));
    button.addEventListener("pointercancel", event => releaseTouchButton(event, button));
    button.addEventListener("lostpointercapture", event => releaseTouchButton(event, button));
    button.addEventListener("contextmenu", event => event.preventDefault());
}

/**
 * Activates a touch control while the player presses it.
 * @param {Event} event - The keyboard, pointer, or mouse event to handle.
 * @param {HTMLElement} button - The HTML button being configured.
 * @returns {*} The result of press touch button().
 */
function pressTouchButton(event, button) {
    if (!isTouchDevice() || event.pointerType !== "touch") return;
    event.preventDefault();
    if (touchMenuOpen || !world || world.isPaused || world.levelIntroActive || world.isGameOver || world.isWin) return;
    if (button.dataset.pointerId !== undefined) return;
    button.dataset.pointerId = String(event.pointerId);
    button.setPointerCapture(event.pointerId);
    button.classList.add("touch-pressed");
    const key = button.dataset.touchKey;
    if (key === "THROW") return beginTouchThrow();
    keyboard[key] = true;
}

/**
 * Releases a touch control and clears its pressed state.
 * @param {Event} event - The keyboard, pointer, or mouse event to handle.
 * @param {HTMLElement} button - The HTML button being configured.
 * @returns {*} The result of release touch button().
 */
function releaseTouchButton(event, button) {
    event.preventDefault();
    if (button.dataset.pointerId !== String(event.pointerId)) return;
    delete button.dataset.pointerId;
    if (!button.classList.contains("touch-pressed")) return;
    button.classList.remove("touch-pressed");
    const key = button.dataset.touchKey;
    if (key === "THROW") return releaseTouchThrow(event);
    keyboard[key] = false;
}

/**
 * Releases a charged bottle throw from the touch controls.
 * @param {Event} event - The keyboard, pointer, or mouse event to handle.
 * @returns {*} The result of release touch throw().
 */
function releaseTouchThrow(event) {
    if (event.type === "pointerup") return finishTouchThrow();
    if (world) world.throwChargeStart = null;
}

/**
 * Starts charging a bottle throw on touch devices.
 */
function beginTouchThrow() {
    if (world && world.throwChargeStart === null) world.throwChargeStart = Date.now();
}

/**
 * Throws the charged bottle when the touch button is released.
 */
function finishTouchThrow() {
    if (!world || world.throwChargeStart === null) return;
    const duration = Date.now() - world.throwChargeStart;
    world.throwChargeStart = null;
    if (world.isPaused || world.isGameOver || world.isWin) return;
    world.throwBottle(Math.min(1, Math.max(0, duration / 900)));
}

/**
 * Clears active touch inputs when the game stops or loses focus.
 */
function resetTouchControls() {
    document.querySelectorAll("[data-touch-key]").forEach(button => {
        delete button.dataset.pointerId;
        button.classList.remove("touch-pressed");
    });
    if (world) world.throwChargeStart = null;
    resetKeys();
}

/**
 * Updates the touch controls when screen size or mode changes.
 */
function handleTouchVisibility() {
    if (document.hidden) resetTouchControls();
}

/**
 * Checks whether the current device supports touch input.
 */
function isTouchDevice() {
    return navigator.maxTouchPoints > 0 && window.matchMedia("(any-pointer: coarse)").matches;
}

function updateTouchControls() {
    const frame = document.getElementById("canvasFrame");
    const touchDevice = isTouchDevice();
    frame.classList.toggle("touch-enabled", touchDevice);
    document.getElementById("canvasShell").classList.toggle("touch-layout", frame.classList.contains("touch-enabled"));
    frame.classList.toggle("touch-level", !!world);
    updateMusicButtonVisibility();
    updatePauseOverlay();
    frame.classList.toggle("level-intro", !!world && world.levelIntroActive);
    updateTouchResultActions(frame);
    const active = touchDevice && !touchMenuOpen && !!world && !world.isPaused && !world.levelIntroActive && !world.isGameOver && !world.isWin;
    document.getElementById("touchControls").classList.toggle("hidden", !active);
    if (!active) resetTouchControls();
}

/**
 * Opens or closes the compact mobile control menu.
 * @param {boolean} open - The open used by this method.
 * @param {*} resume - The resume used by this method.
 */
function setTouchMenuOpen(open, resume = true) {
    open = open && isTouchDevice() && !!world;
    touchMenuOpen = open;
    const frame = document.getElementById("canvasFrame");
    frame.classList.toggle("touch-menu-open", open);
    updateTouchMenuButton(open);
    if (open) {
        pauseForTouchMenu();
        resetTouchControls();
    } else closeTouchMenu(resume);
    updateTouchControls();
    updatePauseOverlay();
}

/**
 * Updates the icon or label on the mobile menu toggle.
 * @param {boolean} open - The open used by this method.
 */
function updateTouchMenuButton(open) {
    const button = document.getElementById("touchMenuBtn");
    button.setAttribute("aria-expanded", String(open));
    let label = "Open menu";
    if (open) label = "Close menu";
    button.setAttribute("aria-label", label);
    button.dataset.tooltip = label;
}

/**
 * Closes the expanded mobile control menu.
 * @param {boolean} resume - The resume used by this method.
 */
function closeTouchMenu(resume) {
    if (resume && world && world === touchMenuPausedWorld && world.isPaused &&
        !world.levelIntroActive && !world.isWin && !world.isGameOver) {
        window.gamePaused = world.togglePause();
    }
    touchMenuPausedWorld = null;
    updatePauseOverlay();
}

/**
 * Pauses gameplay when the mobile control menu is opened.
 */
function pauseForTouchMenu() {
    if (!touchMenuOpen || !world || world.levelIntroActive || world.isWin || world.isGameOver) return;
    touchMenuPausedWorld = world;
    if (!world.isPaused) window.gamePaused = world.togglePause();
    else window.gamePaused = true;
    updatePauseOverlay();
}

/**
 * Updates the controls available after winning or losing.
 * @param {HTMLElement} frame - The animation frame to display.
 */
function updateTouchResultActions(frame) {
    const finished = frame.classList.contains("touch-enabled") && !!world && (world.isGameOver || world.isWin);
    frame.classList.toggle("touch-result", finished);
    let target = frame.querySelector(".primary-actions");
    if (finished) target = document.getElementById("touchResultActions");
    for (const id of ["toolbarBackToStartBtn", "restartBtn", "nextBtn"]) {
        const control = document.getElementById(id);
        if (control.parentElement !== target) target.appendChild(control);
    }
}
