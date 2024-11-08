import { AABB } from "../../math/aabb.js";
import { Vector2D } from "../../math/vector.js";
import * as Window from "../../window.js";
import { debugForCallCount, debugForTickCount } from "../../debug.js";
import * as CalebInput from "./input.js";
import * as CalebPhysics from "./physics.js";
import * as Input from "../../input/input.js";
import { now } from "../../utils.js";

const debugLog = debugForCallCount(100);

/** @param state {GameState}
/** @returns {Caleb} */
export function createCaleb(state) {
    return {
        opts: state.opts.caleb,

        physics: {
            acc: new Vector2D(0, 0),
            vel: new Vector2D(0, 0),
            body: new AABB(state.level.activeLevel.initialPosition.clone(), 0.5, 1),
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
    const vel = state.caleb.physics.vel
    const cJump = caleb.jump;
    const jumpOpts = caleb.opts.jump;
    const jumping = cJump.jumping

    if (jumping) {
        if (cJump.jumpStart === null) {
            cJump.jumpStart = caleb.physics.body.pos.clone();
        }

        const dist = Math.abs(caleb.physics.body.pos.y - cJump.jumpStart.y);
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
    const vel = state.caleb.physics.vel

    const dash = caleb.dash;
    const opts = caleb.opts.dash;

    const dashing = dash.dashing
    if (dashing) {
        if (dash.dashStart === null) {
            dash.dashStart = caleb.physics.body.pos.clone();
        }

        const dist = Math.abs(caleb.physics.body.pos.x - dash.dashStart.x);
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
function updatePosition(state, delta) {
    const caleb = state.caleb;
    const pos = caleb.physics.body.pos;
    const vel = caleb.physics.vel;

    let deltaNorm = delta / 1000;

    if (updateDash(state, delta)) {
    } else if (updateJump(state, delta)) {
    } else {
        vel.add(state.opts.gravity.multiplyCopy(deltaNorm));
    }

    const nextPos = pos.addCopy(vel.multiplyCopy(deltaNorm));
    const nextAABB = new AABB(nextPos, caleb.physics.body.width, caleb.physics.body.height);

    CalebPhysics.testCollisions(state, nextPos, nextAABB);

    pos.set(nextPos);
}

/**
* @param gameState {GameState}
*/
export function render(gameState) {
    const caleb = gameState.caleb
    const ctx = gameState.ctx;
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

    // techincally i could move this into the engine side not in each update
    Window.project(gameState.ctx.canvas, caleb);
}

/**
* @param state {GameState}
*/
export function tickClear(state) {
    const caleb = state.caleb
    if (!caleb.dead && caleb.physics.body.pos.y > Window.FULL_HEIGHT + 3) {
        caleb.dead = true;
        caleb.deadAt = now();
    }
}
