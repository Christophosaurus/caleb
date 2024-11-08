export const CALEB_HEIGHT = 1
export const CALEB_WIDTH = 0.5

/**
 * @param caleb {Caleb}
 */
export function getRow(caleb) {
    const body = caleb.physics.body;
    return Math.floor(body.pos.y + body.height / 2)
}

/**
 * @param caleb {Caleb}
 */
export function getCol(caleb) {
    return Math.floor(caleb.physics.body.pos.x)
}

