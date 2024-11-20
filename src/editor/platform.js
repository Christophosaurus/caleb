import { assert } from "../assert.js";
import * as Bus from "../bus.js"
import * as Utils from "./utils.js"
import { from2Vecs } from "../math/aabb.js";
import { Vector2D } from "../math/vector.js";
import * as Consts from "./consts.js"
import * as Level from "../objects/level/level.js"

/**
 * @param {EditorPlatform} platform
 */
function assertSelected(platform) {
    assert(!!platform.selected, "expected platform to be selected")
}

export class PlatformControls extends HTMLElement {
    /** @type {HTMLElement} */
    controls = null

    /**
     * @param {Event} evt
     */
    change = (evt) => {
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

    constructor() {
        super();
        // TODO can i have multiple of these??
        Bus.listen("show-platform", (platform) => this.revealControls(platform))
        Bus.listen("hide-platform", () => this.hideControls())
        Bus.listen("move-platform", (platform) => this.moveControls(platform))
        Bus.listen("release-platform", (platform) => this.save(platform))
        Bus.listen("delete-platform", (platform) => this.hideControls())
        Bus.listen("resize", this.change);

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
            v.addEventListener("change", this.change)
        }
    }

    hideControls() {
        this.lastPlatform = null
        this.controls.classList.remove("show")
        for (const [_, v] of Object.entries(this.getControls())) {
            v.removeEventListener("change", this.change)
        }
    }

    /** @param {EditorPlatform} platform */
    moveControls(platform) {
        const topPos = platform.AABB.pos.clone().subtract(new Vector2D(0, 3))
        let pos = Utils.unproject(platform.state, topPos)

        if (pos.y < 0) {
            const topPos = platform.AABB.pos.clone().add(new Vector2D(0, platform.AABB.height + 0.5))
            pos = Utils.unproject(platform.state, topPos)
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

/**
 * @param {EditorState} state
 * @param {ElementState} start
 * @param {ElementState} end
 * @returns {EditorPlatform}
 */
export function createPlatform(state, start, end) {

    return {
        state,

        selected: null,
        AABB: from2Vecs(start.pos, end.pos),
        behaviors: {},
        el: null,
    }
}

/**
 * @param {EditorState} state
 * @param {EditorPlatform} platform
 * @returns {number}
 */
export function selectedDuration(state, platform) {
    assertSelected(platform)
    return state.tick - platform.selected.tick
}

/**
 * @param {EditorState} state
 * @param {EditorPlatform} platform
 * @returns {BasedPlatform}
 */
export function toPlatform(state, platform) {
    const aabb = platform.AABB.clone()
    const m = state.outerRect.margin
    aabb.pos.subtract(new Vector2D(m, m))
    const plat = Level.createPlatform(aabb)

    plat.behaviors.circuit = platform.behaviors.circuit
    plat.behaviors.next = platform.behaviors.next
    plat.behaviors.instagib = platform.behaviors.instagib
    plat.behaviors.obstacle = platform.behaviors.obstacle
    plat.behaviors.lettered = platform.behaviors.lettered

    if (platform.behaviors.render) {
        plat.behaviors.render = {
            renderX: 0,
            renderY: 0,
            renderWidth: 0,
            renderHeight: 0,
        }
    }

    return plat
}


/**
 * @param {EditorPlatform} platform
 * @returns {boolean}
 */
export function isMoving(platform) {
    assertSelected(platform)
    return platform.selected.moving
}

/**
 * @param {EditorPlatform} platform
 * @param {Vector2D} pos
 */
export function moveTo(platform, pos) {
    assertSelected(platform)

    platform.AABB.pos = pos.clone()
    const wasMoving = isMoving(platform)
    if (wasMoving) {
        return false;
    }

    const dist = platform.selected.starting.clone().subtract(pos).magnituteSquared()
    return orInMoving(platform, dist > Consts.platform.sqDistForMoving);
}

/**
 * @param {EditorPlatform} platform
 * @param {boolean} moving
 * @returns {boolean}
 */
export function orInMoving(platform, moving) {
    assertSelected(platform)
    platform.selected.moving ||= moving
    return platform.selected.moving
}

/**
 * @param {EditorPlatform} platform
 * @returns {boolean}
 */
export function isDown(platform) {
    assertSelected(platform)
    return platform.selected.down
}

/**
 * @param {EditorPlatform} platform
 * @returns {Vector2D}
 */
export function offset(platform) {
    assertSelected(platform)
    return platform.selected.offset
}

/**
 * @param {EditorPlatform} platform
 * @returns {Vector2D}
 */
export function start(platform) {
    assertSelected(platform)
    return platform.selected.starting
}
