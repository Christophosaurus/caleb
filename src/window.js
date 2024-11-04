/**
 * @param canvas {HTMLCanvasElement}
 */
export function resizeCanvas(canvas) {
    let width = window.innerWidth;
    let height = window.innerHeight;

    const wRatio = width / 16
    const hRatio = height / 9

    if (wRatio > hRatio) {
        width -= (wRatio - hRatio) * 16
    } else {
        height -= (hRatio - wRatio) * 9
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

