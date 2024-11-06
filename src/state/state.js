import * as Utils from "../utils.js"
import * as Window from "../window.js"
import * as Caleb from "../objects/caleb/caleb.js"
import * as Level from "../objects/level/level.js"
import { Vector2D } from "../math/vector.js"
import { AABB } from "../math/aabb.js"

/**
 * @param state {GameState}
 */
export function projectStaticObjects (state){
    for (const p of state.level.platforms) {
        Window.project(state.ctx.canvas, p);
    }
}

/**
 * @param state {GameState}
 */
export function reset(state) {
    state.caleb = Caleb.createCaleb(state)
    state.gameOver = false;
    state.loopStartTime = Utils.now()
    state.loopDelta = 0;

    projectStaticObjects(state);
}

/**
 * @param {GameOptions} opts
 * @param {InputState} input
 * @param {HTMLCanvasElement} canvas
 * @param {LevelSet} level
 * @returns {GameState}
 */
export function createGameState(opts, input, canvas, level) {
    /** @type {GameState} */
    const state = {
        opts,
        level,

        caleb: null,
        gameOver: false,
        loopStartTime: 0,
        loopDelta: 0,
        ctx: canvas.getContext("2d"),
        rn: {zero: 1},
        input,
    };

    return state
}
