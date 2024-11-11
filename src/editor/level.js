import { assert } from "../assert.js";
import * as Position from "./pos.js"

/**
 * @param {EditorState} state
 * @param {ElementCB} next
 * @returns {(event: Event) => void}
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
            state.mouse.state = "invalid"
            return
        }
        next(state, state.elements[row][col], event)
    }
}

/**
 * @param {string} t
 * @param {ElementCB} next
 * @returns {ElementCB}
 */
function type(t, next) {
    return function(s, es, evt) {
        if (evt.type !== t) {
            return
        }
        next(s, es, evt)
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
 * @param {ElementCB} next
 * @returns {ElementCB}
 */
function isWindow(next) {
    return function(state, es, evt) {
        if (evt.currentTarget === window) {
            next(state, es, evt)
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
 */
export function listen(state, editor) {
    const takeAction = createActionTaken(state)
    editor.addEventListener("mousedown", takeAction)
    editor.addEventListener("mouseup", takeAction)
    editor.addEventListener("mouseover", takeAction)
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
    //clearSelected(state)
}

/**
 * @param {EditorState} state
 * @param {ElementState} es
 */
function handleWindowUp(state, es) {
    //clear(state)
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

/** @param {EditorState} state */
export function createActionTaken(state) {
    const eDown = withElement(state, type("mousedown", handleEditorDown));
    const eOver = withElement(state, isDown(type("mouseover", handleEditorOver)));
    const eUp = withElement(state, isDown(type("mouseup", handleEditorUp)));
    const wOver = withElement(state, isWindow(isDown(type("mouseover", handleWindowOver))));
    const wUp = withElement(state, isWindow(isDown(type("mouseup", handleWindowUp))));
    const wBlur = withElement(state, isWindow(isDown(type("blur", handleWindowBlur))));

    const handlers = [
        eDown,
        eOver,
        eUp,
        wOver,
        wUp,
        wBlur,
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



