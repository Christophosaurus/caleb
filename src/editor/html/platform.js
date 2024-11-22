import { assert, never } from "../../assert.js";
import * as Bus from "../../bus.js"
import { Vector2D } from "../../math/vector.js";
import * as Utils from "../utils.js"


export class PlatformControls extends HTMLElement {
    /** @type {HTMLElement} */
    controls = null

    /** @type {SizeChangeEvent} */
    rects = null

    /**
     * @param {Event} evt
     */
    #change = (evt) => {
        if (evt.type === "resize" && this.lastPlatform) {
            this.moveControls(this.lastPlatform);
            return
        }
        this.setInputState()
    }

    setInputState = () => {
        const {
            obstacle,
            instagib,
            circuit,
            circuitStartX,
            circuitStartY,
            circuitEndX,
            circuitEndY,
            nextLevel,
            nextLevelLevel,
        } = this.getControls()
        instagib.disabled = obstacle.checked
        obstacle.disabled = instagib.checked
        circuitStartX.disabled = !circuit.checked
        circuitStartY.disabled = !circuit.checked
        circuitEndX.disabled = !circuit.checked
        circuitEndY.disabled = !circuit.checked
        nextLevelLevel.disabled = !nextLevel.checked
    }

    /**
     * @type {EditorPlatform | null}
     */
    lastPlatform = null

    /**
     * @param {SizeChangeEvent} change
     */
    #sizeChanged = (change) => {
        this.rects = change;
    }

    constructor() {
        super();
        // TODO can i have multiple of these??
        Bus.listen("show-platform", (platform) => this.revealControls(platform))
        Bus.listen("hide-platform", () => this.hideControls())
        Bus.listen("move-platform", () => this.hideControls())
        Bus.listen("release-platform", (platform) => this.save(platform))
        Bus.listen("delete-platform", () => this.hideControls())
        Bus.listen("resize", this.#change);
        Bus.listen("editor-size-change", this.#sizeChanged);

        let template = /** @type {HTMLTemplateElement} */(document.getElementById("platform-controls"))
        assert(!!template, "unable to retrieve template")
        let templateContent = template.content;

        const shadowRoot = this.attachShadow({ mode: "closed" });
        shadowRoot.appendChild(templateContent.cloneNode(true));

        this.controls = shadowRoot.querySelector(".platform-controls");
    }

    /** @param {EditorPlatform} platform */
    revealControls(platform) {
        this.lastPlatform = platform
        this.controls.classList.add("show")
        this.hydrateState(platform)
        this.setInputState()
        this.moveControls(platform)
        for (const [_, v] of Object.entries(this.getControls())) {
            v.addEventListener("change", this.#change)
        }
    }

    hideControls() {
        this.lastPlatform = null
        this.controls.classList.remove("show")
        for (const [_, v] of Object.entries(this.getControls())) {
            v.removeEventListener("change", this.#change)
        }
    }

    /** @param {EditorPlatform} platform */
    moveControls(platform) {
        assert(!!this.rects, "somehow rects were not set")

        const rect = this.controls.getBoundingClientRect()
        let pos = Utils.unproject(this.rects, platform.AABB.pos).subtract(new Vector2D(0, rect.height))

        if (pos.y < 0) {
            const topPos = platform.AABB.pos.clone().add(new Vector2D(0, platform.AABB.height + 0.5))
            pos = Utils.unproject(this.rects, topPos)
        }

        this.controls.style.top = `${pos.y}px`
        this.controls.style.left = `${pos.x}px`

    }

    /** @param {EditorPlatform} platform */
    save(platform) {
        this.hideControls()
        const {
            obstacle,
            instagib,
            circuit,
            circuitStartX,
            circuitStartY,
            circuitEndX,
            circuitEndY,
            nextLevel,
            nextLevelLevel,
            render,
        } = this.values()

        platform.behaviors.obstacle = !nextLevel && obstacle ? {type: "obstacle"} : undefined
        platform.behaviors.instagib = !nextLevel && instagib ? {type: "instagib"} : undefined
        platform.behaviors.circuit = !nextLevel && circuit ? {
            type: "circuit",
            startPos: new Vector2D(circuitStartX, circuitStartY),
            endPos: new Vector2D(circuitEndX, circuitEndY),

            // TODO: time?
            time: 1000,
            currentDir: 1,
            currentTime: 0,
        } : undefined
        platform.behaviors.render = !nextLevel && render ? {type: "render"} : undefined
        platform.behaviors.next = nextLevel ? {
            type: "next-level",
            toLevel: nextLevelLevel,
            toLevelPosition: new Vector2D(0, 0),
        } : undefined

        Bus.editorChange()
    }

    /** @param {EditorPlatform} platform */
    hydrateState(platform) {
        const {
            obstacle,
            instagib,
            circuit,
            circuitStartX,
            circuitStartY,
            circuitEndX,
            circuitEndY,
            nextLevel,
            nextLevelLevel,
            render,
        } = this.getControls()

        const behaviors = platform.behaviors
        obstacle.checked = !!behaviors.obstacle
        instagib.checked = !!behaviors.instagib
        render.checked = !!behaviors.render

        if (behaviors.next) {
            nextLevel.checked = true
            nextLevelLevel.value = String(behaviors.next.toLevel)
        }

        if (behaviors.circuit) {
            circuit.checked = true
            circuitStartX.value = String(behaviors.circuit.startPos.x)
            circuitStartY.value = String(behaviors.circuit.startPos.y)
            circuitEndX.value = String(behaviors.circuit.endPos.x)
            circuitEndY.value = String(behaviors.circuit.endPos.y)

        }
    }

    values() {
        const controls = this.getControls()
        const out = {}
        for (const [k, v] of Object.entries(controls)) {
            if (v.type === "checkbox") {
                out[k] = v.checked
            } else {
                out[k] = +v.value
            }
        }

        return out
    }

    /**
     * @returns {Record<string, HTMLInputElement>}
     */
    getControls() {
        return {
            obstacle: /** @type {HTMLInputElement} */this.controls.querySelector("#obstacle"),
            instagib: /** @type {HTMLInputElement} */this.controls.querySelector("#instagib"),
            circuit: /** @type {HTMLInputElement} */this.controls.querySelector("#circuit"),
            circuitStartX: /** @type {HTMLInputElement} */this.controls.querySelector("#circuit-sx"),
            circuitStartY: /** @type {HTMLInputElement} */this.controls.querySelector("#circuit-sy"),
            circuitEndX: /** @type {HTMLInputElement} */this.controls.querySelector("#circuit-ex"),
            circuitEndY: /** @type {HTMLInputElement} */this.controls.querySelector("#circuit-ey"),
            nextLevel: /** @type {HTMLInputElement} */this.controls.querySelector("#next-level"),
            nextLevelLevel: /** @type {HTMLInputElement} */this.controls.querySelector("#nl-id"),
            render: /** @type {HTMLInputElement} */this.controls.querySelector("#render"),
        };
    }
}


