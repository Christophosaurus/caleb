import * as CalebUtils from "../objects/caleb/utils.js"
import * as Level from "../objects/level/level.js"
import * as Input from "../input/input.js"

/**
 * @param {InputState} is
 * @param {() => number} rand
 * @returns {SimState}
 */
export function createSimState(is, rand) {
    return {
        rand,
        input: is,
    };
}


/**
 * @param {GameState} gstate
 * @param {SimState} state
 * @returns {SimKeyAction}
 */
function getNextAction(gstate, state) {
    const fLetters = Level.getLettersByRow(gstate, CalebUtils.getRow(gstate.caleb));
    return {
    }
}

/**
 * @param {GameState} gstate
 * @param {SimState} state
 * @param {number} delta
 */
export function tick(gstate, state, delta) {
}



