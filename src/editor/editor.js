import { assert } from "../assert.js";
import * as Utils from "./utils.js"
import * as T from "./transforms.js"
import * as Platform from "./platform.js"
import * as Bus from "../bus.js"
import * as Renderer from "./render.js"

const behaviors = {
    fastClickTimeMS: 250,
    toBeMovingPxs: 144,
}

/**
 * @param {EditorState} state
 */
export function listen(state) {
    const takeAction = createActionTaken(state)

    window.addEventListener("mousedown", takeAction)
    window.addEventListener("mouseup", takeAction)
    window.addEventListener("mouseover", takeAction)
    window.addEventListener("mouseout", takeAction)
    window.addEventListener("mousemove", takeAction)
    window.addEventListener("click", takeAction)
    window.addEventListener("blur", takeAction);
    window.addEventListener("resize", takeAction);
    window.addEventListener("keydown", takeAction);
    Bus.listen("render", takeAction)
    Bus.render()
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
 * @param {ElementState} _
 */
function handleEditorUp(state, _) {
    //clear(state)
    state.mouse.state = "invalid"
}

/**
 * @param {EditorState} state
 */
function handleCreatePlatform(state) {
    if (state.selectedElements.length > 0) {
        const p = Platform.createPlatform(state)
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

    if (found.selected) {
        found.selected = {
            ...found.selected,
            moving: false,
            offset: Utils.toVec(evt),
            starting: found.AABB.pos,
            down: true,
        }
        Bus.emit("show-platform", found)
        return
    }

    found.selected = {
        offset: Utils.toVec(evt),
        starting: found.AABB.pos,
        down: true,
        moving: false,
        tick: state.tick
    }
    state.activePlatform = found
    Bus.emit("show-platform", found)
}

/**
 * @param {EditorState} state
 * @param {EditorPlatform} platform
 */
function handleUpPlatform(state, platform) {
    const s = platform.selected
    s.down = false

    if (!s.moving && s.tick + behaviors.fastClickTimeMS < state.tick) {
        handleReleasePlatform(state, platform)
    } else {
        Bus.emit("show-platform", platform)
    }
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

    if (!platform.selected.down) {
        return
    }

    const projected = Utils.project(state, Utils.toVec(evt).subtract(platform.selected.offset), Math.round)
    const moved = platform.selected.starting.clone().add(projected)

    platform.selected.moving ||= moved.magnituteSquared() > behaviors.toBeMovingPxs
    platform.AABB.pos = Utils.bound(moved)
    Bus.emit("hide-platform", platform)
}

/**
 * @param {EditorState} state
 * @param {EditorPlatform} platform
 */
function handleReleasePlatform(state, platform) {
    assert(!!platform.selected, "platform is not selected")
    platform.selected = null
    state.activePlatform = null
    Bus.emit("release-platform", platform)
}

/** @param {EditorState} state
 */
export function createActionTaken(state) {
    const createPlatform = T.type("keydown", T.key("a", T.withState(state, handleCreatePlatform)))
    const selectPlatform = T.notControls(state, T.isPlatform(state, T.type("mousedown", T.withState(state, handleSelectPlatform))))
    const movePlatform = T.type("mousemove", T.withSelectedPlatform(state, handleMovePlatform))
    const releasePlatform = T.type("keydown", T.key("o", T.withSelectedPlatform(state, handleReleasePlatform)))
    const upPlatform = T.activePlatform(state, T.type("mouseup", T.withSelectedPlatform(state, handleUpPlatform)))

    const eDown = T.noActivePlatform(state, T.isEditor(state.editor, T.type("mousedown", T.withElement(state, handleEditorDown))))
    const eOver = T.noActivePlatform(state, T.isEditor(state.editor, T.type("mouseover", T.withElement(state, T.isDown(handleEditorOver)))))
    const eUp = T.noActivePlatform(state, T.isEditor(state.editor, T.type("mouseup", T.withElement(state, T.isDown(handleEditorUp)))))

    const debug = T.type("mousemove", function(_) { })

    const handlers = [
        debug,
        eDown,
        eOver,
        eUp,
        createPlatform,
        upPlatform,
        selectPlatform,
        movePlatform,
        releasePlatform,
    ]

    /** @param {Event} event */
    return function(event) {
        state.tick = Date.now()
        for (const h of handlers) {
            h(event)
        }
        Renderer.render(state)
    }
}



