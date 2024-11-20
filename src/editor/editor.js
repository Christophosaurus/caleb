import { assert } from "../assert.js";
import * as Runner from "../game-runner.js";
import * as Input from "../input/input.js"
import * as Config from "../game-config.js"
import * as Utils from "./utils.js"
import { createTransform } from "./transforms.js"
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

    // @ts-ignore this is reasonable thing to do
    window.state = state

    Bus.emit("editor-started", state)
}

/**
 * @param {EditorState} state
 * @param {Event} _
 * @param {ElementState?} es
 */
function handleEditorDown(state, _, es) {
    assert(!!es, "handle editor down must happen on grid element")
    State.Mouse.down(state, es)
    State.createSelected(state, es)
}

/**
 * @param {EditorState} state
 * @param {Event} _
 * @param {ElementState?} es
 */
function handleEditorOver(state, _, es) {
    assert(!!es, "handle editor down must happen on grid element")
    State.createSelected(state, es)
}

/**
 * @param {EditorState} state
 */
function handleEditorUp(state) {
    State.Mouse.up(state)
}

/**
 * @param {EditorState} state
 * @param {Event} _
 * @param {ElementState} es
 */
function handleCellClick(state, _, es) {
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
    const levelSet = State.toSaveState(state)
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
    const T = createTransform(state);

    const createPlatform = T(State.createPlatform).type("keydown").key("a");
    const selectPlatform = T(handleSelectPlatform).type("mousedown").not.controls().fromPlatform()
    const movePlatform = T(handleMovePlatform).debug.type("mousemove").activePlatform().fromPlatform()
    const releasePlatform = T(handleReleasePlatform).type("keydown").key(["o", "Escape"])
    const delPlatform = T(handleDeletePlatform).type("keydown").key("Backspace")
    const upPlatform = T(handleUpPlatform).type("mouseup").not.controls().activePlatform()

    const clear = T(State.clearActiveState).type("keydown").key("Escape")

    const eDown = T(handleEditorDown).type("mousedown").not.activePlatform().fromEditor()
    const eOver = T(handleEditorOver).type("mouseover").stateMouseDown().not.activePlatform().fromEditor()
    const eUp = T(handleEditorUp).type("mouseup").stateMouseDown().not.activePlatform().fromEditor()
    const eCell = T(handleCellClick).type("click").not.stateHasSelected().not.activePlatform().isGridItem()

    const play = T(handlePlay).type("keydown").key("p").not.stateHasSelected().not.activePlatform()

    const handlers = [
        play,
        eCell,
        clear,
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

    const ran = []
    return function(event) {
        const startChange = state.change
        state.tick = Date.now()

        ran.length = 0
        for (const h of handlers) {
            if (h.run(event)) {
                ran.push(h)
            }
        }

        if (ran.length >= 2) {
            console.log("ambiguous event", ran.map(x => x.toString()))
        }
        Renderer.render(state)

        if (startChange < state.change) {
            /*Bus.emit("editor-save", {
                type: "editor-save",
                ...State.toSaveState(state)
            })*/
        }
    }
}



