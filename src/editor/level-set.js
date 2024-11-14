import { assert } from "../assert.js";

export class LevelSetControls extends HTMLElement {
    /** @type {HTMLElement} */
    controls

    constructor() {
        super();
        let template = /** @type {HTMLTemplateElement} */(document.getElementById("level-set-controls"))
        assert(!!template, "unable to retrieve template")
        let templateContent = template.content;

        const shadowRoot = this.attachShadow({ mode: "open" });
        shadowRoot.appendChild(templateContent.cloneNode(true));

        this.controls = shadowRoot.querySelector(".level-set-controls");
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
    }
}

