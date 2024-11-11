import { assert } from "../assert.js";
import { AABB, from2Vecs } from "../math/aabb.js";
import { Vector2D } from "../math/vector.js";

/**
 * @param {ElementState[]} elements
 * @returns {EditorPlatform}
 */
function createPlatform(elements) {
    const start = elements[0]
    const end = elements[elements.length - 1]

    console.log("start", start.pos, "end", end.pos)
    return {
        selected: false,
        AABB: from2Vecs(start.pos, end.pos),
        behaviors: {},
        el: null,
    }
}

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
 * @param {Window | HTMLElement | ((evt: Event) => boolean)} target
 * @param {EventCB} next
 * @returns {EventCB}
 */
function is(target, next) {
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
function isPlatform(state, next) {
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
 * @param {HTMLElement} editor
 * @param {EventCB} next
 * @returns {EventCB}
 */
function isEditor(editor, next) {
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
        platforms: [],
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
 * @param {(state: EditorState) => void} render
 */
export function listen(state, editor, panel, render) {
    const createPlatform = panel.querySelector(".create-platform")

    const takeAction = createActionTaken(state, editor, {
        panel,
        createPlatform,
    }, render)

    window.addEventListener("mousedown", takeAction)
    window.addEventListener("mouseup", takeAction)
    window.addEventListener("mouseover", takeAction)
    window.addEventListener("mouseout", takeAction)
    window.addEventListener("click", takeAction)
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
    state.selectedElements.length = 0
}

/**
 * @param {EditorState} state
 * @param {ElementState} end
 * @param {ElementState} start
 */
export function createSelected(state, end, start = state.mouse.startingEl) {
    assert(start !== null, "you must call createBox after we have selected as starting element")

    clearSelected(state)
    const rStart = Math.min(start.pos.y, end.pos.y)
    const rEnd = Math.max(start.pos.y, end.pos.y)
    const cStart = Math.min(start.pos.x, end.pos.x)
    const cEnd = Math.max(start.pos.x, end.pos.x)

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
    console.log("ed", es.el.dataset.row, es.el.dataset.col)
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
 */
function handleCreatePlatform(state) {
    const selected = state.selectedElements
    if (selected.length > 0) {
        const p = createPlatform(selected)
        state.platforms.push(p)
    }

    clear(state)
}

/**
 * @param {EditorState} state
 * @param {Event} evt
 */
function handleSelectPlatform(state, evt) {
    let found = null
    for (const p of state.platforms) {
        if (evt.target === p.el) {
            found = p
            break
        }
    }

    console.log("found!!", found)
    assert(found !== null, "unable to find the platform")
    found.selected = true
}

/** @param {EditorState} state
/** @param {any} editor
/** @param {PanelItems} panel
/** @param {(state: EditorState) => void} render
 */
export function createActionTaken(state, editor, panel, render) {
    const eDown = isEditor(editor, type("mousedown", withElement(state, handleEditorDown)))
    const eOver = isEditor(editor, type("mouseover", withElement(state, isDown(handleEditorOver))))
    const eUp = isEditor(editor, type("mouseup", withElement(state, isDown(handleEditorUp))))
    const eOut = is(panel.panel, type("mouseover", withState(state, handleEditorOut)))
    const createPlatform = is(panel.createPlatform, type("click", withState(state, handleCreatePlatform)))
    const selectPlatform = isPlatform(state, type("mousedown", withState(state, handleSelectPlatform)))

    const handlers = [
        eDown,
        eOver,
        eUp,
        eOut,
        createPlatform,
        selectPlatform,
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
 * @param {HTMLElement} app
 */
export function createRender(app) {
    /**
     * @param {EditorState} state
     */
    return function(state) {
        for (const row of state.elements) {
            for (const el of row) {
                if (el.selected) {
                    el.el.classList.add("selected")
                } else {
                    el.el.classList.remove("selected")
                }
            }
        }

        for (const plat of state.platforms) {
            renderPlatform(state, plat, app)
        }

    }
}

/**
 * @param {EditorState} state
* @param {EditorPlatform} platform
* @param {HTMLElement} app
*/
function renderPlatform(state, platform, app) {
    const editor = app.querySelector("#editor")
    assert(!!editor, "editor has to exist in the app")

    if (platform.el === null) {
        platform.el = document.createElement("div")
        editor.appendChild(platform.el)
        platform.el.classList.add("platform")
    }

    const aabb = platform.AABB
    const pos = aabb.pos
    const start = state.elements[pos.y][pos.x]

    const rect = start.el.getBoundingClientRect()
    const w = rect.width
    const h = rect.height
    const pW = w * (aabb.width + 1)
    const pH = h * (aabb.height + 1)

    platform.el.style.width = `${Math.ceil(pW)}px`
    platform.el.style.height = `${Math.ceil(pH)}px`
    platform.el.style.top = `${Math.ceil(rect.top)}px`
    platform.el.style.left = `${Math.ceil(rect.left)}px`

    if (state.mouse.state === "down") {
        platform.el.style.pointerEvents = "none"
    } else {
        platform.el.style.pointerEvents = "auto"
    }

    if (platform.selected) {
        platform.el.classList.add("selected")
    } else {
        platform.el.classList.remove("selected")
    }
}



