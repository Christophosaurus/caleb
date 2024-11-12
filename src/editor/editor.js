import { assert } from "../assert.js";
import { Vector2D } from "../math/vector.js";
import { GAME_HEIGHT, GAME_WIDTH } from "../window.js";
import * as Utils from "./utils.js"
import * as T from "./transforms.js"
import * as Platform from "./platform.js"
import * as Bus from "../bus.js"

/**
 * @param {EditorState} state
 * @param {(state: EditorState) => void} render
 */
export function listen(state, render) {
    const takeAction = createActionTaken(state, render)

    window.addEventListener("mousedown", takeAction)
    window.addEventListener("mouseup", takeAction)
    window.addEventListener("mouseover", takeAction)
    window.addEventListener("mouseout", takeAction)
    window.addEventListener("mousemove", takeAction)
    window.addEventListener("click", takeAction)
    window.addEventListener("blur", takeAction);
    window.addEventListener("resize", takeAction);
    window.addEventListener("keydown", takeAction);
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
        const p = Platform.createPlatform(selected)
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
        offset: Utils.toVec(evt),
        starting: found.AABB.pos,
    }
    state.activePlatform = found
    Bus.emit("select-platform", found)
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
    const projected = Utils.project(state, Utils.toVec(evt).subtract(platform.selected.offset))

    platform.AABB.pos = Utils.bound(platform.selected.starting.clone().add(projected))
    Bus.emit("move-platform", platform)
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

    const projected = Utils.project(state, Utils.toVec(evt).subtract(platform.selected.offset))
    platform.AABB.pos = platform.selected.starting.clone().add(projected)
    platform.selected = null
    state.activePlatform = null
    Bus.emit("release-platform", platform)
}

/** @param {EditorState} state
/** @param {(state: EditorState) => void} render
 */
export function createActionTaken(state, render) {
    const createPlatform = T.type("keydown", T.key("a", T.withState(state, handleCreatePlatform)))
    const selectPlatform = T.isPlatform(state, T.type("mousedown", T.withState(state, handleSelectPlatform)))
    const movePlatform = T.type("mousemove", T.withSelectedPlatform(state, handleMovePlatform))
    const releasePlatform = T.type("mouseup", T.withSelectedPlatform(state, handleReleasePlatform))

    const eDown = T.noActivePlatform(state, T.isEditor(state.editor, T.type("mousedown", T.withElement(state, handleEditorDown))))
    const eOver = T.noActivePlatform(state, T.isEditor(state.editor, T.type("mouseover", T.withElement(state, T.isDown(handleEditorOver)))))
    const eUp = T.noActivePlatform(state, T.isEditor(state.editor, T.type("mouseup", T.withElement(state, T.isDown(handleEditorUp)))))

    const debug = T.type("mousemove", function(evt) { })

    const handlers = [
        debug,
        eDown,
        eOver,
        eUp,
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
        const start = Utils.unproject(state, new Vector2D(5, 5))
        const dims = Utils.unproject(state, new Vector2D(5 + GAME_WIDTH, 5 + GAME_HEIGHT)).subtract(start)
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



