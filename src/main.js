import { startGame } from "./game.js";
import { Vector2D } from "./math/vector.js";
import * as Ease from "./math/ease.js";
import { resize } from "./window.js"

const canvas = /** @type {HTMLCanvasElement} */ (document.getElementById("game_canvas"))
canvas.tabIndex = 0;
canvas.focus();

canvas.addEventListener('blur', () => {
    canvas.focus();
});

const urlParams = new URLSearchParams(window.location.search);
const debug = urlParams.get("debug") === "1";

// TODO: this will probably need to fixed
window.addEventListener('click', () => {
    canvas.focus();
});

window.addEventListener("resize", function() {
    resize(canvas);
});
resize(canvas);

startGame(canvas, {
    debug,

    frameTimeMS: 16,
    tickTimeMS: 8,

    caleb: {
        hodlTime: 500,
        normWidthsPerSecond: 10,
        dash: {
            dashNormWidth: 30,
            distance: 5,
            dashEaseRange: 0.10
        },

        jump: {
            jumpEaseMS: 500,
            jumpEaseRange: 0.10,
            jumpNormHeight: 30,
            jumpEaseFn: Ease.x3,
            noJumpBase: 450,
            noJumpMultiplier: 350,
        }
    },

    tolerance: {
        topBy: 0.15,
        bottomBy: 0.15,
    },

    gravity: new Vector2D(0, 28),
})


