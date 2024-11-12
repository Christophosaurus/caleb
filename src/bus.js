
/** @type {BusListeners} */
let listeners = {};

/**
 * @param {BusType} type
 * @param {BusArg} args
 */
export function emit(type, args) {
    for (const cb of listeners[type] || []) {
        cb(args)
    }
}

/**
 * @template {keyof BusArgMap} K
 * @param {K} type
 * @param {(args: BusArgMap[K]) => void} cb
 */
export function listen(type, cb) {
    let cbs = listeners[type]
    if (!cbs) {
        cbs = listeners[type] = []
    }
    cbs.push(cb)
}

/**
 * @template {keyof BusArgMap} K
 * @param {K} type
 * @param {(args: BusArgMap[K]) => void} cb
 */
export function remove(type, cb) {
    const cbs = listeners[type]
    if (!cbs) {
        return
    }

    const idx = cbs.indexOf(cb)
    if (idx >= 0) {
        cbs.splice(idx, 1)
    }
}

export function clear() {
    listeners = {}
}
