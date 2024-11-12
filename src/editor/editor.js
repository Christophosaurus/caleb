import { assert } from "../assert.js";
import { from2Vecs } from "../math/aabb.js";
import { Vector2D } from "../math/vector.js";
import { GAME_HEIGHT, GAME_WIDTH } from "../window.js";

const MIN_W = 0
const MAX_W = 10 + GAME_WIDTH
const MIN_H = 0
const MAX_H = 10 + GAME_HEIGHT

/**
 * @param {Vector2D} pos
 * @returns {Vector2D}
 */
export function bound(pos) {
    pos.x = Math.min(MAX_W, Math.max(MIN_W, pos.x))
    pos.y = Math.min(MAX_H, Math.max(MIN_H, pos.y))
    return pos
}

/**
 * @param {EditorState} state
 * @param {Vector2D} pos
 * @returns {Vector2D}
 */
export function project(state, pos) {
    const rect = state.elements[0][0].el.getBoundingClientRect()
    const w = rect.width
    const h = rect.height
    return new Vector2D(Math.floor(pos.x / w), Math.floor(pos.y / h));
}


/**
 * @param {EditorState} state
 * @param {Vector2D} pos
 * @returns {Vector2D}
 */
export function unproject(state, pos) {
    const editorRect = state.editor.getBoundingClientRect()
    const rect = state.elements[0][0].el.getBoundingClientRect()

    const w = rect.width
    const h = rect.height

    return new Vector2D(Math.floor(pos.x * w + editorRect.left), Math.floor(pos.y * h + editorRect.top));
}

/**
 * @param {MouseEvent} evt
 * @returns Vector2D
 */
function toVec(evt) {
    return new Vector2D(evt.clientX, evt.clientY)
}

/**
 * @param {ElementState[]} elements
 * @returns {EditorPlatform}
 */
function createPlatform(elements) {
    const start = elements[0]
    const end = elements[elements.length - 1]

    return {
        selected: null,
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
 * @param {PlatformCB} next
 * @returns {EventCB}
 */
function withSelectedPlatform(state, next) {
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
 * @param {EditorState} state
 * @param {EventCB} next
 * @returns {EventCB}
 */
function noActivePlatform(state, next) {
    return is(function(evt) {
        return state.activePlatform === null
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




/**
 * @param {HTMLElement} editor
 * @param {HTMLElement} panel
 * @returns {EditorState}
 * */
export function createEditorState(editor, panel) {
    const worldOutline = /** @type HTMLElement */(editor.querySelector("#world-outline"));
    assert(!!worldOutline, "#world-outline not within editor")
    return {
        editor,
        panel,
        worldOutline,
        platforms: [],
        activePlatform: null,
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
 * @param {(state: EditorState) => void} render
 */
export function listen(state, render) {
    const createPlatform = state.panel.querySelector(".create-platform")

    const takeAction = createActionTaken(state, {
        createPlatform,
    }, render)

    window.addEventListener("mousedown", takeAction)
    window.addEventListener("mouseup", takeAction)
    window.addEventListener("mouseover", takeAction)
    window.addEventListener("mouseout", takeAction)
    window.addEventListener("mousemove", takeAction)
    window.addEventListener("click", takeAction)
    window.addEventListener("blur", takeAction);
    window.addEventListener("resize", takeAction);
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
    state.mouse.state = "down"
    state.mouse.startingEl = es
    for (const p of state.platforms) {
        p.selected = null
    }
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
 * @param {Event} event
 */
function handleSelectPlatform(state, event) {
    const evt = /** @type {MouseEvent} */(event)
    assert(evt instanceof MouseEvent, "selection of platform without mouse event")

    let found = null
    for (const p of state.platforms) {
        if (evt.target === p.el) {
            found = p
            break
        }
    }

    assert(found !== null, "unable to find the platform")
    found.selected = {
        offset: toVec(evt),
        starting: found.AABB.pos,
    }
    state.activePlatform = found
    createPlatformControls(state, found)
}

/**
 * @param {EditorState} state
 * @param {EditorPlatform} platform
 * @param {Event} event
 */
function handleMovePlatform(state, platform, event) {
    const evt = /** @type {MouseEvent} */(event)
    assert(evt instanceof MouseEvent, "selection of platform without mouse event")
    assert(!!platform.selected, "platform is not selected")
    const projected = project(state, toVec(evt).subtract(platform.selected.offset))

    platform.AABB.pos = bound(platform.selected.starting.clone().add(projected))
}

/**
 * @param {EditorState} state
 * @param {EditorPlatform} platform
 * @param {Event} event
 */
function handleReleasePlatform(state, platform, event) {
    const evt = /** @type {MouseEvent} */(event)
    assert(evt instanceof MouseEvent, "selection of platform without mouse event")
    assert(!!platform.selected, "platform is not selected")

    const projected = project(state, toVec(evt).subtract(platform.selected.offset))
    platform.AABB.pos = platform.selected.starting.clone().add(projected)
    platform.selected = null
    state.activePlatform = null
    removePlatformControls(state)
}

/** @param {EditorState} state
/** @param {PanelItems} panel
/** @param {(state: EditorState) => void} render
 */
export function createActionTaken(state, panel, render) {
    const eDown = noActivePlatform(state, isEditor(state.editor, type("mousedown", withElement(state, handleEditorDown))))
    const eOver = noActivePlatform(state, isEditor(state.editor, type("mouseover", withElement(state, isDown(handleEditorOver)))))
    const eUp = noActivePlatform(state, isEditor(state.editor, type("mouseup", withElement(state, isDown(handleEditorUp)))))
    const eOut = noActivePlatform(state, is(state.panel, type("mouseover", withState(state, handleEditorOut))))

    const createPlatform = is(panel.createPlatform, type("click", withState(state, handleCreatePlatform)))
    const selectPlatform = isPlatform(state, type("mousedown", withState(state, handleSelectPlatform)))
    const movePlatform = type("mousemove", withSelectedPlatform(state, handleMovePlatform))
    const releasePlatform = type("mouseup", withSelectedPlatform(state, handleReleasePlatform))
    const debug = type("mousemove", function(evt) { })

    const handlers = [
        debug,
        eDown,
        eOver,
        eUp,
        eOut,
        createPlatform,
        selectPlatform,
        movePlatform,
        releasePlatform,
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
 * TODO perf
 * easy win would be to put a tick on each platform every time it changes and only recalc / re-render when i need to
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
            renderPlatform(state, plat)
        }

        // TODO configure?
        const start = unproject(state, new Vector2D(5, 5))
        const dims = unproject(state, new Vector2D(5 + GAME_WIDTH, 5 + GAME_HEIGHT)).subtract(start)
        state.worldOutline.style.width = `${Math.ceil(dims.x)}px`
        state.worldOutline.style.height = `${Math.ceil(dims.y)}px`
        state.worldOutline.style.top = `${Math.ceil(start.y)}px`
        state.worldOutline.style.left = `${Math.ceil(start.x)}px`
    }
}

/**
 * @param {EditorState} state
* @param {EditorPlatform} platform
*/
function renderPlatform(state, platform) {
    const editor = state.editor
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



