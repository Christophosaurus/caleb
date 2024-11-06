import * as Input from "./input/input.js";
import * as Caleb from "./objects/caleb.js";
import * as Debugger from "./debug.js";
import * as Platforms from "./objects/platform.js";
import * as Window from "./window.js";
import { now as nowFn } from "./utils.js";
import { Vector2D } from "./math/vector.js";
import { AABB } from "./math/aabb.js";

/** @type UpdateableModule[] */
const updateables = [
    Input,
    Caleb,
    Debugger,
];

/** @type RenderableModule[] */
const renderables = [
    Caleb,
    Platforms,
];

/**
 * @param state {GameState}
 */
function projectStaticObjects(state) {
    for (const p of state.platforms) {
        Window.project(state.ctx.canvas, p);
    }
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
        caleb: Caleb.createCaleb(gameopts.caleb, new Vector2D(1, 1)),
        platforms: [],
        loopStartTime: 0,
        loopDelta: 0,
        ctx,
        input: inputState,
    };

    // TODO environment hydration, platforms? moving things? burnings?
    state.platforms.push(
        Platforms.createPlatform(new AABB(new Vector2D(0, 10), 10, 1)),
        Platforms.createPlatform(new AABB(new Vector2D(13, 8), 10, 1)),
        Platforms.createPlatform(new AABB(new Vector2D(5, 2), 2, 1)),
        Platforms.createPlatform(new AABB(new Vector2D(0, 0), 1, Window.WIDTH)),
        Platforms.createLetteredWall(new AABB(new Vector2D(Window.WIDTH - 1, 6), 1, 3),
            [" ", "b", " "]
        ),
    );

    projectStaticObjects(state);

    ctx.imageSmoothingEnabled = false;

    window.addEventListener("resize", function() {
        projectStaticObjects(state);
    });

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
