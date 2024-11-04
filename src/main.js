import { startGame } from "./game.js";
import { resizeCanvas, listenToChanges } from "./window.js"

const canvas = /** @type {HTMLCanvasElement} */ (document.getElementById("game_canvas"))

listenToChanges(canvas);
resizeCanvas(canvas);
startGame(canvas, {name: "foo", score: 69})


