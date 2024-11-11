import { Vector2D } from "../math/vector.js";
import { GAME_WIDTH, GAME_HEIGHT } from "../window.js";
import * as Editor from "./editor.js";

/** @type {HTMLElement} */
const app = document.querySelector("#app")
/** @type {HTMLElement} */
const editor = document.querySelector("#editor")
/** @type {HTMLElement} */
const panel = document.querySelector("#panel")

const state = Editor.createEditorState()
let id = 0
for (let r = 0; r < GAME_HEIGHT; ++r) {
    /** @type {ElementState[]} */
    const row = []
    for (let c = 0; c < GAME_WIDTH; ++c) {
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

Editor.listen(state, editor, panel, Editor.createRender(app))


