import * as Input from "./input/input.js";
import * as Caleb from "./objects/caleb/caleb.js";
import * as CalebInput from "./objects/caleb/input.js";
import * as Debugger from "./debug.js";
import * as DebugRender from "./debug-render.js";
import * as Level from "./objects/level/level.js"
import * as Levels from "./objects/level/levels/levels.js";
import * as RN from "./objects/relative_numbers.js";
import * as State from "./state/state.js";

/** @type UpdateableModule[] */
const inputs = [
    Input,
    CalebInput,
    Debugger,
    RN,
]

/** @type UpdateAndApplyModule[] */
const updateables = [
    Level,
    Caleb,
    DebugRender,
];

/** @type RenderableModule[] */
const renderables = [
    Caleb,
    Level,
    RN,
    DebugRender,
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

    // @ts-ignore
    window.state = state

    Input.listenTo(canvas, inputState);
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
    const start = state.now()
    const delta = start - state.loopStartTime;
    state.loopStartTime = start;
    state.loopDelta = delta;

    // TODO probably need opts?
    if (state.caleb.dead && start - state.caleb.deadAt > 1000) {
        State.reset(state);
        gameLoop(state);
        return;
    }

    if (state.levelChanged) {
        state.levelChanged = false;
        State.projectStaticObjects(state)
    }

    tick(state, delta);

    const now = state.now()
    const remaining = state.opts.frameTimeMS - (now - start);

    if (remaining <= 0) {
        requestAnimationFrame(() => gameLoop(state));
    } else {
        setTimeout(() => requestAnimationFrame(() => gameLoop(state)), remaining);
    }
}

/**
 * @param {GameState} state
 * @param {number} delta
 */
function tick(state, delta) {
    state.tick++

    for (const input of inputs) {
        input.update(state, delta);
    }

    let deltaRemaining = delta
    while (deltaRemaining > 0) {
        const time = Math.min(state.opts.tickTimeMS, deltaRemaining)
        for (const u of updateables) {
            u.update(state, time);
        }
        for (const u of updateables) {
            u.check(state, time);
        }
        for (const u of updateables) {
            u.apply(state, time);
        }
        deltaRemaining -= time
    }

    const ctx = state.getCtx()
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    for (const r of renderables) {
        r.render(state);
    }

    for (const input of inputs) {
        input.tickClear(state);
    }

    for (const u of updateables) {
        u.tickClear(state);
    }
}

/**
 * @param {GameState} state
 * @param {number} delta
 */
export function renderlessTick(state, delta) {
    state.tick++

    for (const input of inputs) {
        input.update(state, delta);
    }

    let deltaRemaining = delta
    while (deltaRemaining > 0) {
        const time = Math.min(state.opts.tickTimeMS, deltaRemaining)
        for (const u of updateables) {
            u.update(state, time);
        }
        for (const u of updateables) {
            u.check(state, time);
        }
        for (const u of updateables) {
            u.apply(state, time);
        }
        deltaRemaining -= time
    }

    for (const input of inputs) {
        input.tickClear(state);
    }

    for (const u of updateables) {
        u.tickClear(state);
    }
}
