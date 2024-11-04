
let nowFn = Date.now;

/** @param fn {() => number} */
export function setNow(fn) {
    nowFn = fn;
}

export function now() {
    return nowFn();
}
