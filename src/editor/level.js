import { assert } from "../assert.js";

/**
 * @param {EditorState} state
 * @param {StateCB} next
 * @returns {EventCB}
 */
function withState(state, next) {
    return function(event) {
        next(state, event)
    }
}

/**
 * @param {EditorState} state
 * @param {ElementCB} next
 * @returns {EventCB}
 */
function withElement(state, next) {
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
function type(t, next) {
    return function(evt) {
        if (evt.type !== t) {
            return
        }
        next(evt)
    }
}

/**
 * @param {ElementCB} next
 * @returns {ElementCB}
 */
function isDown(next) {
    return function(state, es, type) {
        if (state.mouse.state !== "down") {
            return
        }

        next(state, es, type)
    }
}

/**
 * @param {any} target
 * @param {EventCB} next
 * @returns {EventCB}
 */
function is(target, next) {
    return function(evt) {
        if (evt.target === target) {
            next(evt)
        }
    }
}

/**
 * @param {any} target
 * @param {EventCB} next
 * @returns {EventCB}
 */
function not(target, next) {
    return function(evt) {
        if (evt.currentTarget !== target) {
            next(evt)
        }
    }
}




/** @returns {EditorState} */
export function createEditorState() {
    return {
        elements: [],
        selectedElements: [],
        mouse: {
            startingEl: null,
            state: "invalid",
        }
    }
}

/**
 * @param {EditorState} state
 * @param {HTMLElement} editor
 * @param {HTMLElement} panel
 */
export function listen(state, editor, panel) {
    const takeAction = createActionTaken(state, editor, panel)
    editor.addEventListener("mousedown", takeAction)
    editor.addEventListener("mouseup", takeAction)
    editor.addEventListener("mouseover", takeAction)
    editor.addEventListener("mouseout", takeAction)

    panel.addEventListener("mouseover", takeAction)
    window.addEventListener("mouseup", takeAction);
    window.addEventListener("blur", takeAction);
}

/**
 * @param {EditorState} state
 */
function clear(state) {
    clearSelected(state)
    state.mouse.startingEl = null
    state.mouse.state = "invalid"
}


/**
 * @param {EditorState} state
 */
function clearSelected(state) {
    for (const el of state.selectedElements) {
        el.selected = false
    }
}

/**
 * @param {EditorState} state
 * @param {ElementState} end
 * @param {ElementState} start
 */
export function createSelected(state, end, start = state.mouse.startingEl) {
    assert(start !== null, "you must call createBox after we have selected as starting element")

    clearSelected(state)
    const rStart = Math.min(start.pos.row, end.pos.row)
    const rEnd = Math.max(start.pos.row, end.pos.row)
    const cStart = Math.min(start.pos.col, end.pos.col)
    const cEnd = Math.max(start.pos.col, end.pos.col)

    for (let r = rStart; r <= rEnd; ++r) {
        for (let c = cStart; c <= cEnd; ++c) {
            const el = state.elements[r][c]
            el.selected = true
            state.selectedElements.push(el)
        }
    }
}

/**
 * @param {EditorState} state
 * @param {ElementState} es
 */
function handleEditorDown(state, es) {
    state.mouse.state = "down"
    state.mouse.startingEl = es
}

/**
 * @param {EditorState} state
 * @param {ElementState} es
 */
function handleEditorOver(state, es) {
    createSelected(state, es)
}

/**
 * @param {EditorState} state
 */
function handleEditorOut(state) {
    //clear(state)
    //clearSelected(state)
}


/**
 * @param {EditorState} state
 * @param {ElementState} es
 */
function handleEditorUp(state, es) {
    //clear(state)
    state.mouse.state = "invalid"
}

/**
 * @param {EditorState} state
 * @param {ElementState} es
 */
function handleWindowOver(state, es) {
    clearSelected(state)
}

/**
 * @param {EditorState} state
 * @param {ElementState} es
 */
function handleWindowUp(state, es) {
    clear(state)
    state.mouse.state = "invalid"
}

/**
 * @param {EditorState} state
 * @param {ElementState} es
 */
function handleWindowBlur(state, es) {
    //clear(state)
    state.mouse.state = "invalid"
}

/** @param {EditorState} state
/** @param {any} editor
/** @param {any} panel
 */
export function createActionTaken(state, editor, panel) {
    const eDown = type("mousedown", withElement(state, handleEditorDown));
    const eOver = type("mouseover", withElement(state, isDown(handleEditorOver)));
    const eUp = type("mouseup", withElement(state, isDown(handleEditorUp)));
    const eOut = is(panel, type("mouseover", withState(state, handleEditorOut)))

    const handlers = [
        eDown,
        eOver,
        eUp,
        eOut,
    ]

    /** @param {Event} event */
    return function(event) {
        for (const h of handlers) {
            h(event)
        }
        render(state)
    }
}

/**
 * @param {EditorState} state
 */
export function render(state) {
    for (const row of state.elements) {
        for (const el of row) {
            if (el.selected) {
                el.el.classList.add("selected")
            } else {
                el.el.classList.remove("selected")
            }
        }
    }
}



