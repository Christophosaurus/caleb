let nowFn = Date.now;

/** @param fn {() => number} */
export function setNow(fn) {
    nowFn = fn;
}

export function now() {
    return nowFn();
}

/**
 * @param {Collidable} coll
 * @returns {Collidable}
 */
export function clonePhysics(coll) {
    const physics = coll.physics;

    return {
        physics: {
            current: {
                body: physics.current.body.clone(),
                acc: physics.current.acc.clone(),
                vel: physics.current.vel.clone(),
            },
            next: {
                body: physics.next.body.clone(),
                acc: physics.next.acc.clone(),
                vel: physics.next.vel.clone(),
            }
        }
    }
}
