import * as CalebInput from "./input.js";
import { Vector2D } from "../../math/vector.js";
import { AABB } from "../../math/aabb.js";
import { assert } from "../../assert.js";
import { DO_NOT_USE_FOR_INITIAL_POS_OR_YOU_WILL_BE_FIRED } from "../level/level.js";

/**
 * @param {GameState} state
 * @param {Vector2D} nextPos
 * @param {AABB} nextAABB
 */
export function testCollisions(state, nextPos, nextAABB) {
    if (state.caleb.hodl.hodlTime > 0) {
        return
    }

    const platforms = findCollisions(state, nextAABB)
    for (const p of platforms) {
        if (p.type === "obstacle") {
            collidePlatform(state, nextPos, p.physics.body)
        } else if (p.type === "next-level") {
            collideLevelChange(state, nextPos, p)
        }
    }
}

/**
 * @param {GameState} state
 * @param {AABB} nextAABB
 * @returns {Platform[]}
 */
function findCollisions(state, nextAABB) {
    const out = []
    for (const platform of state.level.activeLevel.platforms) {
        const platformAABB = platform.physics.body;
        if (nextAABB.intersects(platformAABB)) {
            out.push(platform)
        }
    }
    return out
}

/**
 * @param {GameState} state
 * @param {Vector2D} nextPos
 * @param {AABB} platformAABB
 */
function collidePlatform(state, nextPos, platformAABB) {
    const physics = state.caleb.physics;
    const body = physics.body;
    const dash = state.caleb.dash;
    const opts = state.opts;
    const tolerance = opts.tolerance

    const left = body.leftOf(platformAABB)
    const right = physics.body.rightOf(platformAABB)
    if (left || right) {
        if (dash.dashing && body.topOverlapBy(platformAABB, tolerance.topBy)) {
            nextPos.y = platformAABB.pos.y - body.height
        } else if (dash.dashing && body.bottomOverlapBy(platformAABB, tolerance.bottomBy)) {
            nextPos.y = platformAABB.pos.y + platformAABB.pos.y
        } else {
            physics.vel.x = 0;
            if (left) {
                nextPos.x = platformAABB.pos.x - state.caleb.physics.body.width;
            } else {
                nextPos.x = platformAABB.pos.x + platformAABB.width
            }

            CalebInput.resetDashState(state);
        }
    } else {
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
    }
}

/**
 * @param {GameState} state
 * @param {Vector2D} nextPos
 * @param {NextLevelPlatform} platform
 */
function collideLevelChange(state, nextPos, platform) {
    const idx = platform.toLevel;
    const next = state.level.levels[idx]
    const level = state.level;

    assert(next !== undefined, "unable to find next level", "idx", idx, "len", state.level.levels.length);

    state.levelChanged = true
    level.activeLevel = next

    if (platform.toLevelPosition.x !== DO_NOT_USE_FOR_INITIAL_POS_OR_YOU_WILL_BE_FIRED) {
        nextPos.x = platform.toLevelPosition.x
    } else if (platform.toLevelPosition.y !== DO_NOT_USE_FOR_INITIAL_POS_OR_YOU_WILL_BE_FIRED) {
        nextPos.y = platform.toLevelPosition.y
    }

    if (!state.caleb.dash.dashing && !state.caleb.jump.jumping) {
        state.caleb.physics.vel.y /= 2
    }

    state.level.activeLevel.initialPosition = nextPos.clone()

}


