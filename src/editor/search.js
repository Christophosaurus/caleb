import * as State from "./state.js"

/**
 * @param {HTMLElement} el
 * @param {number} x
 * @param {number} y
 * @returns {boolean}
 */
function within(el, x, y) {
    return el.offsetTop <= y && el.offsetTop + el.offsetHeight > y &&
        el.offsetLeft <= x && el.offsetLeft + el.offsetWidth > x;
}

/**
 * @param {EditorState} state
 * @param {Event} event
 * @returns {EditorPlatform | null}
 */
export function platform(state, event) {
    if (!event.type.includes("mouse")) {
        return null
    }
    const evt = /** @type {MouseEvent} */(event)

    const x = evt.clientX
    const y = evt.clientY
    const platforms = State.platforms(state)

    for (const platform of platforms) {
        if (within(platform.el, x, y)) {
            return platform
        }
    }

    return null
}



/**
 * @param {EditorState} state
 * @param {Event} event
 * @returns {ElementState | null}
 */
export function gridItem(state, event) {
    if (!event.type.includes("mouse")) {
        return null
    }
    const evt = /** @type {MouseEvent} */(event)

    const x = evt.clientX
    const y = evt.clientY

    // TODO technically i can binary search over this 2D array, once with Y and once with X
    // Since its 2D and square, i can do both the X and the Y at the same time
    /** @type {ElementState | null} */
    let found = null
    outer: for (const row of state.elements) {
        const first = row[0]
        if (first.el.offsetTop + first.el.offsetHeight < y) {
            continue
        }
        for (const el of row) {
            if (el.el.offsetLeft + el.el.offsetWidth < x) {
                continue
            }
            found = el
            break outer
        }
    }

    return found
}


