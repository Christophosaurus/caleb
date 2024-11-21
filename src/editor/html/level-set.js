import { assert, never } from "../../assert.js";
import * as Bus from "../../bus.js"
import { AABB } from "../../math/aabb.js";
import { Vector2D } from "../../math/vector.js";
import * as State from "../state.js"

const dropKeys = [
    "activePlatform",
    "elements",
    "el",
    "state",

    "canvas",
    "editor",
    "overlay",
    "platformControls",
    "levelSetControls",
    "levelSelectControls",
    "worldOutline",
]

/** @param {EditorState} state
 * @param {string} path
 */
async function save(state, path) {
    const res = await fetch("/save", {
        method: "POST",
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            path,
            editorState: state,
        }, (key, value) => {
            if (dropKeys.includes(key)) {
                return undefined
            }
            return value
        }, 4)
    })
    assert(res.ok, "unable to save the editor state")
}

/**
 * @param {EditorState | null} state
 * @returns {EditorState}
 */
export function readyLevelState(state) {
    if (!state) {
        return State.createEmptyEditorState()
    }

    const levelState = State.levelSet(state)
    for (const level of levelState.levels) {
        for (const p of level.platforms) {
            p.el = null
            p.state = state
            const a = p.AABB
            p.AABB = new AABB(new Vector2D(a.pos.x, a.pos.y), a.width, a.height)
        }
    }

    return state
}

/**
 * @param {string} path
 * @returns {Promise<EditorState | null>}
 */
async function getState(path) {
    const url = `/get?path=${path}`;
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Response status: ${response.status}`);
        }

        const event = /** @type {EditorSaveRequest} */ (await response.json())
        readyLevelState(event.editorState)
        return event.editorState
    } catch (error) {
        console.error("unable to get data: " + error + "\n" + error.stack)
    }

    return readyLevelState(null)
}

export class LevelSetControls extends HTMLElement {
    /** @type {HTMLElement} */
    controls

    /** @type {string} */
    path

    /** @type {EditorState} state */
    state

    constructor() {
        super();
        let template = /** @type {HTMLTemplateElement} */(document.getElementById("level-set-controls"))
        assert(!!template, "unable to retrieve template")
        let templateContent = template.content;

        const shadowRoot = this.attachShadow({ mode: "open" });
        shadowRoot.appendChild(templateContent.cloneNode(true));

        this.controls = shadowRoot.querySelector(".level-set-controls");
        this.path = this.getAttribute('initial-path')
        this.#fetchState()
    }

    #save = () => {
        save(this.state, this.path)
    }

    #delete = () => {
        never("todo")
    }

    #load = () => {
        this.path = this.#controls().path.value
        this.#fetchState()
    }

    #fetchState() {
        getState(this.path).
            then(state => {
                this.state = state;
                Bus.emit("editor-state-loaded", {type: "editor-state-loaded", state})
                this.#hydrateFromState(state);
            });
    }

    /** @param {UpdatedEvent} updated */
    #editorUpdated = (updated) => {
        this.state = updated.state;
        this.#save()
    }

    connectedCallback() {
        const controls = this.#controls()
        controls.save.addEventListener("click", this.#save);
        controls.load.addEventListener("click", this.#load);
        controls.delete.addEventListener("click", this.#delete);
        Bus.listen("editor-started", this.#hydrateFromState)
        Bus.listen("editor-updated", this.#editorUpdated)
    }

    disconnectedCallback() {
        const controls = this.#controls()
        controls.save.removeEventListener("click", this.#save);
        controls.load.removeEventListener("click", this.#load);
        controls.delete.removeEventListener("click", this.#delete);
        Bus.remove("editor-started", this.#hydrateFromState)
        Bus.remove("editor-updated", this.#editorUpdated)
    }

    /** @param {EditorState} state */
    #hydrateFromState = (state) => {
        const controls = this.#controls()
        controls.path.value = this.path

        const levelSet = State.levelSet(state)
        controls.title.value = levelSet.title
        controls.difficulty.value = "" + levelSet.difficulty
    }

    /**
     * @returns {{
     * path: HTMLInputElement,
     * title: HTMLInputElement,
     * difficulty: HTMLInputElement,
     * save: HTMLButtonElement,
     * load: HTMLButtonElement,
     * delete: HTMLButtonElement,
     * }}
     */
    #controls() {
        return {
            path: this.controls.querySelector("#level-path"),
            title: this.controls.querySelector("#level-set-title"),
            difficulty: this.controls.querySelector("#level-set-diff"),
            save: this.controls.querySelector("#save-level-set"),
            load: this.controls.querySelector("#load-level-set"),
            delete: this.controls.querySelector("#delete-level-set"),
        }
    }
}

export class LevelSelectControls extends HTMLElement {
    /** @type {HTMLElement} */
    controls

    constructor() {
        super();
        let template = /** @type {HTMLTemplateElement} */(document.getElementById("level-select-controls"))
        assert(!!template, "unable to retrieve template")
        let templateContent = template.content;

        const shadowRoot = this.attachShadow({ mode: "open" });
        shadowRoot.appendChild(templateContent.cloneNode(true));

        this.controls = shadowRoot.querySelector(".level-select-controls");
        Bus.listen("editor-started", this.hydrateFromState)
    }

    /** @param {EditorState} state */
    hydrateFromState = (state) => {
    }
}

