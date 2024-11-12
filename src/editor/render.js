import { assert } from "../assert.js"
import { Vector2D } from "../math/vector.js"
import { GAME_HEIGHT, GAME_WIDTH } from "../window.js"
import * as Utils from "./utils.js"

/**
 * TODO perf
 * easy win would be to put a tick on each platform every time it changes and only recalc / re-render when i need to
 * @param {EditorState} state
 */
export function render(state) {
    for (const row of state.elements) {
        for (const el of row) {
            if (el.selected) {
                el.el.classList.add("selected")
            } else {
                el.el.classList.remove("selected")
            }
        }
    }

    for (const plat of state.platforms) {
        renderPlatform(state, plat)
    }

    // TODO configure?
    const start = Utils.unproject(state, new Vector2D(5, 5))
    const dims = Utils.unproject(state, new Vector2D(5 + GAME_WIDTH, 5 + GAME_HEIGHT)).subtract(start)
    state.worldOutline.style.width = `${Math.ceil(dims.x)}px`
    state.worldOutline.style.height = `${Math.ceil(dims.y)}px`
    state.worldOutline.style.top = `${Math.ceil(start.y)}px`
    state.worldOutline.style.left = `${Math.ceil(start.x)}px`
}

/**
 * @param {EditorState} state
* @param {EditorPlatform} platform
*/
export function renderPlatform(state, platform) {
    const editor = state.editor
    assert(!!editor, "editor has to exist in the app")

    if (platform.el === null) {
        platform.el = document.createElement("div")
        editor.appendChild(platform.el)
        platform.el.classList.add("platform")
    }

    const aabb = platform.AABB
    const pos = aabb.pos
    const start = state.elements[pos.y][pos.x]

    const rect = start.el.getBoundingClientRect()
    const w = rect.width
    const h = rect.height
    const pW = w * aabb.width
    const pH = h * aabb.height

    platform.el.style.width = `${Math.ceil(pW)}px`
    platform.el.style.height = `${Math.ceil(pH)}px`
    platform.el.style.top = `${Math.ceil(rect.top)}px`
    platform.el.style.left = `${Math.ceil(rect.left)}px`

    if (state.mouse.state === "down") {
        platform.el.style.pointerEvents = "none"
    } else {
        platform.el.style.pointerEvents = "auto"
    }

    if (platform.selected) {
        platform.el.classList.add("selected")
    } else {
        platform.el.classList.remove("selected")
    }
}
