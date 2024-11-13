import { assert } from "../assert.js";
import { AABB } from "../math/aabb.js";
import { Vector2D } from "../math/vector.js";

/**
 * @param {HTMLElement} editor
 * @param {HTMLElement} overlay
 * @param {boolean} debug
 * @param {EditorStateFromServer} stateFromServer
 * @returns {EditorState}
 * */
export function createEditorState(editor, overlay, debug, stateFromServer) {
    const worldOutline = /** @type HTMLElement */(editor.querySelector("#world-outline"));
    assert(!!worldOutline, "#world-outline not within editor")

    const platformControls = /** @type HTMLElement */(overlay.querySelector("platform-controls"));
    assert(!!platformControls, "platform-controls is not within overlay")

    /** @type {EditorState} */
    const state = {
        change: 0,

        debug,
        editor,
        overlay,
        worldOutline,
        platformControls,

        tick: 0,
        platforms: stateFromServer.platforms,
        activePlatform: null,
        elements: [],
        selectedElements: [],
        mouse: {
            startingEl: null,
            state: "invalid",
        }
    }

    for (const p of state.platforms) {
        p.el = null
        p.state = state
        const a = p.AABB
        p.AABB = new AABB(new Vector2D(a.pos.x, a.pos.y), a.width, a.height)
    }

    return state
}


