import { debugForCallCount, debugForTickCount } from "../debug.js";

const debugLog = debugForCallCount(100);

/**
 * @return {CalebInputHandlerMap}
 */
export function createCalebInputHandler() {
    const numericHandler = {
        _numericInput: [],
        0: withHold(addNumericHandler(0)),
        1: withHold(addNumericHandler(1)),
        2: withHold(addNumericHandler(2)),
        3: withHold(addNumericHandler(3)),
        4: withHold(addNumericHandler(4)),
        5: withHold(addNumericHandler(5)),
        6: withHold(addNumericHandler(6)),
        7: withHold(addNumericHandler(7)),
        8: withHold(addNumericHandler(8)),
        9: withHold(addNumericHandler(9)),
    }

    /** @param i {number} */
    function addNumericHandler(i) {
        /**
         * @param _ {GameState}
         * @param timing {InputTiming}
         * @returns {boolean}
         */
        return function(_, timing) {
            debugLog("addNumericHandler", i, timing);
            if (timing.initial) {
                numericHandler._numericInput.push(i);
            }
            return false;
        }
    }

    let activeJump = false;

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
            numericHandler._numericInput.length = 0;
            return true;
        }
    }

    const inputHandlerMap = {
        ...numericHandler,

        h: withHold(moveHL(-1)),
        l: withHold(moveHL(1)),

        /** @param state {GameState}
         * @param timing {InputTiming}
         * @returns {boolean}
         * */
        k: function(state, timing) {
            if (timing.tickHoldDuration === 0) {
                activeJump = false;
                return;
            }

            if (activeJump) {
                return;
            }

            activeJump = true;
            let number = +numericHandler._numericInput.join("")
            numericHandler._numericInput.length = 0;

            state.caleb.physics.vel.y = -(Math.max(number, 1) * 3 + 6);
        }
    };

    return inputHandlerMap;
}
