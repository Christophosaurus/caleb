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
///**
// * @param dir {-1 | 1}
// * @returns {CalebInputHandlerMapCB}
// */
//function moveWB(dir) {
//    return function(state) {
//        if (state.caleb.dash.dashing) {
//            return false;
//        }
//
//        const caleb = state.caleb;
//        const dash = caleb.dash;
//        const opts = caleb.opts.dash;
//
//        dash.dashing = true;
//        dash.dashDistance = opts.distance
//        dash.dashStart = null
//        dash.dashDir = dir
//
//        resetJumpState(state);
//
//        return true;
//    }
//}
//
///**
// * @param input {number[]}
// * @param dir {-1 | 1}
// * @returns {CalebInputHandlerMapCB}
// */
//function moveKJ(input, dir) {
//    return function(state) {
//        if (state.caleb.jump.noJumpTime > 0) {
//            return false;
//        }
//
//        const caleb = state.caleb;
//        const jump = caleb.jump;
//        const opts = caleb.opts.jump;
//        const number = Math.min(Math.max(1, +input.join("")), 15)
//        jump.jumping = true;
//        jump.jumpDistance = number;
//        jump.jumpStart = null
//        jump.noJumpTime = (number * opts.noJumpMultiplier) + opts.noJumpBase;
//        jump.jumpDir = dir
//
//        resetDashState(state);
//
//        return true;
//    }
//}
//
//
//
//
///** @param i {number}
//  * @param input {number[]}
//  */
//function addNumericHandler(i, input) {
//    /**
//     * @param _ {GameState}
//     * @param timing {InputTiming}
//     * @returns {boolean}
//     */
//    return function(_, timing) {
//        if (timing.initial) {
//            input.push(i);
//        }
//        return false;
//    }
//}
//
///**
// * @param next {CalebInputHandlerMapCB}
// * @returns {CalebInputHandlerMapCB}
// */
//function onKeyDown(next) {
//    return function(state, timing) {
//        if (timing.initial) {
//            return next(state, timing)
//        }
//        return false
//    }
//}
//
///**
// * @param next {CalebInputHandlerMapCB}
// * @returns {CalebInputHandlerMapCB}
// */
//function onKeyUp(next) {
//    return function(state, timing) {
//        if (timing.done) {
//            return next(state, timing)
//        }
//        return false
//    }
//}
//
//
///**
// * @param next {CalebInputHandlerMapCB}
// * @param input {number[]}
// * @returns {CalebInputHandlerMapCB}
// */
//function clearNumericState(next, input) {
//    return function(state, timing) {
//        const out = next(state, timing);
//        input.length = 0;
//        return out;
//    }
//}
//
//
///**
// * @param next {CalebInputHandlerMapCB}
// * @returns {CalebInputHandlerMapCB}
// */
//function withHold(next) {
//    return function(state, timing) {
//        const hold = timing.tickHoldDuration;
//        if (hold === 0 && !timing.initial) {
//            return false;
//        }
//        return next(state, timing);
//    }
//}
//
///**
// * @param {CalebInputHandlerMapCB} next
// * @param {boolean} anykeyState
// * @returns {CalebInputHandlerMapCB}
// */
//function anykey(next, anykeyState) {
//    return function(state, timing) {
//        if (state.input.anykey !== anykeyState) {
//            return false;
//        }
//        return next(state, timing);
//    }
//}

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
    const input = state.input
    if (!input.hasInput) {
        return
    }

    handleHL(state);
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

