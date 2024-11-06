import { debugForCallCount, debugForTickCount } from "../debug.js";
import * as Ease from "../math/ease.js";

const debugLog = debugForCallCount(100);

/**
 * @param input {number[]}
 * @returns {CalebInputHandlerMapCB}
 */
function moveK(input) {
    return function(state) {
        if (state.caleb.noJumpTime > 0) {
            return false;
        }

        const caleb = state.caleb;
        const opts = caleb.opts;
        const number = Math.max(1, +input.join(""))
        caleb.jumping = true;
        caleb.jumpDistance = number;
        caleb.jumpStart = caleb.physics.body.pos.clone();
        caleb.noJumpTime = (number * opts.noJumpMultiplier) + opts.noJumpBase;
        return true;
    }
}


/**
 * @param dir {number}
 * @returns {CalebInputHandlerMapCB}
 */
function moveHL(dir) {
    /**
     * @param state {GameState}
     * @param timing {InputTiming}
     * @returns {boolean}
     */
    return function(state, timing) {
        const hold = timing.tickHoldDuration;
        const x = state.opts.caleb.normWidthsPerSecond * (hold / state.loopDelta);

        state.caleb.physics.vel.x = dir * x;
        return true;
    }
}

/** @param i {number}
  * @param input {number[]}
  */
function addNumericHandler(i, input) {
    /**
     * @param _ {GameState}
     * @param timing {InputTiming}
     * @returns {boolean}
     */
    return function(_, timing) {
        if (timing.initial) {
            input.push(i);
        }
        return false;
    }
}

/**
 * @param next {CalebInputHandlerMapCB}
 * @param input {number[]}
 * @returns {CalebInputHandlerMapCB}
 */
function clearNumericState(next, input) {
    return function(state, timing) {
        const out = next(state, timing);
        input.length = 0;
        return out;
    }
}


/**
 * @param next {CalebInputHandlerMapCB}
 * @returns {CalebInputHandlerMapCB}
 */
function withHold(next) {
    return function(state, timing) {
        const hold = timing.tickHoldDuration;
        if (hold === 0) {
            if (timing.initial) {
                console.log("hm... 0 hold..?", timing);
            }
            return false;
        }
        return next(state, timing);
    }
}

/**
 * @return {CalebInputHandlerMap}
 */
export function createCalebInputHandler() {
    /** @type number[] */
    const numericInput = []
    const inputHandlerMap = {
        0: withHold(addNumericHandler(0, numericInput)),
        1: withHold(addNumericHandler(1, numericInput)),
        2: withHold(addNumericHandler(2, numericInput)),
        3: withHold(addNumericHandler(3, numericInput)),
        4: withHold(addNumericHandler(4, numericInput)),
        5: withHold(addNumericHandler(5, numericInput)),
        6: withHold(addNumericHandler(6, numericInput)),
        7: withHold(addNumericHandler(7, numericInput)),
        8: withHold(addNumericHandler(8, numericInput)),
        9: withHold(addNumericHandler(9, numericInput)),
        h: withHold(moveHL(-1)),
        l: withHold(moveHL(1)),
        k: withHold(clearNumericState(moveK(numericInput), numericInput)),
    };

    return inputHandlerMap;
}
