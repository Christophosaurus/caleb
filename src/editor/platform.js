import * as Bus from "../bus.js"
import { from2Vecs } from "../math/aabb.js";

export class PlatformControls extends HTMLElement {
    constructor() {
        super();
        Bus.listen("select-platform", (platform) => this.revealControls(platform))
        Bus.listen("deselect-platform", (platform) => this.hideControls(platform))
        Bus.listen("move-platform", (platform) => this.hideControls(platform))
    }

    /** @param {BusPlatform} platform */
    revealControls(platform) {
    }

    /** @param {BusPlatform} platform */
    hideControls(platform) {
    }

    /** @param {BusPlatform} platform */
    moveControls(platform) {
    }
}

/**
 * @param {ElementState[]} elements
 * @returns {EditorPlatform}
 */
export function createPlatform(elements) {
    const start = elements[0]
    const end = elements[elements.length - 1]

    return {
        selected: null,
        AABB: from2Vecs(start.pos, end.pos),
        behaviors: {},
        el: null,
    }
}

