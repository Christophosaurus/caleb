// TODO: Make this objectively better than it is now

/** @param msg {string} */
function runAssert(msg) {
    throw new Error(msg)
}

/** @param msg {string} */
export function never(msg) {
    runAssert(msg);
}

/** @param truthy {boolean}
/** @param msg {string} */
export function assert(truthy, msg) {
    if (!truthy) {
        runAssert(msg);
    }
}

