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

    state.loopStartTime = Date.now();
    gameLoop(state)
}

/**
 * @param state {GameState}
 * @param lastTime {number}
 */
function gameLoop(state) {
    const start = Date.now();
    const delta = start - state.loopStartTime;
    state.loopStartTime = start;

    tick(state, delta);
    const now = Date.now();
    const remaining = state.opts.frameTimeMS - (now - start);

    if (remaining >= 0) {
        requestAnimationFrame(() => gameLoop(state));
    } else {
        setTimeout(() => gameLoop(state), remaining);
    }
}

/**
 * @param state {GameState}
 * @param delta {number}
 */
function tick(state, delta) {
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
}
