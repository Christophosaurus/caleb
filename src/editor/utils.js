// TODO should i have this contain the current state of the board?
// Or do i pass in the current state?
//
// The reason why is the project and unproject require state object to be passed in which causes the platform to have back reference to the state it belongs to... which is weird
import { Vector2D } from "../math/vector.js";
import { GAME_HEIGHT, GAME_WIDTH } from "../window.js";

const MIN_W = 0
const MAX_W = 10 + GAME_WIDTH
const MIN_H = 0
const MAX_H = 10 + GAME_HEIGHT

/**
 * @param {Vector2D} pos
 * @returns {Vector2D}
 */
export function bound(pos) {
    pos.x = Math.min(MAX_W, Math.max(MIN_W, pos.x))
    pos.y = Math.min(MAX_H, Math.max(MIN_H, pos.y))
    return pos
}

/**
 * @param {EditorState} state
 * @param {Vector2D} pos
 * @param {(n: number) => number} zero
 * @returns {Vector2D}
 */
export function project(state, pos, zero = Math.floor) {
    const rect = state.elements[0][0].el.getBoundingClientRect()
    const w = rect.width
    const h = rect.height
    return new Vector2D(zero(pos.x / w), zero(pos.y / h));
}

/**
 * @param {EditorState} state
 * @param {Vector2D} pos
 * @returns {Vector2D}
 */
export function unproject(state, pos) {
    const editorRect = state.editor.getBoundingClientRect()
    const rect = state.elements[0][0].el.getBoundingClientRect()

    const w = rect.width
    const h = rect.height

    return new Vector2D(Math.floor(pos.x * w + editorRect.left), Math.floor(pos.y * h + editorRect.top));
}

/**
 * @param {MouseEvent} evt
 * @returns Vector2D
 */
export function toVec(evt) {
    return new Vector2D(evt.clientX, evt.clientY)
}

