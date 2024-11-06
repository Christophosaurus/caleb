import * as Input from "./input/input.js";
import * as Caleb from "./objects/caleb.js";
import * as Debugger from "./debug.js";
import * as Platforms from "./objects/platform.js";
import * as Window from "./window.js";
import * as RN from "./objects/relative_numbers.js";
import { now as nowFn } from "./utils.js";
import { Vector2D } from "./math/vector.js";
import { AABB } from "./math/aabb.js";

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
    Platforms,
    RN,
];

/**
 * @param state {GameState}
 */
function projectStaticObjects (state){
    for (const p of state.level.platforms) {
        Window.project(state.ctx.canvas, p);
    }
}

/**
 * @param state {GameState}
 */
function reset(state) {
    state.caleb = Caleb.createCaleb(state)
    state.gameOver = false;
    state.loopStartTime = nowFn()
    state.loopDelta = 0;

    projectStaticObjects(state);
}

/**
 * @param canvas {HTMLCanvasElement}
 * @param gameopts {GameOptions}
 */
export function startGame(canvas, gameopts) {

    const ctx = canvas.getContext("2d");
    const inputState = Input.createInputState();
    Input.listenForKeyboard(inputState, canvas);

    /** @type {GameState} */
    const state = {
        opts: gameopts,
        caleb: null,
        level: {
            platforms: [
                Platforms.createPlatform(new AABB(new Vector2D(0, 10), 10, 1)),
            ],
            initialPosition: new Vector2D(10, 1),
        },
        gameOver: false,
        loopStartTime: 0,
        loopDelta: 0,
        ctx,
        rn: {zero: 1},
        input: inputState,
    };

    ctx.imageSmoothingEnabled = false;

    window.addEventListener("resize", function() {
        projectStaticObjects(state);
    });

    reset(state);
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
    state.loopDelta = delta;

    // TODO: probably need opts?
    if (state.caleb.dead && start - state.caleb.deadAt > 1000) {
        reset(state);
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
