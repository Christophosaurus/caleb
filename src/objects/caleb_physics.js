import * as CalebInput from "./caleb_input.js";
import { Vector2D } from "../math/vector.js";
import { AABB } from "../math/aabb.js";

/**
 * @param state {GameState}
 * @param nextPos {Vector2D}
 * @param nextAABB {AABB}
 */
export function testCollisions(state, nextPos, nextAABB) {
    const physics = state.caleb.physics;
    const body = physics.body;
    const dash = state.caleb.dash;
    const opts = state.opts;
    const jump = state.caleb.jump;

    for (const platform of state.platforms) {
        const platformAABB = platform.physics.body;
        if (nextAABB.intersects(platformAABB)) {
            const left = body.leftOf(platformAABB)
            const right = physics.body.rightOf(platformAABB)
            if (left || right) {
                if (dash.dashing && body.topOverlapBy(platformAABB, opts.dash.topBy)) {
                    nextPos.y = platformAABB.pos.y - body.height
                } else if (dash.dashing && body.bottomOverlapBy(platformAABB, opts.dash.bottomBy)) {
                    nextPos.y = platformAABB.pos.y + platformAABB.pos.y
                } else {
                    physics.vel.x = 0;
                    if (left) {
                        nextPos.x = platformAABB.pos.x - state.caleb.physics.body.width;
                    } else {
                        nextPos.x = platformAABB.pos.x + platformAABB.pos.x
                    }

                    // TODO dashes should allow for a certain % of the body to "step onto" the platform
                    CalebInput.resetDashState(state);
                }
                break;
            }

            const top = body.topOf(platformAABB)
            const bottom = physics.body.bottomOf(platformAABB)

            if (top || bottom) {
                physics.vel.y = 0;

                if (top) {
                    nextPos.y = platformAABB.pos.y - state.caleb.physics.body.height
                } else {
                    nextPos.y = platformAABB.pos.y + platformAABB.height
                }

                CalebInput.resetJumpState(state);
            }
            break;
        }
    }
}


