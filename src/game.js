import * as Input from "./input/input.js";
import * as Caleb from "./objects/caleb/caleb.js";
import * as Debugger from "./debug.js";
import * as Level from "./objects/level/level.js"
import * as Levels from "./objects/level/levels/levels.js";
import * as RN from "./objects/relative_numbers.js";
import * as State from "./state/state.js";
import { now as nowFn } from "./utils.js";

/** @type UpdateableModule[] */
const updateables = [
    Input,
    Caleb,
    Debugger,
    RN,
];

/** @type RenderableModule[] */
const renderables = [
    Caleb,
    Level,
    RN,
];

/**
 * @param canvas {HTMLCanvasElement}
 */
function configureCanvas(canvas) {
    canvas.getContext("2d").imageSmoothingEnabled = false;
}

/**
 * @param canvas {HTMLCanvasElement}
 * @param gameopts {GameOptions}
 */
export function startGame(canvas, gameopts) {

    const inputState = Input.createInputState();
    const one = Levels.levels()[0];
    const state = State.createGameState(gameopts, inputState, canvas, one);

    Input.listenForKeyboard(inputState, canvas);
    State.reset(state);
    configureCanvas(canvas);

    window.addEventListener("resize", function() {
        State.projectStaticObjects(state);
    });

    gameLoop(state)
}

/**
 * @param state {GameState}
 */
function gameLoop(state) {
    const start = nowFn();
    const delta = start - state.loopStartTime;
    state.loopStartTime = start;
    state.loopDelta = delta;

    // TODO: probably need opts?
    if (state.caleb.dead && start - state.caleb.deadAt > 1000) {
        State.reset(state);
        gameLoop(state);
        return;
    }

    tick(state, delta);
    const now = nowFn();
    const remaining = state.opts.frameTimeMS - (now - start);

    if (remaining <= 0) {
        requestAnimationFrame(() => gameLoop(state));
    } else {
        setTimeout(() => requestAnimationFrame(() => gameLoop(state)), remaining);
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
