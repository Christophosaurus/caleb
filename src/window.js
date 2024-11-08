import { AABB } from "./math/aabb.js"

export const RELATIVE_LINE_WIDTH = 2
export const GAME_INFO_HEIGHT = 2
export const GAME_WIDTH = 32
export const GAME_HEIGHT = 24
export const FULL_WIDTH = GAME_WIDTH + RELATIVE_LINE_WIDTH
export const FULL_HEIGHT = GAME_HEIGHT + GAME_INFO_HEIGHT

/**
 * @param normWidth {number}
 * @returns {number}
 */
function xZero(normWidth) {
    return normWidth * RELATIVE_LINE_WIDTH;
}

/**
 * @param normHeight {number}
 * @returns {number}
 */
function yZero(normHeight) {
    return normHeight * GAME_INFO_HEIGHT;
}

/**
 * I am positive i can make this better for "efficiency" but i am also using
 * javascript, lets... deal with that shit later, and by later i mean when
 * i inevitably abondon this project
 *
 * @param {HTMLCanvasElement} canvas
 * @param {CanvasProjectable} projectable
 * @param {AABB} body
 * @returns [number, number]
 */
export function project(canvas, projectable, body) {
    const normWidth = canvas.width / FULL_WIDTH
    const normHeight = canvas.height / FULL_HEIGHT

    projectable.renderX = xZero(normWidth) + Math.floor(body.pos.x * normWidth);
    projectable.renderY = yZero(normHeight) + Math.floor(body.pos.y * normHeight);
    projectable.renderWidth = Math.floor(body.width * normWidth);
    projectable.renderHeight = Math.floor(body.height * normHeight);
}

/**
 * @param {HTMLCanvasElement} canvas
 * @param {AABB} body
 * @returns {[number, number, number, number]}
 */
export function projectAABB(canvas, body) {
    const normWidth = canvas.width / FULL_WIDTH
    const normHeight = canvas.height / FULL_HEIGHT

    return [
        xZero(normWidth) + Math.floor(body.pos.x * normWidth),
        yZero(normHeight) + Math.floor(body.pos.y * normHeight),
        Math.floor(body.width * normWidth),
        Math.floor(body.height * normHeight),
    ]
}

/**
 * @param canvas {HTMLCanvasElement}
 * @param x {number}
 * @param y {number}
 * @returns [number, number]
 */
export function projectCoords(canvas, x, y) {
    const normWidth = canvas.width / FULL_WIDTH
    const normHeight = canvas.height / FULL_HEIGHT
    return [
        xZero(normWidth) + Math.floor(x * normWidth),
        yZero(normHeight) + Math.floor(y * normHeight),
    ];
}


/**
 * @param canvas {HTMLCanvasElement}
 * @param x {number}
 * @param y {number}
 * @returns [number, number]
 */
export function projectAbsoluteCoords(canvas, x, y) {
    const normWidth = canvas.width / FULL_WIDTH
    const normHeight = canvas.height / FULL_HEIGHT
    return [Math.floor(x * normWidth), Math.floor(y * normHeight)];
}

/**
 * @param canvas {HTMLCanvasElement}
 * @returns number
 */
export function getFontSize(canvas) {
    return Math.floor(canvas.height / (FULL_HEIGHT * 1.3))
}

/**
 * @param canvas {HTMLCanvasElement}
 */
export function resizeCanvas(canvas) {
    let width = window.innerWidth;
    let height = window.innerHeight;

    const wRatio = width / FULL_WIDTH
    const hRatio = height / FULL_HEIGHT

    if (wRatio > hRatio) {
        width -= (wRatio - hRatio) * FULL_WIDTH
    } else {
        height -= (hRatio - wRatio) * FULL_HEIGHT
    }

    canvas.width = Math.floor(width)
    canvas.height = Math.floor(height)
}

/**
 * @param canvas {HTMLCanvasElement}
 */
export function listenToChanges(canvas) {
    window.addEventListener("resize", function() {
        resizeCanvas(canvas);
    });
}

