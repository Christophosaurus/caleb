import { Vector2D } from "../math/vector.js";
import { GAME_WIDTH, GAME_HEIGHT } from "../window.js";
import * as Editor from "./editor.js";
import * as EditorState from "./state.js";
import { PlatformControls } from "./platform.js";


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

const state = EditorState.createEditorState(editor, overlay, debug)
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
