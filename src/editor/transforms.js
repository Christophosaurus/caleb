/**
 * @param {EditorState} state
 * @param {StateCB} next
 * @returns {EventCB}
 */
export function withState(state, next) {
    return function(event) {
        next(state, event)
    }
}

/**
 * @param {EditorState} state
 * @param {PlatformCB} next
 * @returns {EventCB}
 */
export function withSelectedPlatform(state, next) {
    return function(event) {
        for (const p of state.platforms) {
            if (p.selected) {
                next(state, p, event)
                return
            }
        }
    }
}


/**
 * @param {EditorState} state
 * @param {ElementCB} next
 * @returns {EventCB}
 */
export function withElement(state, next) {
    return function(event) {
        const t = /** @type {HTMLElement} */(event.target);
        if (!t.dataset) {
            return
        }

        const row = parseInt(t.dataset.row)
        const col = parseInt(t.dataset.col)
        if (isNaN(row) || isNaN(col)) {
            return
        }

        next(state, state.elements[row][col], event)
    }
}

/**
 * @param {string} t
 * @param {EventCB} next
 * @returns {EventCB}
 */
export function type(t, next) {
    return function(evt) {
        if (evt.type === t) {
            next(evt)
        }
    }
}

/**
 * @param {string | string[]} k
 * @param {EventCB} next
 * @returns {EventCB}
 */
export function key(k, next) {
    return function(event) {
        const evt = /** @type {KeyboardEvent} */(event)
        if (Array.isArray(k) && k.includes(evt.key) || evt.key === k) {
            next(evt)
        }
    }
}


/**
 * @param {ElementCB} next
 * @returns {ElementCB}
 */
export function isDown(next) {
    return function(state, es, type) {
        if (state.mouse.state !== "down") {
            return
        }

        next(state, es, type)
    }
}

/**
 * @param {Window | HTMLElement | ((evt: Event) => boolean)} target
 * @param {EventCB} next
 * @returns {EventCB}
 */
export function is(target, next) {
    return function(evt) {
        if (typeof target === "function" && target(evt) ||
            evt.target === target) {
            next(evt)
        }
    }
}

/**
 * @param {EditorState} state
 * @param {EventCB} next
 * @returns {EventCB}
 */
export function isPlatform(state, next) {
    return is(function(evt) {
        for (const p of state.platforms) {
            if (p.el === evt.target) {
                return true
            }
        }
        return false
    }, next)
}

/**
 * @param {EditorState} state
 * @param {EventCB} next
 * @returns {EventCB}
 */
export function noActivePlatform(state, next) {
    return is(function() {
        return state.activePlatform === null
    }, next)
}


/**
 * @param {HTMLElement} editor
 * @param {EventCB} next
 * @returns {EventCB}
 */
export function isEditor(editor, next) {
    return is(function(evt) {
        let curr = /** @type HTMLElement */(evt.target)
        do {
            if (editor === curr) {
                return true
            }
        } while((curr = curr.parentElement))
        return false
    }, next)
}

/**
 * @param {any} target
 * @param {EventCB} next
 * @returns {EventCB}
 */
export function not(target, next) {
    return function(evt) {
        if (evt.currentTarget !== target) {
            next(evt)
        }
    }
}




