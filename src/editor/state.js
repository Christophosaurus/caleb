import { assert } from "../assert.js";

/**
 * @param {HTMLElement} editor
 * @param {HTMLElement} overlay
 * @param {boolean} debug
 * @returns {EditorState}
 * */
export function createEditorState(editor, overlay, debug) {
    const worldOutline = /** @type HTMLElement */(editor.querySelector("#world-outline"));
    assert(!!worldOutline, "#world-outline not within editor")

    const platformControls = /** @type HTMLElement */(overlay.querySelector("platform-controls"));
    assert(!!platformControls, "platform-controls is not within overlay")

    return {
        debug,
        editor,
        overlay,
        worldOutline,
        platformControls,

        tick: 0,
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


