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
    frameTimeMS: 16,
    caleb: {
        normWidthsPerSecond: 10,
        dash: {
            dashNormWidth: 35,
            distance: 5,
            dashEaseRange: 0.10
        },

        jump: {
            jumpEaseMS: 500,
            jumpEaseRange: 0.10,
            jumpNormHeight: 35,
            jumpEaseFn: Ease.x3,
            noJumpBase: 450,
            noJumpMultiplier: 350,
        }
    },

    dash: {
        topBy: 0.15,
        bottomBy: 0.15,
    },

    jump: {
        leftBy: 0.15,
        rightBy: 0.15,
    },

    gravity: new Vector2D(0, 28),
})


