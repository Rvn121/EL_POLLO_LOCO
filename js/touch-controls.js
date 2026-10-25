/**
 * DE: Richtet die Touchsteuerung für Smartphone und Tablet ein.
 * EN: Sets up touch controls for phones and tablets.
 */
function setupTouchControls() {
    document.querySelectorAll("[data-touch-key]").forEach(bindTouchButton);
    window.addEventListener("blur", resetTouchControls);
    document.addEventListener("visibilitychange", handleTouchVisibility);
}

/**
 * DE: Verbindet die Touch-Ereignisse mit einer Schaltfläche.
 * EN: Connects pointer events to a touch button.
 * @param {HTMLButtonElement} button - DE: Schaltfläche. EN: Button.
 */
function bindTouchButton(button) {
    button.addEventListener("pointerdown", event => pressTouchButton(event, button));
    button.addEventListener("pointerup", event => releaseTouchButton(event, button));
    button.addEventListener("pointercancel", event => releaseTouchButton(event, button));
    button.addEventListener("lostpointercapture", event => releaseTouchButton(event, button));
    button.addEventListener("contextmenu", event => event.preventDefault());
}

/**
 * DE: Aktiviert eine Taste, solange sie berührt wird.
 * EN: Activates a control while it is pressed.
 * @param {PointerEvent} event - DE: Berührung. EN: Pointer event.
 * @param {HTMLButtonElement} button - DE: Schaltfläche. EN: Button.
 */
function pressTouchButton(event, button) {
    event.preventDefault();
    if (!world || world.isPaused || world.levelIntroActive) return;
    button.setPointerCapture(event.pointerId);
    button.classList.add("touch-pressed");
    const key = button.dataset.touchKey;
    if (key === "THROW") return beginTouchThrow();
    keyboard[key] = true;
}

/**
 * DE: Beendet die Berührung und löst gegebenenfalls einen Wurf aus.
 * EN: Releases a control and throws a bottle when needed.
 * @param {PointerEvent} event - DE: Berührung. EN: Pointer event.
 * @param {HTMLButtonElement} button - DE: Schaltfläche. EN: Button.
 */
function releaseTouchButton(event, button) {
    event.preventDefault();
    if (!button.classList.contains("touch-pressed")) return;
    button.classList.remove("touch-pressed");
    const key = button.dataset.touchKey;
    if (key === "THROW") return finishTouchThrow();
    keyboard[key] = false;
}

/**
 * DE: Startet das Aufladen einer Flasche.
 * EN: Starts charging a bottle throw.
 */
function beginTouchThrow() {
    if (world && world.throwChargeStart === null) world.throwChargeStart = performance.now();
}

/**
 * DE: Wirft die Flasche entsprechend der Druckdauer.
 * EN: Throws a bottle based on press duration.
 */
function finishTouchThrow() {
    if (!world || world.throwChargeStart === null) return;
    const duration = performance.now() - world.throwChargeStart;
    world.throwChargeStart = null;
    if (world.isPaused || world.isGameOver || world.isWin) return;
    world.throwBottle(Math.min(1, Math.max(0, duration / 900)));
}

/**
 * DE: Entfernt gedrückte Touchzustände bei Fokusverlust.
 * EN: Clears held controls when focus is lost.
 */
function resetTouchControls() {
    document.querySelectorAll("[data-touch-key]").forEach(button => {
        button.classList.remove("touch-pressed");
    });
    if (world) world.throwChargeStart = null;
    resetKeys();
}

/**
 * DE: Stoppt die Steuerung, wenn die Seite nicht sichtbar ist.
 * EN: Releases controls when the page becomes hidden.
 */
function handleTouchVisibility() {
    if (document.hidden) resetTouchControls();
}
