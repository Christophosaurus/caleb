import * as CalebInput from "./input.js";
import { Vector2D } from "../../math/vector.js";
import { AABB } from "../../math/aabb.js";
import { assert } from "../../assert.js";
import { DO_NOT_USE_FOR_INITIAL_POS_OR_YOU_WILL_BE_FIRED } from "../level/level.js";

/**
 * @param {GameState} state
 */
export function testCollisions(state) {
    if (state.caleb.hodl.hodlTime > 0) {
        return
    }

    const platforms = findCollisions(state)

    for (const p of platforms) {
        if (p.behaviors.obstacle) {
            collidePlatform(state, p)
        } else if (p.behaviors.next) {
            collideLevelChange(state, p)
        } else if (p.behaviors.instaGib) {
            collideInstagib(state)
        }
    }
}

/**
 * @param {GameState} state
 * @returns {BasedPlatform[]}
 */
function findCollisions(state) {
    const nextAABB = state.caleb.physics.next.body;
    const out = []
    for (const platform of state.level.activeLevel.platforms) {
        const platformAABB = platform.physics.next.body;
        if (nextAABB.intersects(platformAABB)) {
            out.push(platform)
        }
    }
    return out
}

/**
 * @param {GameState} state
 * @param {BasedPlatform} platform
 */
function collidePlatform(state, platform) {
    const prev = state.caleb.physics.current;
    const next = state.caleb.physics.next;
    const body = next.body;
    const dash = state.caleb.dash;
    const opts = state.opts;
    const tolerance = opts.tolerance

    const platformAABB = platform.physics.next.body

    const left = prev.body.leftOf(platform.physics.current.body)
    const right = prev.body.rightOf(platform.physics.current.body)
    const top = prev.body.topOf(platform.physics.current.body)
    const bottom = prev.body.bottomOf(platform.physics.current.body)

    if (left || right) {
        if (dash.dashing && body.topOverlapBy(platformAABB, tolerance.topBy)) {
            body.pos.y = platformAABB.pos.y - body.height
        } else if (dash.dashing && body.bottomOverlapBy(platformAABB, tolerance.bottomBy)) {
            body.pos.y = platformAABB.pos.y + platformAABB.pos.y
        } else {
            next.vel.x = 0;
            if (left) {
                body.pos.x = platformAABB.pos.x - body.width;
            } else {
                body.pos.x = platformAABB.pos.x + platformAABB.width
            }

            CalebInput.resetDashState(state);
        }
    } else if (top || bottom) {
        next.vel.y = 0;

        if (top) {
            body.pos.y = platformAABB.pos.y - body.height
        } else {
            body.pos.y = platformAABB.pos.y + platformAABB.height
        }

        CalebInput.resetJumpState(state);
    } else {
        collideInstagib(state)
    }
}

/**
 * @param {GameState} state
 * @param {BasedPlatform} p
 */
function collideLevelChange(state, p) {
    const platform = p.behaviors.next
    const next = state.caleb.physics.next;
    const body = next.body;
    const idx = platform.toLevel;
    const nextLevel = state.level.levels[idx]
    const level = state.level;

    assert(nextLevel !== undefined, "unable to find next level", "idx", idx, "len", state.level.levels.length);

    state.levelChanged = true
    level.activeLevel = nextLevel

    if (platform.toLevelPosition.x !== DO_NOT_USE_FOR_INITIAL_POS_OR_YOU_WILL_BE_FIRED) {
        body.pos.x = platform.toLevelPosition.x
    } else if (platform.toLevelPosition.y !== DO_NOT_USE_FOR_INITIAL_POS_OR_YOU_WILL_BE_FIRED) {
        body.pos.y = platform.toLevelPosition.y
    }

    if (!state.caleb.dash.dashing && !state.caleb.jump.jumping) {
        next.vel.multiply(0.5)
    }

    state.level.activeLevel.initialPosition = body.pos.clone()

}

/**
 * @param {GameState} state
 */
function collideInstagib(state) {
    state.caleb.dead = true
    state.caleb.deadAt = state.now()
}
