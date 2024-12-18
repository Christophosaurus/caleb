export const CALEB_HEIGHT = 1
export const CALEB_WIDTH = 0.5

/**
 * @param caleb {Caleb}
 * @returns {number}
 */
export function getRow(caleb) {
    const body = caleb.physics.current.body;
    return Math.floor(body.pos.y + body.height / 2)
}

/**
 * @param {Caleb} caleb
 * @returns {number}
 */
export function getNextRow(caleb) {
    const body = caleb.physics.next.body;
    return Math.floor(body.pos.y + body.height / 2)
}

/**
 * @param caleb {Caleb}
 * @returns {number}
 */
export function getCol(caleb) {
    return Math.floor(caleb.physics.current.body.pos.x)
}

/**
 * @param caleb {Caleb}
 * @returns {number}
 */
export function getNextCol(caleb) {
    return Math.floor(caleb.physics.next.body.pos.x)
}

/**
 * @param caleb {Caleb}
 * @returns {number}
 */
export function getNextX(caleb) {
    return caleb.physics.next.body.pos.x
}

