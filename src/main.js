import { startGame } from "./game.js";
import { Vector2D } from "./math/vector.js";
import { resizeCanvas, listenToChanges } from "./window.js"

const canvas = /** @type {HTMLCanvasElement} */ (document.getElementById("game_canvas"))

listenToChanges(canvas);
resizeCanvas(canvas);
startGame(canvas, {
    caleb: {
        normWidthsPerSecond: 10,
    },
    gravity: new Vector2D(0, 8),
})


