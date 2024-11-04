export const WIDTH = 32
export const HEIGHT = 24

/**
 * @param canvas {HTMLCanvasElement}
 */
export function calculateCanvasPortions(canvas) {
    return {
        hUnits: canvas.height / HEIGHT,
    }
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

