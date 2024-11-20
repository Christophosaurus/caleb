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
import * as Consts from "./consts.js"

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
 */
export function debug(state) {
    if (State.hasSelected(state)) {
        console.log("STATE: has selected")
    }

    if (State.hasActivePlatform(state)) {
        console.log("STATE: has active platform")
    }
}

/**
 * @param {EditorState} state
 * @param {Event} _
 * @param {ElementState?} es
 */
export function handleEditorDown(state, _, es) {
    assert(!!es, "handle editor down must happen on grid element")
    console.log("handle editor down")
    State.createSelected(state, es)
}

/**
 * @param {EditorState} state
 * @param {Event} _
 * @param {ElementState?} es
 */
export function handleMouseDown(state, _, es) {
    State.Mouse.down(state, es)
}

/**
 * @param {EditorState} state
 */
export function handleMouseUp(state, _, es) {
    State.Mouse.up(state)
}

/**
 * @param {EditorState} state
 * @param {Event} _
 * @param {ElementState?} es
 */
export function handleEditorOver(state, _, es) {
    assert(!!es, "handle editor down must happen on grid element")
    State.createSelected(state, es)
}

/**
 * @param {EditorState} state
 */
export function handleEditorUp(state) { }

/**
 * @param {EditorState} state
 * @param {Event} _
 * @param {ElementState} es
 */
export function handleCellClick(state, _, es) {
    State.createSelected(state, es, es)
}

/**
 * @param {EditorState} state
 * @param {Event} event
 */
export function handleSelectPlatform(state, event) {
    const evt = /** @type {MouseEvent} */(event)
    assert(evt instanceof MouseEvent, "selection of platform without mouse event")

    const found = State.selectPlatform(state, evt)
    Platform.down(found)

    Bus.emit("show-platform", found)
}

/**
 * @param {EditorState} state
 */
export function handleUpPlatform(state) {
    const platform = State.activePlatform(state)
    const duration = Platform.selectedDuration(state, platform)
    const moving = Platform.isMoving(platform)

    Platform.up(platform)
    if (moving || duration < Consts.behaviors.fastClickTimeMS) {
        Bus.emit("show-platform", platform)
    }
}

/**
 * @param {EditorState} state
 */
export function handleDeletePlatform(state) {
    const platform = State.deletePlatform(state);
    Bus.emit("delete-platform", platform)
}

/**
 * @param {EditorState} state
 * @param {Event} event
 */
export function handleMovePlatform(state, event) {
    const evt = /** @type {MouseEvent} */(event)
    assert(evt instanceof MouseEvent, "selection of platform without mouse event")

    const platform = State.activePlatform(state)
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
export function handlePlayListeners(state) {
    window.addEventListener("resize", function() {
        Window.resize(state.canvas)
    });
    Window.resize(state.canvas)
}

/**
 * @param {EditorState} state
 */
export function handlePlay(state) {
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
export function handleReleasePlatform(state) {
    const platform = State.activePlatform(state)
    Platform.up(platform)
    Bus.emit("release-platform", platform)
}

/** @param {EditorState} state
 * @param {boolean} render - i need ot remove this and have take action emit renders
 *
 * @returns {(e: Event) => void}
 */
export function createActionTaken(state, render = true) {
    const T = createTransform(state);

    const createPlatform = T(State.createPlatform).type("keydown").key("a");
    //const selectPlatform = T(handleSelectPlatform).type("mousedown").not.controls().inPlatform()
    //const movePlatform = T(handleMovePlatform).debug.type("mousemove").activePlatform().inPlatform().stateMouseDown()
    //const releasePlatform = T(handleReleasePlatform).type("keydown").key(["o", "Escape"])
    //const delPlatform = T(handleDeletePlatform).type("keydown").key("Backspace")
    //const upPlatform = T(handleUpPlatform).type("mouseup").activePlatform()

    const clear = T(State.clearActiveState).type("keydown").key("Escape")

    const eOver = T(handleEditorOver).type("mouseover").stateMouseDown().not.inPlatform().fromEditor()
    const eUp = T(handleEditorUp).type("mouseup").stateMouseDown().not.inPlatform().fromEditor()
    const eCell = T(handleCellClick).type("mouseup").mouseDuration(Consts.behaviors.fastClickTimeMS).isGridItem()

    const play = T(handlePlay).type("keydown").key("p").not.stateHasSelected().not.activePlatform()
    const mousedown = T(handleMouseDown).type("mousedown")
    const mouseup = T(handleMouseUp).type("mouseup")

    const prehandlers = [
        mousedown,
    ]

    const posthandlers = [
        mouseup,
    ]

    const handlers = [
        play,
        eCell,
        clear,
        eOver,
        eUp,

        createPlatform,
        //delPlatform,
        //upPlatform,
        //selectPlatform,
        //movePlatform,
        //releasePlatform,
    ]

    const ran = []
    return function(event) {
        const startChange = state.change
        state.tick = Date.now()

        for (const h of prehandlers) {
            h.run(event)
        }

        ran.length = 0
        for (const h of handlers) {
            if (h.run(event)) {
                ran.push(h)
            }
        }

        for (const h of posthandlers) {
            h.run(event)
        }

        if (ran.length >= 2) {
            console.log("ambiguous event", ran.map(x => x.toString()))
        }
        if (render) {
            Renderer.render(state)
        }

        if (startChange < state.change) {
            /*Bus.emit("editor-save", {
                type: "editor-save",
                ...State.toSaveState(state)
            })*/
        }
    }
}



