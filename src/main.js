import { startGame } from "./game.js";
import { Vector2D } from "./math/vector.js";
import * as Ease from "./math/ease.js";
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
        jumpEaseMS: 500,
        jumpEaseRange: 0.10,
        jumpNormHeight: 8,
        jumpEaseFn: Ease.x3,
        noJumpBase: 400,
        noJumpMultiplier: 350,
    },
    gravity: new Vector2D(0, 28),
})


