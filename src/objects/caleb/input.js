import * as Input from "../../input/input.js"
//import { getRow } from "./utils.js";
//
///**
// * @param {fFtTKey} key
// * @returns {CalebInputHandlerMapCB}
// */
//function movefFtT(key) {
//    return function(state) {
//        resetJumpState(state);
//
//        state.caleb.fFtT.type = key
//        state.caleb.fFtT.startCount = state.input.anykeyCount
//        state.input.anykey = true;
//
//        return true;
//    }
//}
//
//
//
//

/**
* @param {string} key
* @param {InputHandler} next
* @returns {InputHandler}
*/
function filter(key, next) {
    return function(state, input) {
        if (key !== input.key) {
            return false;
        }
        return next(state, input);
    }
}

/**
* @param {InputHandler} next
* @returns {InputHandler}
*/
function onDown(next) {
    return function(state, input) {
        if (input.type !== "down" && input.type !== "down-up") {
            return false;
        }
        return next(state, input);
    }
}

const _0 = "0".charCodeAt(0)
const _9 = "9".charCodeAt(0)

/**
 * @param {InputHandler} next
 * @returns {InputHandler}
 */
function isNumeric(next) {
    return function(state, input) {
        const code = input.key.charCodeAt(0)
        if (code < _0 || code > _9) {
            return false;
        }
        return next(state, input);
    }
}

/**
 * @param {GameState} state
 * @param {Input} input
 * @returns boolean
 */
function numericModifier(state, input) {
    state.input.numericModifier *= 10
    state.input.numericModifier += +input.key
    return true;
}

/**
 * @param {-1 | 1} dir
 * @returns {InputHandler}
 */
function moveWB(dir) {
    return function(state) {
        if (state.caleb.dash.dashing) {
            return false;
        }

        const caleb = state.caleb;
        const dash = caleb.dash;
        const opts = caleb.opts.dash;

        dash.dashing = true;
        dash.dashDistance = opts.distance
        dash.dashStart = null
        dash.dashDir = dir

        resetJumpState(state);

        return true;
    }
}

/**
 * @param {-1 | 1} dir
 * @returns {InputHandler}
 */
function moveKJ(dir) {
    return function(state) {
        if (state.caleb.jump.noJumpTime > 0) {
            return false;
        }

        const input = state.input;
        const caleb = state.caleb;
        const jump = caleb.jump;
        const opts = caleb.opts.jump;
        const number = Math.max(state.input.numericModifier, 1)

        input.numericModifier = 0
        jump.jumping = true;
        jump.jumpDistance = number;
        jump.jumpStart = null
        jump.noJumpTime = (number * opts.noJumpMultiplier) + opts.noJumpBase;
        jump.jumpDir = dir

        resetDashState(state);

        return true;
    }
}

/**
 * @param dir {number}
 * @returns {InputHandler}
 */
function moveHL(dir) {
    return function(state) {
        state.caleb.physics.vel.x = state.opts.caleb.normWidthsPerSecond * dir
        return true;
    }
}

const h = filter("h", moveHL(-1));
const l = filter("l", moveHL(1));
const j = onDown(filter("j", moveKJ(1)));
const k = onDown(filter("k", moveKJ(-1)));
const w = onDown(filter("w", moveWB(1)));
const b = onDown(filter("b", moveWB(-1)));
const numeric = onDown(isNumeric(numericModifier))

/**
 * @param {GameState} state
 */
function handleHL(state) {
    const hInput = Input.get(state.input, "h")
    const lInput = Input.get(state.input, "l")
    if (hInput && !lInput) {
        h(state, hInput)
    } else if (!hInput && lInput) {
        l(state, lInput)
    } else if (!state.caleb.dash.dashing) {
        state.caleb.physics.vel.x = 0
    }
}

/**
 * @param {GameState} state
 * @param {number} _
 */
export function update(state, _) {
    handleHL(state);
    for (const i of state.input.inputs) {
        numeric(state, i)
        j(state, i)
        k(state, i)
        w(state, i)
        b(state, i)
    }
}

/**
 */
export function tickClear() { }

/** @returns {CalebJump} */
export function defaultJumpState() {
    return {
        jumping: false,
        jumpDistance: 0,
        noJumpTime: 0,
        jumpDir: /** @type {-1 | 1} */(1),
        jumpStart: null,
    }
}

/** @returns {CalebDash} */
export function defaultDashStat() {
    return {
        dashing: false,
        dashDir: 1,
        dashStart: null,
        dashDistance: 0,
        noDashTime: 0,
    }
}

/** @returns {fFtT} */
export function defaultfFtT() {
    return {
        type: "f",
        startCount: 0,
    }
}

/**
 * @param state {GameState}
 */
export function resetJumpState(state) {
    const jump = state.caleb.jump
    state.caleb.physics.vel.y = 0
    jump.jumping = false;
    jump.jumpDistance = 0;
    jump.noJumpTime = 0;
    jump.jumpDir = 1
    jump.jumpStart = null
}

/**
 * @param state {GameState}
 */
export function resetDashState(state) {
    const dash = state.caleb.dash
    dash.dashing = false;
    dash.dashDistance = 0;
    dash.dashDir = 1;
    dash.noDashTime = 0;
}

