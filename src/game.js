import * as Caleb from "./objects/caleb.js";
import { listenToInput } from "./input/input.js";

/**
 * @param canvas {HTMLCanvasElement}
 * @param gameopts {GameOptions}
 */
export function startGame(canvas, gameopts) {

    const ctx = canvas.getContext("2d");
    /** @type {GameState} */
    const state = {
        opts: gameopts,
        caleb: Caleb.createCaleb(gameopts.caleb),
        loopStartTime: 0,
        ctx,
        input: [],
    };

    ctx.imageSmoothingEnabled = false;

    listenToInput(state.input)
    window.addEventListener("resize", function() {
    });

    gameLoop(state)
}

/**
 * @param state {GameState}
 * @returns {Promise}
 */
async function gameLoop(state) {

    let lastTime = Date.now();
    while (true) {
        await (new Promise(res => setTimeout(res, 33)));
        const nextTime = Date.now();
        state.loopStartTime = nextTime;

        const delta = nextTime - lastTime;

        // sleep for the appropriate amount of time
        Caleb.update(state, delta)

        state.ctx.clearRect(0, 0, state.ctx.canvas.width, state.ctx.canvas.height);
        Caleb.render(state)

        lastTime = nextTime;
    }

    //ctx.clearRect(0, 0, canvas.width, canvas.height);

    //const height = canvas.height;
    //const heightPixels = Math.floor(height / HEIGHT);

    //ctx.fillRect(0, 0, Math.floor(heightPixels / 2), heightPixels);

    //requestAnimationFrame(function() {
    //    gameLoop(canvas, ctx, opts);
    //})
}

/**
 * @param canvas {HTMLCanvasElement}
 * @param ctx {CanvasRenderingContext2D}
 */
function tick(canvas, ctx) {
}
