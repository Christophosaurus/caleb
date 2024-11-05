import { startGame } from "./game.js";
import { Vector2D } from "./math/vector.js";
import { resizeCanvas, listenToChanges } from "./window.js"

const canvas = /** @type {HTMLCanvasElement} */ (document.getElementById("game_canvas"))
canvas.tabIndex = 0;
canvas.focus();

canvas.addEventListener('blur', () => {
    canvas.focus();
});

// TODO: this will probably need to fixed
window.addEventListener('click', () => {
    canvas.focus();
});

listenToChanges(canvas);
resizeCanvas(canvas);
startGame(canvas, {
    frameTimeMS: 33,
    caleb: {
        normWidthsPerSecond: 10,
    },
    gravity: new Vector2D(0, 28),
})


