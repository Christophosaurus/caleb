import { assert } from "../assert.js";
import * as Runner from "../game-runner.js";
import * as Input from "../input/input.js"
import * as Config from "../game-config.js"
import * as Utils from "./utils.js"
import * as T from "./transforms.js"
import * as Bus from "../bus.js"
import * as Renderer from "./render.js"
import * as Window from "../window.js"
import * as State from "./state.js"
import * as Platform from "./platform.js"

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

    Bus.emit("editor-started", state)
}

/**
 * @param {EditorState} state
 * @param {ElementState} es
 */
function handleEditorDown(state, es) {
    State.Mouse.down(state, es)
    State.createSelected(state, es)
}

/**
 * @param {EditorState} state
 * @param {ElementState} es
 */
function handleEditorOver(state, es) {
    State.createSelected(state, es)
}

/**
 * @param {EditorState} state
 * @param {ElementState} _
 */
function handleEditorUp(state, _) {
    State.Mouse.up(state)
}

/**
 * @param {EditorState} state
 * @param {ElementState} es
 */
function handleCellClick(state, es) {
    State.createSelected(state, es, es)
}

/**
 * @param {EditorState} state
 * @param {Event} event
 */
function handleSelectPlatform(state, event) {
    const evt = /** @type {MouseEvent} */(event)
    assert(evt instanceof MouseEvent, "selection of platform without mouse event")

    const found = State.selectPlatform(state, evt)

    Bus.emit("show-platform", found)
}

/**
 * @param {EditorState} state
 */
function handleUpPlatform(state) {
    const platform = State.activePlatform(state)
    const duration = Platform.selectedDuration(state, platform)
    const moving = Platform.isMoving(platform)

    if (!moving && duration < behaviors.fastClickTimeMS) {
        handleReleasePlatform(state)
    } else {
        Bus.emit("show-platform", platform)
    }
}

/**
 * @param {EditorState} state
 */
function handleDeletePlatform(state) {
    const platform = State.deletePlatform(state);
    Bus.emit("delete-platform", platform)
}

/**
 * @param {EditorState} state
 * @param {Event} event
 */
function handleMovePlatform(state, event) {
    const evt = /** @type {MouseEvent} */(event)
    assert(evt instanceof MouseEvent, "selection of platform without mouse event")

    const platform = State.activePlatform(state)
    if (Platform.isDown(platform)) {
        return
    }

    const eventPos = Utils.toVec(evt)
    const offset = Platform.offset(platform);
    const start = Platform.start(platform);

    const projected = Utils.project(state, eventPos.subtract(offset), Math.round)
    const moved = projected.add(start)
    const startedMoving = Platform.moveTo(platform, Utils.bound(state, moved));

    if (startedMoving) {
        Bus.emit("move-platform", platform)
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
 */
function handlePlay(state) {
    state.canvas.classList.add("show")
    removeListeners();
    handlePlayListeners(state)

    const ticks = [Runner.tickWithRender]
    const levelSet = State.toGameLevelSet(state)
    const config = Config.getGameConfig(false)
    const gstate = Config.createCanvasGame(state.canvas, config, levelSet)
    const loop = Runner.createGameLoop(gstate)
    Runner.clear(gstate)
    Runner.addStandardBehaviors(gstate)

    Input.addListenersTo(gstate, state.canvas)
    Runner.run(
        gstate,
        loop,
        ticks,
        (e) => {
            console.log("game finished", e)
            state.canvas.classList.remove("show")
            Input.removeListenersFrom(gstate, state.canvas)
            addListeners();
        });
}

/**
 * @param {EditorState} state
 */
function handleReleasePlatform(state) {
    const plat = State.releasePlatform(state)
    Bus.emit("release-platform", plat)
}

/** @param {EditorState} state
 *
 * @returns {(e: Event) => void}
 */
export function createActionTaken(state) {

    const createPlatform = T.type("keydown", T.key("a", T.withState(state, State.createPlatform)))
    const selectPlatform = T.notControls(state, T.isPlatform(state, T.type("mousedown", T.withState(state, handleSelectPlatform))))
    const movePlatform = T.type("mousemove", T.isPlatform(state, T.withState(state, handleMovePlatform)))

    const releasePlatform = T.type("keydown", T.key(["o", "Escape"], T.withState(state, handleReleasePlatform)))
    const delPlatform = T.type("keydown", T.key("Backspace", T.withState(state, handleDeletePlatform)))
    const upPlatform = T.notControls(state, T.activePlatform(state, T.type("mouseup", T.withState(state, handleUpPlatform))))

    const clear = T.type("keydown", T.key("Escape", T.withState(state, State.clearActiveState)))

    const eDown = T.noActivePlatform(state, T.isEditor(state.editor, T.type("mousedown", T.withElement(state, handleEditorDown))))
    const eOver = T.noActivePlatform(state, T.isEditor(state.editor, T.type("mouseover", T.withElement(state, T.isDown(handleEditorOver)))))
    const eUp = T.noActivePlatform(state, T.isEditor(state.editor, T.type("mouseup", T.withElement(state, T.isDown(handleEditorUp)))))
    const eCell = T.noSelected(state, T.noActivePlatform(state, T.isGridItem(T.type("click", T.withElement(state, handleCellClick)))))

    const play = T.noSelected(state, T.noActivePlatform(state, T.type("keydown", T.key("p", T.withState(state, handlePlay)))))

    const debug = T.type("mousemove", function(_) { })

    const handlers = [
        play,
        eCell,
        clear,
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



