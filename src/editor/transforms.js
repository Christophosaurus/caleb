function hasParent(el, evt) {
    let curr = /** @type HTMLElement */(evt.target)
    if (curr == null) {
        return false
    }
    do {
        if (el === curr) {
            return true
        }
    } while((curr = curr.parentElement))
    return false
}

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
        if (state.activePlatform) {
            next(state, state.activePlatform, event)
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

/** @param {string} k
 * @returns {{key: string, ctrl: boolean}}
 */
function mapInput(k) {
    if (k.startsWith("C-")) {
        return {
            ctrl: true,
            key: k.split("-")[1],
        }
    }
    return {
        ctrl: true,
        key: k,
    };
}

/**
 * @param {string | string[]} k
 * @param {EventCB} next
 * @returns {EventCB}
 */
export function key(k, next) {
    const processedKeys = Array.isArray(k) ?
        k.map(mapInput) : [mapInput(k)];

    return function(event) {
        const evt = /** @type {KeyboardEvent} */(event)
        for (const p of processedKeys) {
            if (evt.key === p.key && evt.ctrlKey === p.ctrl) {
                next(evt)
                break
            }
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
export function noSelected(state, next) {
    return is(function() {
        return state.selectedElements.length === 0
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
 * @param {EditorState} state
 * @param {EventCB} next
 * @returns {EventCB}
 */
export function notControls(state, next) {
    return is(function(evt) {
        return !hasParent(state.platformControls, evt)
    }, next)
}


/**
 * @param {EditorState} state
 * @param {EventCB} next
 * @returns {EventCB}
 */
export function activePlatform(state, next) {
    return is(function() {
        return state.activePlatform !== null
    }, next)
}

/**
 * @param {EventCB} next
 * @returns {EventCB}
 */
export function isGridItem(next) {
    return is(function(evt) {
        let curr = /** @type HTMLElement */(evt.target)
        return curr?.classList?.contains("grid-item")
    }, next)
}

/**
 * @param {HTMLElement} editor
 * @param {EventCB} next
 * @returns {EventCB}
 */
export function isEditor(editor, next) {
    return is(function(evt) {
        return hasParent(editor, evt)
    }, next)
}

