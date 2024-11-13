import { Vector2D } from "../math/vector.js";
import { GAME_WIDTH, GAME_HEIGHT } from "../window.js";
import * as Editor from "./editor.js";
import * as EditorState from "./state.js";
import { PlatformControls } from "./platform.js";
import { assert, never } from "../assert.js";
import * as Bus from "../bus.js"
import { AABB } from "../math/aabb.js";

/**
 * @returns {Promise<EditorStateFromServer | null>}
 */
async function getState() {
    const url = "/get";
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Response status: ${response.status}`);
        }

        return response.json();

    } catch (error) {
        never("unable to get data: " + error + "\n" + error.stack)
    }

    return null
}

async function run() {
    /** @type {EditorStateFromServer | null} */
    const data = await getState()
    assert(!!data, "unable to get data from the server")

    /** @type {HTMLElement} */
    const editor = document.querySelector("#editor")
    /** @type {HTMLElement} */
    const overlay = document.querySelector("#overlay")

    /** @type {HTMLElement} */
    const loading = document.querySelector("#loading")
    if (loading) {
        overlay.removeChild(loading)
    }

    const urlParams = new URLSearchParams(window.location.search);
    const debug = urlParams.get("debug") === "1";
    const state = EditorState.createEditorState(editor, overlay, debug, data)

    let id = 0
    for (let r = 0; r < GAME_HEIGHT + 10; ++r) {
        /** @type {ElementState[]} */
        const row = []
        for (let c = 0; c < GAME_WIDTH + 10; ++c) {
            const el = document.createElement("div")
            editor.appendChild(el)
            el.id = `gi${id++}`;
            el.classList.add("grid-item")

            el.dataset.row = String(r)
            el.dataset.col = String(c)

            row.push({
                selected: false,
                pos: new Vector2D(c, r),
                el,
                id,
            });
        }
        state.elements.push(row);
    }

    customElements.define("platform-controls", PlatformControls);
    Editor.listen(state)

    Bus.listen("editor-save", async function(save) {
        const res = await fetch("/save", {
            method: "POST",
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(save, (key, value) => {
                if (key === "state" || key === "el") {
                    return undefined
                }
                return value
            })
        })
        assert(res.ok, "unable to save the editor state")
    })
}

run()
