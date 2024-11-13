import { assert } from "../assert.js";
import * as Runner from "../game-runner.js";
import * as Config from "../game-config.js"
import * as Utils from "./utils.js"
import * as T from "./transforms.js"
import * as Platform from "./platform.js"
import * as Bus from "../bus.js"
import * as Renderer from "./render.js"
import * as Window from "../window.js"
import * as Level from "../objects/level/level.js"
import { Vector2D } from "../math/vector.js";

const behaviors = {
    fastClickTimeMS: 250,
    toBeMovingPxs: 144,
}

const windowEvents = [
    "mousedown",
    "mouseup",
    "mouseover",
    "mouseout",
    "mousemove",
    "click",
    "blur",
    "keydown",
]

/** @type {(e: Event) => void} */
let currentTakeAction = null
/** @type {EditorState} */
let currentEditorState = null

/**
 * @param {ResizeEvent} e
 */
function actionResize(e) {
    assert(!!currentTakeAction, "expected take action to be defined")
    currentTakeAction(e)
    Bus.emit("resize", /** @type {ResizeEvent} */(e))
}

function editorChange() {
    assert(!!currentEditorState, "expected editor state to be set")
    currentEditorState.change++
}

function addListeners() {
    assert(!!currentTakeAction, "expected take action to be defined")
    assert(!!currentEditorState, "expected editor state to be set")

    for (const e of windowEvents) {
        window.addEventListener(e, currentTakeAction)
    }
    window.addEventListener("resize", actionResize)

    Bus.listen("render", currentTakeAction)
    Bus.listen("editor-change", editorChange)
    Bus.render()
}

function removeListeners() {
    assert(!!currentTakeAction, "expected take action to be defined")
    assert(!!currentEditorState, "expected editor state to be set")

    for (const e of windowEvents) {
        window.removeEventListener(e, currentTakeAction)
    }
    window.removeEventListener("resize", actionResize)
    Bus.remove("render", currentTakeAction)
    Bus.remove("editor-change", editorChange)
}


/**
 * @param {EditorState} state
 */
export function start(state) {
    const takeAction = createActionTaken(state)
    currentTakeAction = takeAction
    currentEditorState = state
    addListeners()
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
    state.change++

    clear(state)
}

/**
 * @param {EditorState} state
 * @param {ElementState} es
 */
function handleCellClick(state, es) {
    console.log("work??")
    createSelected(state, es, es)
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
 */
function handleDeletePlatform(state, platform) {
    assert(!!state.activePlatform, "must have a selected platform to call this function")

    const idx = state.platforms.indexOf(platform)
    state.platforms.splice(idx, 1)

    platform.el.remove()
    editorChange()
    Bus.emit("delete-platform", platform)

    platform.selected = null
    state.activePlatform = null
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

    const before = platform.selected.moving
    platform.selected.moving ||= moved.magnituteSquared() > behaviors.toBeMovingPxs
    platform.AABB.pos = Utils.bound(moved)

    if (!before && platform.selected.moving) {
        Bus.emit("hide-platform", platform)
    }
}

/**
 * @param {EditorState} state
 */
function handlePlayListeners(state) {
    window.addEventListener("resize", function() {
        Window.resize(state.canvas)
    });
    Window.resize(state.canvas)
}

/**
 * @param {EditorState} state
 * @returns {LevelSet}
 */
function currentEditorStateToLevelSet(state) {
    const platforms= state.platforms.map(Level.createPlatformFromEditorPlatform)
    /** @type {Level} */
    const level = {
        platforms,
        initialPosition: new Vector2D(10, 0),
        letterMap: Level.createLetterMap(platforms),
    }

    return {
        title: "editor state",
        difficulty: 1,
        levels: [level],
        activeLevel: level,
        initialLevel: level,
    }
}

/**
 * @param {EditorState} state
 */
function handlePlay(state) {
    state.canvas.classList.add("show")
    handlePlayListeners(state)

    const ticks = [Runner.tickWithRender]
    const levelSet = currentEditorStateToLevelSet(state)
    const config = Config.getGameConfig(false)
    const gstate = Config.createCanvasGame(state.canvas, config, levelSet)
    const loop = Runner.createGameLoop(gstate)
    Runner.clear(gstate)
    Runner.addStandardBehaviors(gstate)

    Config.addInputListener(gstate, state.canvas)
    Runner.run(
        gstate,
        loop,
        ticks,
        (e) => {
            console.log("game finished", e)
        });
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
    const releasePlatform = T.type("keydown", T.key(["o", "Escape"], T.withSelectedPlatform(state, handleReleasePlatform)))
    const delPlatform = T.type("keydown", T.key("Backspace", T.withSelectedPlatform(state, handleDeletePlatform)))
    const upPlatform = T.notControls(state, T.activePlatform(state, T.type("mouseup", T.withSelectedPlatform(state, handleUpPlatform))))

    const eClear = T.type("keydown", T.key("Escape", T.withState(state, clear)))
    const eDown = T.noActivePlatform(state, T.isEditor(state.editor, T.type("mousedown", T.withElement(state, handleEditorDown))))
    const eOver = T.noActivePlatform(state, T.isEditor(state.editor, T.type("mouseover", T.withElement(state, T.isDown(handleEditorOver)))))
    const eUp = T.noActivePlatform(state, T.isEditor(state.editor, T.type("mouseup", T.withElement(state, T.isDown(handleEditorUp)))))
    const eCell = T.noSelected(state, T.noActivePlatform(state, T.isGridItem(T.type("click", T.withElement(state, handleCellClick)))))

    const play = T.noSelected(state, T.noActivePlatform(state, T.type("keydown", T.key("p", T.withState(state, handlePlay)))))

    const debug = T.type("mousemove", function(_) { })

    const handlers = [
        play,
        eCell,
        eClear,
        debug,
        eDown,
        eOver,
        eUp,
        delPlatform,
        createPlatform,
        upPlatform,
        selectPlatform,
        movePlatform,
        releasePlatform,
    ]

    /** @param {Event} event */
    return function(event) {
        const startChange = state.change
        state.tick = Date.now()
        for (const h of handlers) {
            h(event)
        }
        Renderer.render(state)

        if (startChange < state.change) {
            Bus.editorSave(state)
        }
    }
}



