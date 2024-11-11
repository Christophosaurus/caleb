import { GAME_WIDTH } from "../window.js"

/**
 * @param {Position} pos
 * @returns {number}
 */
export function project(pos) {
    return GAME_WIDTH * pos.row + pos.col
}

/**
 * @param {Position} a
 * @param {Position} b
 * @returns {boolean}
 */
export function gt(a, b) {
    return project(a) > project(b)
}

/**
 * @param {Position} a
 * @param {Position} b
 * @returns {boolean}
 */
export function equal(a, b) {
    return project(a) === project(b)
}

