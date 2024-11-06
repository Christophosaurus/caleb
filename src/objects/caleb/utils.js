
/**
 * @param caleb {Caleb}
 */
export function getRow(caleb) {
    const body = caleb.physics.body;
    return Math.floor(body.pos.y + body.height / 2)
}

