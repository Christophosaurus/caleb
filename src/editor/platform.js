import { assert } from "../assert.js";
import * as Bus from "../bus.js"
import * as Utils from "./utils.js"
import { from2Vecs } from "../math/aabb.js";

export class PlatformControls extends HTMLElement {
    /** @type {HTMLElement} */
    controls = null

    change = (evt) => {
        console.log(evt)
    }

    constructor() {
        super();
        // TODO can i have multiple of these??
        Bus.listen("show-platform", (platform) => this.revealControls(platform))
        Bus.listen("hide-platform", () => this.hideControls())
        Bus.listen("move-platform", (platform) => this.moveControls(platform))
        Bus.listen("release-platform", (platform) => this.save(platform))

        let template = /** @type {HTMLTemplateElement} */(document.getElementById("platform-controls"))
        assert(!!template, "unable to retrieve template")
        let templateContent = template.content;

        const shadowRoot = this.attachShadow({ mode: "closed" });
        shadowRoot.appendChild(templateContent.cloneNode(true));

        this.controls = shadowRoot.querySelector(".platform-controls");
    }

    /** @param {EditorPlatform} platform */
    revealControls(platform) {
        this.controls.classList.add("show")
        this.moveControls(platform)
    }

    hideControls() {
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
        this.hideControls()
        console.log(this.values())
    }

    values() {
        return {
            obstacle: /** @type {HTMLInputElement} */(this.controls.querySelector("#obstacle")).value == "on",
            instagib: /** @type {HTMLInputElement} */(this.controls.querySelector("#instagib")).value == "on",
        };
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

