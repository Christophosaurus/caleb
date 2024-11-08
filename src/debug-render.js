import { Vector2D } from "./math/vector.js";
import { AABB } from "./math/aabb.js";
import * as CalebUtils from "./objects/caleb/utils.js"
import * as Window from "./window.js"

/**
 * @param {GameState} state
 * @param {Vector2D} pos
 * @param {number} w
 * @param {number} h
 */
function stroke(state, pos, w, h) {
    const aabb = new AABB(pos, w, h);
    state.ctx.strokeRect(...Window.projectAABB(state.ctx.canvas, aabb))
}

/**
 * @param {GameState} state
 */
export function render(state) {
    if (!state.opts.debug) {
        return
    }

    state.ctx.strokeStyle = "red";
    state.ctx.lineWidth = 3;

    const dash = state.caleb.dash
    const jump = state.caleb.jump
    if (dash.dashing) {
        stroke(state, dash.dashStart, dash.dashDir * dash.dashDistance, CalebUtils.CALEB_HEIGHT)
    } else if (jump.jumping) {
        stroke(state, jump.jumpStart, CalebUtils.CALEB_WIDTH, jump.jumpDir * jump.jumpDistance)
    }

    state.ctx.strokeStyle = "green";

    for (const p of state.level.activeLevel.platforms) {
        const next = p.behaviors.next
        if (!next) {
            continue
        }

        const body = p.physics.body
        stroke(state, body.pos, body.width, body.height)
    }
}
