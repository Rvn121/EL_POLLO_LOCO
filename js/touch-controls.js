/**
 * DE: Verbindet die mobilen Steuertasten mit der Spielsteuerung.
 * EN: Connects mobile control buttons to game input.
 */
function setupTouchControls() {
    document.querySelectorAll("[data-touch-key]").forEach(bindTouchButton);
    window.addEventListener("blur", resetTouchControls);
    document.addEventListener("visibilitychange", handleTouchVisibility);
}

/**
 * DE: Verknüpft einen Touchbutton mit Drücken und Loslassen.
 * EN: Binds touch button press and release actions.
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
 * DE: Markiert eine gedrückte Touch-Taste als aktiv.
 * EN: Marks a pressed touch control as active.
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
 * DE: Setzt eine losgelassene Touch-Taste zurück.
 * EN: Resets a released touch control.
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
 * DE: Beginnt das Aufladen eines Flaschenwurfs per Touch.
 * EN: Starts charging a bottle throw by touch.
 */
function beginTouchThrow() {
    if (world && world.throwChargeStart === null) world.throwChargeStart = Date.now();
}

/**
 * DE: Beendet das Aufladen und wirft die Flasche.
 * EN: Ends charging and throws the bottle.
 */
function finishTouchThrow() {
    if (!world || world.throwChargeStart === null) return;
    const duration = Date.now() - world.throwChargeStart;
    world.throwChargeStart = null;
    if (world.isPaused || world.isGameOver || world.isWin) return;
    world.throwBottle(Math.min(1, Math.max(0, duration / 900)));
}

/**
 * DE: Setzt touch controls für das Spiel.
 * EN: Resets touch controls for the game.
 */
function resetTouchControls() {
    document.querySelectorAll("[data-touch-key]").forEach(button => {
        button.classList.remove("touch-pressed");
    });
    if (world) world.throwChargeStart = null;
    resetKeys();
}

/**
 * DE: Zeigt die Touchsteuerung nur in geeigneten Spielansichten.
 * EN: Shows touch controls only in suitable game views.
 */
function handleTouchVisibility() {
    if (document.hidden) resetTouchControls();
}
