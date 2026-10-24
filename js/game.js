let canvas;
let world;
let keyboard = new Keyboard();

function init() {
    canvas = document.getElementById("canvas");
    world = new World(canvas, keyboard);

    window.addEventListener("keydown", (event) => setKey(event, true));
    window.addEventListener("keyup", (event) => setKey(event, false));
    window.addEventListener("blur", () => {
        keyboard.LEFT = false;
        keyboard.RIGHT = false;
        keyboard.SPACE = false;
        keyboard.UP = false;
    });
}

function setKey(event, pressed) {
    const keys = {
        ArrowLeft: "LEFT",
        ArrowRight: "RIGHT",
        ArrowUp: "UP",
        Space: "SPACE"
    };
    const key = keys[event.code];

    if (key) {
        event.preventDefault();
        keyboard[key] = pressed;
    }
}
