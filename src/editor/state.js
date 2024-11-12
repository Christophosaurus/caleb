import { assert } from "../assert.js";

/**
 * @param {HTMLElement} editor
 * @returns {EditorState}
 * */
export function createEditorState(editor) {
    const worldOutline = /** @type HTMLElement */(editor.querySelector("#world-outline"));
    assert(!!worldOutline, "#world-outline not within editor")
    return {
        editor,
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


