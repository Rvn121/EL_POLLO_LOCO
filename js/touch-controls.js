let touchMenuOpen = false;
let touchMenuPausedWorld = null;

/** DE: Verbindet die mobilen Steuertasten mit der Spielsteuerung. EN: Connects mobile control buttons to game input. */
function setupTouchControls() {
    document.querySelectorAll("[data-touch-key]").forEach(bindTouchButton);
    document.getElementById("touchMenuBtn").addEventListener("click", () => setTouchMenuOpen(!touchMenuOpen));
    window.addEventListener("blur", resetTouchControls);
    window.addEventListener("resize", updateTouchControls);
    window.addEventListener("pointerdown", event => {
        if (event.pointerType !== "touch") return;
        document.getElementById("canvasFrame").classList.add("touch-enabled");
        updateTouchControls();
    });
    updateTouchControls();
    document.addEventListener("visibilitychange", handleTouchVisibility);
}

/** DE: Verknüpft einen Touchbutton mit Drücken und Loslassen. EN: Binds touch button press and release actions.
 * @param {HTMLElement} button - DE: Parameter button. EN: button parameter.
 */
function bindTouchButton(button) {
    button.addEventListener("pointerdown", event => pressTouchButton(event, button));
    button.addEventListener("pointerup", event => releaseTouchButton(event, button));
    button.addEventListener("pointercancel", event => releaseTouchButton(event, button));
    button.addEventListener("lostpointercapture", event => releaseTouchButton(event, button));
    button.addEventListener("contextmenu", event => event.preventDefault());
}

/** DE: Markiert eine gedrückte Touch-Taste als aktiv. EN: Marks a pressed touch control as active.
 * @param {Event} event - DE: Parameter event. EN: event parameter.
 * @param {HTMLElement} button - DE: Parameter button. EN: button parameter.
 * @returns {*} DE: Berechnetes Ergebnis. EN: Computed result.
 */
function pressTouchButton(event, button) {
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

/** DE: Gibt eine berührte Steuertaste wieder frei. EN: Releases a touch control button.
 * @param {Event} event - DE: Parameter event. EN: event parameter.
 * @param {HTMLElement} button - DE: Parameter button. EN: button parameter.
 * @returns {*} DE: Berechnetes Ergebnis. EN: Computed result.
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

/** DE: Beendet oder verwirft einen Touch-Flaschenwurf. EN: Finishes or cancels a touch bottle throw.
 * @param {Event} event - DE: Parameter event. EN: event parameter.
 * @returns {*} DE: Berechnetes Ergebnis. EN: Computed result.
 */
function releaseTouchThrow(event) {
    if (event.type === "pointerup") return finishTouchThrow();
    if (world) world.throwChargeStart = null;
}

/** DE: Beginnt das Aufladen eines Flaschenwurfs per Touch. EN: Starts charging a bottle throw by touch. */
function beginTouchThrow() {
    if (world && world.throwChargeStart === null) world.throwChargeStart = Date.now();
}

/** DE: Beendet das Aufladen und wirft die Flasche. EN: Ends charging and throws the bottle. */
function finishTouchThrow() {
    if (!world || world.throwChargeStart === null) return;
    const duration = Date.now() - world.throwChargeStart;
    world.throwChargeStart = null;
    if (world.isPaused || world.isGameOver || world.isWin) return;
    world.throwBottle(Math.min(1, Math.max(0, duration / 900)));
}

/** DE: Setzt zurück Touch Steuerung. EN: Resets touch controls. */
function resetTouchControls() {
    document.querySelectorAll("[data-touch-key]").forEach(button => {
        delete button.dataset.pointerId;
        button.classList.remove("touch-pressed");
    });
    if (world) world.throwChargeStart = null;
    resetKeys();
}

/** DE: Zeigt die Touchsteuerung nur in geeigneten Spielansichten. EN: Shows touch controls only in suitable game views. */
function handleTouchVisibility() {
    if (document.hidden) resetTouchControls();
}

/** DE: Aktualisiert Touch Steuerung. EN: Updates touch controls. */
function updateTouchControls() {
    const frame = document.getElementById("canvasFrame");
    const touchDevice = navigator.maxTouchPoints > 0 || window.matchMedia("(any-pointer: coarse)").matches;
    if (touchDevice) frame.classList.add("touch-enabled");
    document.getElementById("canvasShell").classList.toggle("touch-layout", frame.classList.contains("touch-enabled"));
    frame.classList.toggle("touch-level", !!world);
    frame.classList.toggle("level-intro", !!world && world.levelIntroActive);
    updateTouchResultActions(frame);
    const active = !touchMenuOpen && !!world && !world.isPaused && !world.levelIntroActive && !world.isGameOver && !world.isWin;
    document.getElementById("touchControls").classList.toggle("hidden", !active);
    if (!active) resetTouchControls();
}

/** DE: Öffnet oder schließt das mobile Bedienmenü. EN: Opens or closes the mobile control menu.
 * @param {boolean} open - DE: Parameter open. EN: open parameter.
 * @param {boolean} [resume] - DE: Parameter resume. EN: resume parameter.
 */
function setTouchMenuOpen(open, resume = true) {
    open = open && !!world;
    touchMenuOpen = open;
    const frame = document.getElementById("canvasFrame");
    frame.classList.toggle("touch-menu-open", open);
    updateTouchMenuButton(open);
    if (open) {
        pauseForTouchMenu();
        resetTouchControls();
    } else closeTouchMenu(resume);
    updateTouchControls();
}

/** DE: Aktualisiert den Zustand der mobilen Menüschaltfläche. EN: Updates the mobile menu button state.
 * @param {boolean} open - DE: Menü geöffnet. EN: Menu open. */
function updateTouchMenuButton(open) {
    const button = document.getElementById("touchMenuBtn");
    button.setAttribute("aria-expanded", String(open));
    let label = "Open menu";
    if (open) label = "Close menu";
    button.setAttribute("aria-label", label);
    button.dataset.tooltip = label;
}

/** DE: Schließt das mobile Menü und setzt das Spiel bei Bedarf fort. EN: Closes the mobile menu and resumes the game if needed.
 * @param {boolean} resume - DE: Parameter resume. EN: resume parameter.
 */
function closeTouchMenu(resume) {
    if (resume && world && world === touchMenuPausedWorld && world.isPaused &&
        !world.levelIntroActive && !world.isWin && !world.isGameOver) {
        window.gamePaused = world.togglePause();
    }
    touchMenuPausedWorld = null;
}

/** DE: Verarbeitet for Touch Menü. EN: Handles for touch menu. */
function pauseForTouchMenu() {
    if (!touchMenuOpen || !world || world.isPaused || world.levelIntroActive || world.isWin || world.isGameOver) return;
    window.gamePaused = world.togglePause();
    touchMenuPausedWorld = world;
}

/** DE: Aktualisiert Touch Ergebnis Aktionen. EN: Updates touch result actions.
 * @param {HTMLElement} frame - DE: Spielfeldbereich. EN: Game frame.
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
