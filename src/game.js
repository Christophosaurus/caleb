import { calculateCanvasPortions, HEIGHT } from "./window.js";

/**
 * @param canvas {HTMLCanvasElement}
 * @param player {Player}
 */
export function startGame(canvas, player) {

    const ctx = canvas.getContext("2d");
    gameLoop(canvas, ctx, {})
}

/**
 * @param canvas {HTMLCanvasElement}
 * @param ctx {CanvasRenderingContext2D}
 * @param opts {{}}
 */
function gameLoop(canvas, ctx, opts) {

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const height = canvas.height;
    const heightPixels = Math.floor(height / HEIGHT);

    ctx.fillRect(0, 0, Math.floor(heightPixels / 2), heightPixels);

    requestAnimationFrame(function() {
        gameLoop(canvas, ctx, opts);
    })
}

