import { AABB } from "../../math/aabb.js";
import { Vector2D } from "../../math/vector.js";
import * as Window from "../../window.js";
import { debugForCallCount, debugForTickCount } from "../../debug.js";
import * as CalebInput from "./input.js";
import {CALEB_HEIGHT as HEIGHT, CALEB_WIDTH as WIDTH} from "./utils.js";
import * as CalebPhysics from "./physics.js";

const debugLog = debugForCallCount(100);

/** @param state {GameState}
/** @returns {Caleb} */
export function createCaleb(state) {
    return {
        opts: state.opts.caleb,

        platform: {
            platform: null,
            tick: 0,
        },

        physics: {
            current: {
                acc: new Vector2D(0, 0),
                vel: new Vector2D(0, 0),
                body: new AABB(state.level.activeLevel.initialPosition.clone(), 0.5, 1),
            },
            next: {
                acc: new Vector2D(0, 0),
                vel: new Vector2D(0, 0),
                body: new AABB(state.level.activeLevel.initialPosition.clone(), 0.5, 1),
            }
        },

        dead: false,
        deadAt: 0,

        hodl: CalebInput.defaultHodlState(state.opts.caleb),
        jump: CalebInput.defaultJumpState(),
        dash: CalebInput.defaultDashStat(),
        fFtT: CalebInput.defaultfFtT(),

        renderWidth: 0,
        renderHeight: 0,
        renderX: 0,
        renderY: 0,

        // I don't know wghat the canvas coloring mechanism is yet
        renderColor: "#FFFFFF",
    };
}

/**
* @param state {GameState}
* @param delta {number}
* @returns {boolean}
*/
function updateJump(state, delta) {
    const deltaNorm = delta / 1000
    const caleb = state.caleb
    const next = state.caleb.physics.next;
    const body = next.body
    const vel = next.vel
    const cJump = caleb.jump;
    const jumpOpts = caleb.opts.jump;
    const jumping = cJump.jumping

    if (jumping) {
        if (cJump.jumpStart === null) {
            cJump.jumpStart = body.pos.clone();
        }

        const dist = Math.abs(body.pos.y - cJump.jumpStart.y);
        const remaining = cJump.jumpDistance - dist;
        const easing = remaining <= jumpOpts.jumpEaseRange

        let jump = cJump.jumpDir * jumpOpts.jumpNormHeight;
        let jumpNormDist = jump * deltaNorm;
        if (!easing && remaining - Math.abs(jumpNormDist) <= jumpOpts.jumpEaseRange) {

            const correctedDist = remaining - jumpOpts.jumpEaseRange;
            const correctedJump = correctedDist / deltaNorm

            // 0.01 is a bonus to force into easing
            jump = cJump.jumpDir * (correctedJump + 0.01);
        } else if (easing) {
            jump = cJump.jumpDir * jumpOpts.jumpEaseRange * 2;
        }

        cJump.jumping = remaining > 0;
        vel.y = jump
    }

    cJump.noJumpTime -= delta
    return jumping
}

/**
* @param state {GameState}
* @param delta {number}
* @returns {boolean}
*/
function updateDash(state, delta) {
    const deltaNorm = delta / 1000
    const caleb = state.caleb
    const next = caleb.physics.next;
    const body = next.body
    const vel = next.vel

    const dash = caleb.dash;
    const opts = caleb.opts.dash;

    const dashing = dash.dashing
    if (dashing) {
        if (dash.dashStart === null) {
            dash.dashStart = body.pos.clone();
        }

        const dist = Math.abs(body.pos.x - dash.dashStart.x);
        const remaining = dash.dashDistance - dist;
        const easing = remaining <= opts.dashEaseRange

        let dashDist = dash.dashDir * opts.dashNormWidth;
        let dashNormDist = dashDist * deltaNorm;

        if (!easing && remaining - Math.abs(dashNormDist) <= opts.dashEaseRange) {

            const correctedDist = remaining - opts.dashEaseRange;
            const correctedJump = correctedDist / deltaNorm

            // 0.01 is a bonus to force into easing
            dashDist = dash.dashDir * (correctedJump + 0.01);
        } else if (easing) {
            dashDist = dash.dashDir * opts.dashEaseRange * 2;
        }

        dash.dashing = remaining > 0;
        vel.x = dashDist
    }

    dash.noDashTime -= delta
    return dashing
}

/**
* @param state {GameState}
* @param delta {number}
*/
function forceRemainingOnMovingPlatform(state, delta) {
    const plat = state.caleb.platform

    if (
        plat.platform && state.tick - 1 > plat.tick ||
        !plat.platform ||
        state.caleb.dash.dashing || state.caleb.jump.jumping
    ) {
        return
    }

    const pphys = plat.platform.physics.next
    const cphys = state.caleb.physics.next
    if (pphys.body.intersects(cphys.body)) {
        return
    }

    const diff = pphys.body.pos.y - (cphys.body.pos.y + HEIGHT)
    cphys.body.pos.y += diff
}

/**
* @param state {GameState}
* @param delta {number}
*/
function updatePosition(state, delta) {
    const caleb = state.caleb;
    const next = caleb.physics.next;
    const pos = next.body.pos
    const vel = next.vel

    let deltaNorm = delta / 1000;

    if (updateDash(state, delta)) {
    } else if (updateJump(state, delta)) {
    } else {
        vel.add(state.opts.gravity.multiplyCopy(deltaNorm));
        forceRemainingOnMovingPlatform(state, delta)
    }

    next.body.pos = pos.add(vel.clone().multiply(deltaNorm));
    if (next.vel2) {
        next.body.pos = pos.add(next.vel2.clone().multiply(deltaNorm));
    }
}

/**
 * @param {GameState} state
 * @param {number} _
 */
export function check(state, _) {
    CalebPhysics.testCollisions(state);
}

/**
* @param state {GameState}
* @param _ {number}
*/
export function apply(state, _) {

    const next = state.caleb.physics.next;
    const curr = state.caleb.physics.current;

    curr.body.set(next.body)
    curr.vel.set(next.vel)
    curr.acc.set(next.acc)

    // techincally i could move this into the engine side not in each update
    Window.project(state.ctx.canvas, state.caleb, next.body);
}

/**
* @param {GameState} state
*/
export function render(state) {
    state.ctx.fillStyle = "black";
    const caleb = state.caleb
    const ctx = state.ctx;
    ctx.fillRect(caleb.renderX, caleb.renderY, caleb.renderWidth, caleb.renderHeight);
}

/**
* @param gameState {GameState}
* @param delta {number}
*/
export function update(gameState, delta) {
    const caleb = gameState.caleb
    if (caleb.dead || delta === 0) {
        return;
    }

    if (caleb.hodl.hodlTime > 0) {
        caleb.hodl.hodlTime -= delta
    } else {
        updatePosition(gameState, delta);
    }

}

/**
* @param state {GameState}
*/
export function tickClear(state) {
    const caleb = state.caleb
    if (!caleb.dead && caleb.physics.current.body.pos.y > Window.FULL_HEIGHT + 3) {
        caleb.dead = true;
        caleb.deadAt = state.now()
    }
}
