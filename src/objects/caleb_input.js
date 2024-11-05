import { debugForCallCount, debugForTickCount } from "../debug.js";

const debugLog = debugForCallCount(100);

/**
 * @param input {number[]}
 * @returns {CalebInputHandlerMapCB}
 */
function moveK(input) {
    let activeJump = false;
    /** @param state {GameState}
     * @param timing {InputTiming}
     * @returns {boolean}
     * */
    return function(state, timing) {
        if (timing.tickHoldDuration === 0) {
            activeJump = false;
            return;
        }

        if (activeJump) {
            return;
        }

        activeJump = true;
        let number = +input.join("")

        state.caleb.physics.vel.y = -(Math.max(number, 1) * 3 + 6);
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
        k: clearNumericState(moveK(numericInput), numericInput),
    };

    return inputHandlerMap;
}
