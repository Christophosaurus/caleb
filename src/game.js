import * as Input from "./input/input.js";
import * as Caleb from "./objects/caleb.js";
import * as Debugger from "./debug.js";
import { now as nowFn } from "./utils.js";

/** @type UpdateableModule[] */
const updateables = [
    Input,
    Caleb,
    Debugger,
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
    Input.listenForKeyboard(inputState, window);

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

    state.loopStartTime = nowFn();
    gameLoop(state)
}

/**
 * @param state {GameState}
 */
function gameLoop(state) {
    const start = nowFn();
    const delta = start - state.loopStartTime;
    state.loopStartTime = start;

    tick(state, delta);
    const now = nowFn();
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
