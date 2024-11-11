import { assert } from "./assert.js";
import { FULL_WIDTH, FULL_HEIGHT, GAME_WIDTH, GAME_HEIGHT } from "./window.js";

const editor = document.querySelector("#editor")
const side = document.querySelector("#panel")

/**
 * @param {EditorState} state
 * @param {ElementCB} next
 * @returns {(event: Event) => void}
 */
function withElement(state, next) {
    return function(event) {
        const t = /** @type {HTMLElement} */(event.target);
        const row = parseInt(t.dataset.row)
        const col = parseInt(t.dataset.col)
        if (isNaN(row) || isNaN(col)) {
            state.mouse.state = "invalid"
            return
        }
        next(state, state.elements[row][col], event.type)
    }
}

/**
 * @param {ElementCB} next
 * @returns {ElementCB}
 */
function isDown(next) {
    return function(state, es, type) {
        if (state.mouse.state !== "down") {
            return
        }

        next(state, es, type)
    }
}

/** @type {EditorState} */
const editorState = {
    elements: [],
    mouse: {
        startingEl: null,
        state: "invalid"
    }
}

editor.addEventListener("mousedown", withElement(editorState, function(s) {
    s.mouse.state = "down"
}))

editor.addEventListener("mouseup", withElement(editorState, function(s) {
    s.mouse.state = "invalid"
}))

function

/**
 * @param {ElementState} start
 * @param {ElementState} end
 * @returns {ElementState[]}
 */
function createBox(start, end) {
    if (start.pos.
}

editor.addEventListener("mouseover", withElement(editorState, isDown(function(s, es) {
    assert(s.mouse.startingEl !== null, "should never get here with a null mouse element")
    const starting = s.mouse.startingEl
    const ending = es
})))

window.addEventListener("mouseup", (event) => {
    editorState.mouse.state = "invalid"
});

window.addEventListener("blur", (event) => {
    editorState.mouse.state = "invalid"
});

let id = 0

for (let r = 0; r < GAME_HEIGHT; ++r) {
    const row = []
    for (let c = 0; c < GAME_WIDTH; ++c) {
        const el = document.createElement("div")
        editor.appendChild(el)
        el.id = `gi${id++}`;
        el.classList.add("grid-item")

        el.dataset.row = String(r)
        el.dataset.col = String(c)

        row.push({
            pos: {
                row: r,
                col: c,
            },
            el,
            id,
        });
    }
    editorState.elements.push(row);
}

