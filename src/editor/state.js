import { assert } from "../assert.js";

/**
 * @param {HTMLElement} editor
 * @param {HTMLElement} overlay
 * @returns {EditorState}
 * */
export function createEditorState(editor, overlay) {
    const worldOutline = /** @type HTMLElement */(editor.querySelector("#world-outline"));
    assert(!!worldOutline, "#world-outline not within editor")
    return {
        editor,
        overlay,
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


