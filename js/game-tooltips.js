/**
 * Prepares the tooltips for game control icons.
 */
function setupIconTooltips() {
    const frame = document.getElementById("canvasFrame");
    const tooltip = document.createElement("div");
    tooltip.id = "canvasTooltip";
    tooltip.className = "canvas-tooltip hidden";
    tooltip.setAttribute("role", "tooltip");
    frame.appendChild(tooltip);
    bindIconTooltips(frame);
}

/**
 * Registers hover and focus handlers for icon tooltips.
 * @param {HTMLElement} frame - The animation frame to display.
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

/**
 * Hides the currently visible icon tooltip.
 */
function hideIconTooltip() {
    if (currentTooltipControl) currentTooltipControl.removeAttribute("aria-describedby");
    currentTooltipControl = null;
    document.getElementById("canvasTooltip").classList.add("hidden");
}

/**
 * Displays the tooltip for the selected control.
 * @param {HTMLElement} control - The control used by this method.
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

/**
 * Positions a tooltip near its associated button.
 * @param {HTMLElement} control - The control used by this method.
 * @param {HTMLElement} tooltip - The tooltip used by this method.
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

