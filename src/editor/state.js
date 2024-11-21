import { assert } from "../assert.js";
import { AABB } from "../math/aabb.js";
import { Vector2D } from "../math/vector.js";
import { GAME_HEIGHT, GAME_WIDTH } from "../window.js";
import * as Mouse from "./mouse.js"
import * as Platform from "./platform.js"
import * as Utils from "./utils.js"
import * as Consts from "./consts.js"
import * as Level from "../objects/level/level.js"

export {Mouse}

/**
 * @param {EditorState} state
 */
function change(state) {
    state.change++
}

/**
 * @param {EditorState} state
 * @returns {any}
 */
export function toSaveState(state) {
    const plats = platforms(state).map(plat => {
        return Platform.toPlatform(state, plat)
    })

    /** @type {Level} */
    const level = {
        platforms: plats,
        initialPosition: new Vector2D(10, 0),
        letterMap: Level.createLetterMap(plats),
    }

    return {
        title: "editor state",
        difficulty: 1,
        levels: [level],
        initialLevel: level,
    }
}

/**
 * @param {EditorState} state
 * @returns {EditorLevelSet}
 */
export function levelSet(state) {
    const level = state.levelState.levels[state.levelState.current];
    assert(!!level, "somehow you have requested a level-set that does not exist", state.levelState)
    return level
}

/**
 * @param {EditorState} state
 * @returns {EditorLevel}
 */
export function level(state) {
    const ls = levelSet(state)
    const l = ls.levels[ls.current]
    assert(!!l, "somehow you have requested a level that doesn't exist", state.levelState)
    return l
}

/**
 * @param {EditorState} state
 * @returns {ElementState[][]}
 */
export function elements(state) {
    return state.elements
}


/**
 * @param {EditorState} state
 * @returns {EditorPlatform[]}
 */
export function platforms(state) {
    return level(state).platforms
}

export function releasePlatform(state) {
    const p = activePlatform(state);
    p.selected = null;
}

/**
 * @param {EditorState} state
 * @param {MouseEvent} evt
 * @returns {EditorPlatform}
 */
export function selectPlatform(state, evt) {
    let found = null
    for (const p of platforms(state)) {
        if (evt.target  === p.el) {
            found = p
            break
        }
    }

    assert(found !== null, "select platform was called and unable to select platform")

    found.selected = {
        offset: Utils.toVec(evt),
        starting: found.AABB.pos,
        moving: false,
        tick: found.selected ? found.selected.tick : state.tick
    }
    state.activePlatform = found

    return found;
}

/**
 * @param {EditorState} state
 * @returns {EditorPlatform}
 */
export function deletePlatform(state) {
    const platform = activePlatform(state);
    const plats = platforms(state);
    const idx = plats.indexOf(platform)
    if (hasActivePlatform(state)) {
        clearActiveState(state);
    }

    assert(idx > -1, "platform that is being removed doesn't exist");

    const [p] = plats.splice(idx, 1);
    p.el.remove()
    p.el = null

    change(state);
    return p
}

/**
 * @param {EditorState} state
 * @returns {EditorPlatform}
 */
export function activePlatform(state) {
    const plat = state.activePlatform
    assert(!!plat, "expected active platform");
    return plat
}

/**
 * @param {EditorState} state
 */
export function unsetActivePlatform(state) {
    const ap = activePlatform(state)
    ap.selected = null
    state.activePlatform = null
}

/**
 * @param {EditorState} state
 * @param {ElementState} end
 * @param {ElementState} start
 */
export function createSelected(state, end, start = state.mouse.startingEl) {
    assert(start !== null, "you must call createBox after we have selected as starting element")
    clearSelectElements(state);

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
 * @returns {boolean}
 */
export function hasActivePlatform(state) {
    const plat = state.activePlatform
    return !!plat
}

export function clearSelectElements(state) {
    for (const el of state.selectedElements) {
        el.selected = false
    }
    state.selectedElements.length = 0
}

/**
 * @param {EditorState} state
 */
export function hasSelected(state) {
    return state.selectedElements.length > 0
}

/**
 * @param {EditorState} state
 */
export function clearActiveState(state) {
    clearSelectElements(state);
    Mouse.clearState(state);
    if (hasActivePlatform(state)) {
        releasePlatform(state);
    }
}

/**
 * @param {EditorState} state
 */
export function createPlatform(state) {
    if (state.selectedElements.length > 0) {
        const start = state.selectedElements[0]
        const end = state.selectedElements[state.selectedElements.length - 1]
        const p = Platform.createPlatform(state, start, end)
        platforms(state).push(p)
        change(state);
    }
    clearActiveState(state)
}

/**
 * @param {EditorState} state
 */
export function startRound(state) {
    state.change = 0
}

/**
 * @param {EditorState} state
 * @returns {boolean}
 */
export function endRound(state) {
    return state.change > 0
}

/**
 * @returns {EditorLevelSet}
 */
function createEmptyLevelSet() {
    /** @type {EditorLevel} */
    const emptyLevel = {
        letterMap: [],
        platforms: [],
        initialPosition: new Vector2D(24, 24),
    };

    return {
        levels: [emptyLevel],
        title: "empty",
        difficulty: 0,
        initialLevel: 0,
        current: 0,
    };
}

/**
 * @param {EditorState} state
 */
function readyLevelState(state) {
    const levelState = state.levelState
    if (levelState.levels.length === 0) {
        levelState.levels.push(createEmptyLevelSet())
        levelState.current = 0;
    }

    for (const set of levelState.levels) {
        for (const level of set.levels) {
            for (const p of level.platforms) {
                p.el = null
                p.state = state
                const a = p.AABB
                p.AABB = new AABB(new Vector2D(a.pos.x, a.pos.y), a.width, a.height)
            }
        }
    }

}

/**
 * @param {HTMLElement} editor
 * @param {HTMLElement} overlay
 * @param {HTMLCanvasElement} canvas
 * @param {boolean} debug
 * @param {EditorLevelState} levelState
 * @returns {EditorState}
 * */
export function createEditorState(editor, overlay, canvas, debug, levelState) {

    const worldOutline = /** @type HTMLElement */(editor.querySelector("#world-outline"));
    assert(!!worldOutline, "#world-outline not within editor")

    const platformControls = /** @type HTMLElement */(overlay.querySelector("platform-controls"));
    assert(!!platformControls, "platform-controls is not within overlay")

    const levelSetControls = /** @type HTMLElement */(overlay.querySelector("level-set-controls"));
    assert(!!levelSetControls, "level-set-controls is not within overlay")

    const levelSelectControls = /** @type HTMLElement */(overlay.querySelector("level-select-controls"));
    assert(!!levelSelectControls, "level-select-controls is not within overlay")

    const margin = Consts.editor.margin

    /** @type {EditorState} */
    const state = {
        change: 0,
        outerRect: {
            margin,
            maxX: GAME_WIDTH + margin,
            maxY: GAME_HEIGHT + margin,
        },

        canvas,
        debug,
        editor,
        overlay,
        worldOutline,
        platformControls,
        levelSetControls,
        levelSelectControls,

        levelState: levelState,

        tick: 0,
        activePlatform: null,
        elements: [],
        selectedElements: [],
        mouse: {
            startingEl: null,
            state: "invalid",
        }
    }

    readyLevelState(state);

    return state
}

