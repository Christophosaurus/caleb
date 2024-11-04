import * as Input from "./input/input.js";
import * as Caleb from "./objects/caleb.js";

/** @type UpdateableModule[] */
const updateables = [
    Input,
    Caleb,
];

/** @type RenderableModule[] */
const renderables = [
    Caleb,
];

/**
 * @param canvas {HTMLCanvasElement}
 * @param gameopts {GameOptions}
 */
export function startGame(canvas, gameopts) {

    const ctx = canvas.getContext("2d");
    const inputState = Input.createInputState();

    /** @type {GameState} */
    const state = {
        opts: gameopts,
        caleb: Caleb.createCaleb(gameopts.caleb),
        loopStartTime: 0,
        ctx,
        input: inputState,
    };

    ctx.imageSmoothingEnabled = false;

    // probably something here needs to be done...
    window.addEventListener("resize", function() { });

    gameLoop(state, Date.now())
}

/**
 * @param state {GameState}
 * @param lastTime {number}
 */
function gameLoop(state, lastTime) {
    const now = Date.now();
    const remaining = state.opts.frameTimeMS - (now - lastTime)
    if (remaining < 0) {
        requestAnimationFrame(function() {
            tick(state, lastTime);
            gameLoop(state, lastTime);
        });
    } else {
        setTimeout(function() {
            tick(state, lastTime);
            gameLoop(state, lastTime);
        }, remaining);
    }
}

/**
 * @param state {GameState}
 * @param lastTime {number}
 */
function tick(state, lastTime) {
    const nextTime = Date.now();
    state.loopStartTime = nextTime;

    const delta = nextTime - lastTime;

    for (const u of updateables) {
        u.update(state, delta);
    }

    state.ctx.clearRect(0, 0, state.ctx.canvas.width, state.ctx.canvas.height);

    for (const r of renderables) {
        r.render(state);
    }

    for (const u of updateables) {
        u.tickClear(state);
    }

    lastTime = nextTime;
}
