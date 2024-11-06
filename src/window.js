const RELATIVE_LINE_WIDTH = 2
const GAME_INFO_HEIGHT = 2
export const WIDTH = 32 + RELATIVE_LINE_WIDTH
export const HEIGHT = 24 + GAME_INFO_HEIGHT

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
 * @param canvas {HTMLCanvasElement}
 * @param projectable {CanvasProjectable}
 * @returns [number, number]
 */
export function project(canvas, projectable) {
    const normWidth = canvas.width / WIDTH
    const normHeight = canvas.height / HEIGHT
    const body = projectable.physics.body;

    projectable.renderX = xZero(normWidth) + Math.floor(body.pos.x * normWidth);
    projectable.renderY = yZero(normHeight) + Math.floor(body.pos.y * normHeight);
    projectable.renderWidth = Math.floor(body.width * normWidth);
    projectable.renderHeight = Math.floor(body.height * normHeight);
}

/**
 * @param canvas {HTMLCanvasElement}
 */
export function resizeCanvas(canvas) {
    let width = window.innerWidth;
    let height = window.innerHeight;

    const wRatio = width / WIDTH
    const hRatio = height / HEIGHT

    if (wRatio > hRatio) {
        width -= (wRatio - hRatio) * WIDTH
    } else {
        height -= (hRatio - wRatio) * HEIGHT
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

