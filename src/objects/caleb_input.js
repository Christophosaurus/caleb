import { debugForTickCount } from "../debug.js";

const debugLog = debugForTickCount(100);


/**
 * @return {CalebInputHandlerMap}
 */
export function createCalebInputHandler() {
    const numericHandler = {
        _numericInput: [],
        0: addNumericHandler(0),
        1: addNumericHandler(1),
        2: addNumericHandler(2),
        3: addNumericHandler(3),
        4: addNumericHandler(4),
        5: addNumericHandler(5),
        6: addNumericHandler(6),
        7: addNumericHandler(7),
        8: addNumericHandler(8),
        9: addNumericHandler(9),
    }

    /** @param i {number} */
    function addNumericHandler(i) {
        return function() {
            numericHandler._numericInput.push(i);
        }
    }

    let activeJump = false;

    const inputHandlerMap = {
        ...numericHandler,

        /** @param state {GameState}
         * @param timing {InputTiming} */
        h: function (state, timing) {
            const hold = timing.tickHoldDuration;
            if (hold === 0) {
                state.caleb.physics.vel.x = 0;
                return;
            }

            const x = -state.opts.caleb.normWidthsPerSecond * (hold / 1000);
            state.caleb.physics.vel.x = x;
            numericHandler._numericInput.length = 0;
        },
        /** @param state {GameState}
         * @param timing {InputTiming} */
        l: function(state, timing) {
            const hold = timing.tickHoldDuration;
            if (hold === 0) {
                state.caleb.physics.vel.x = 0;
                return;
            }
            state.caleb.physics.vel.x = state.opts.caleb.normWidthsPerSecond * (hold / 1000);
            numericHandler._numericInput.length = 0;
        },

        /** @param state {GameState}
         * @param timing {InputTiming} */
        k: function(state, timing) {
            if (timing.tickHoldDuration === 0) {
                activeJump = false;
                return;
            }

            if (activeJump) {
                return;
            }

            activeJump = true;
            numericHandler._numericInput.length = 0;

            state.caleb.physics.vel.y = -9;
        }
    };

    return inputHandlerMap;
}
