import * as Input from "./input/input.js";
import * as Caleb from "./objects/caleb/caleb.js";
import * as CalebInput from "./objects/caleb/input.js";
import * as Debugger from "./debug.js";
import * as DebugRender from "./debug-render.js";
import * as Level from "./objects/level/level.js"
import * as RN from "./objects/relative_numbers.js";
import * as State from "./state/state.js";

/** @type UpdateableModule[] */
const updateables = [ ]

/** @type UpdateAndApplyModule[] */
const applyables = [ ];

/** @type RenderableModule[] */
const renderables = [ ];

/**
 * @param {GameState} state
 * @param {GameLoop} loop
 * @param {GameTick[]} ticks
 * @param {() => void} done
 * @param {number} until
 */
export function gameRunner(
    state,
    loop,
    ticks,
    done,
    until = 0,
) {
    function onLoop() {
        for (const tick of ticks) {
            tick(state)
        }

        if (until === 0 && state.tick <= until) {
            loop(onLoop)
        } else {
            done()
        }
    }

    loop(onLoop)
}

export function clear() {
    applyables.length = 0
    renderables.length = 0
    updateables.length = 0
}

export function addStandardBehaviors() {
    updateables.push(Input, CalebInput, Debugger, RN)
    applyables.push(Level, Caleb, DebugRender)
    renderables.push(Caleb, Level, RN, DebugRender)
}

/** @param {UpdateableModule} update */
export function addUpdater(update) {
    updateables.push(update)
}

/** @param {UpdateAndApplyModule} apply */
export function addApplyer(apply) {
    applyables.push(apply)
}

/** @param {RenderableModule} render */
export function addRenderer(render) {
    renderables.push(render)
}

/**
 * @param {GameState} state
 * @param {number} delta
 */
export function tickWithRender(state, delta) {
    state.tick++

    // TODO probably need opts?
    if (state.caleb.dead && state.loopStartTime - state.caleb.deadAt > 1000) {
        State.reset(state);
        return;
    }

    if (state.levelChanged) {
        state.levelChanged = false;
        State.projectStaticObjects(state)
    }

    for (const input of updateables) {
        input.update(state, delta);
    }

    let deltaRemaining = delta
    while (deltaRemaining > 0) {
        const time = Math.min(state.opts.tickTimeMS, deltaRemaining)
        for (const u of applyables) {
            u.update(state, time);
        }
        for (const u of applyables) {
            u.check(state, time);
        }
        for (const u of applyables) {
            u.apply(state, time);
        }
        deltaRemaining -= time
    }

    const ctx = state.getCtx()
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    for (const r of renderables) {
        r.render(state);
    }

    for (const input of updateables) {
        input.tickClear(state);
    }

    for (const u of applyables) {
        u.tickClear(state);
    }
}

/**
 * @param {GameState} state
 * @param {number} delta
 */
export function tickWithoutRender(state, delta) {
    state.tick++

    // TODO probably need opts?
    if (state.caleb.dead && state.loopStartTime - state.caleb.deadAt > 1000) {
        State.reset(state);
        return;
    }

    if (state.levelChanged) {
        state.levelChanged = false;
    }

    for (const input of updateables) {
        input.update(state, delta);
    }

    let deltaRemaining = delta
    while (deltaRemaining > 0) {
        const time = Math.min(state.opts.tickTimeMS, deltaRemaining)
        for (const u of applyables) {
            u.update(state, time);
        }
        for (const u of applyables) {
            u.check(state, time);
        }
        for (const u of applyables) {
            u.apply(state, time);
        }
        deltaRemaining -= time
    }

    for (const input of updateables) {
        input.tickClear(state);
    }

    for (const u of applyables) {
        u.tickClear(state);
    }
}

/**
 * @param {GameState} state
 * @returns {GameLoop}
 */
export function createGameLoop(state) {

    /**
    * @param {number} start
    * @param {() => void} cb
    */
    function runCb(cb, start) {
        const delta = state.now() - start
        state.loopStartTime = state.now();
        state.loopDelta = delta;
        cb()
    }

    return function(cb) {
        const start = state.now()
        const goal = state.loopStartTime + state.opts.frameTimeMS

        if (start > goal) {
            requestAnimationFrame(() => runCb(cb, start))
        } else {
            setTimeout(() => runCb(cb, start), goal - start);
        }
    }
}

/**
 * @param {GameState} state
 * @param {(time: number) => void} setTime
 * @returns {GameLoop}
 */
export function createSimulatedGameLoop(state, setTime) {
    return function(cb) {
        setTime(state.loopStartTime + state.opts.frameTimeMS)
        state.loopStartTime = state.now();
        state.loopDelta = state.opts.frameTimeMS
        cb()
    }
}
