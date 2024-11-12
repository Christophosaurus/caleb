import { assert } from "../assert.js";
import * as Bus from "../bus.js"
import * as Utils from "./utils.js"
import { from2Vecs } from "../math/aabb.js";

export class PlatformControls extends HTMLElement {
    /** @type {HTMLElement} */
    controls = null
    constructor() {
        super();
        Bus.listen("show-platform", (platform) => this.revealControls(platform))
        Bus.listen("hide-platform", (platform) => this.hideControls(platform))
        Bus.listen("move-platform", (platform) => this.moveControls(platform))
        Bus.listen("release-platform", (platform) => this.save(platform))

        let template = /** @type {HTMLTemplateElement} */(document.getElementById("platform-controls"))
        assert(!!template, "unable to retrieve template")
        let templateContent = template.content;

        const shadowRoot = this.attachShadow({ mode: "closed" });
        shadowRoot.appendChild(templateContent.cloneNode(true));

        this.controls = shadowRoot.querySelector(".platform-controls");
    }

    connectedCallback() { }

    /** @param {EditorPlatform} platform */
    revealControls(platform) {
        this.controls.classList.add("show")
        this.moveControls(platform)
    }

    /** @param {EditorPlatform} platform */
    hideControls(platform) {
        this.controls.classList.remove("show")
    }

    /** @param {EditorPlatform} platform */
    moveControls(platform) {
        const pos = Utils.unproject(platform.state, platform.AABB.pos)
        this.controls.style.top = `${pos.y}px`
        this.controls.style.left = `${pos.x}px`
    }

    /** @param {EditorPlatform} platform */
    save(platform) {
    }
}

/**
 * @param {EditorState} state
 * @returns {EditorPlatform}
 */
export function createPlatform(state) {
    const start = state.selectedElements[0]
    const end = state.selectedElements[state.selectedElements.length - 1]

    return {
        state,

        selected: null,
        AABB: from2Vecs(start.pos, end.pos),
        behaviors: {},
        el: null,
    }
}

