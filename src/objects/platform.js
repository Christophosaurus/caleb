import { AABB } from "../math/aabb.js";
import { Vector2D } from "../math/vector.js";

/** @param state {GameState}
*/
export function render(state) {
    const envs = state.platforms
    const ctx = state.ctx;

    for (const e of envs) {
        ctx.fillRect(e.renderX, e.renderY, e.renderWidth, e.renderHeight);
    }
}

/**
 * @param aabb {AABB}
 * @returns {EnvironmentObject}
*/
export function createPlatform(aabb) {
    return {
        physics: {
            vel: new Vector2D(0, 0),
            acc: new Vector2D(0, 0),
            body: aabb,
        },
        renderX: 0,
        renderY: 0,
        renderWidth: 0,
        renderHeight: 0,
    };
}
