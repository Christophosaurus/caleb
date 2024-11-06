import { AABB } from "../math/aabb.js";
import { Vector2D } from "../math/vector.js";
import * as Window from "../window.js";
import { debugForCallCount, debugForTickCount } from "../debug.js";
import { createCalebInputHandler } from "./caleb_input.js";
import * as Input from "../input/input.js";

const debugLog = debugForCallCount(100);

const inputHandlerMap = createCalebInputHandler()

/** @param opts {CalebOpts}
/** @returns {Caleb} */
export function createCaleb(opts) {
    return {
        opts: opts,

        physics: {
            acc: new Vector2D(0, 0),
            vel: new Vector2D(0, 0),
            body: new AABB(new Vector2D(0, 0), 0.5, 1),
        },

        jumping: false,
        jumpDistance: 0,
        noJumpTime: 0,
        jumpStart: new Vector2D(),

        renderWidth: 0,
        renderHeight: 0,
        renderX: 0,
        renderY: 0,

        // I don't know wghat the canvas coloring mechanism is yet
        renderColor: "#FFFFFF",
    };
}

const reducedKeys = Input.keys.filter(k => k !== "l" && k !== "h")

/**
* @param gameState {GameState}
*/
function handleInput(gameState) {
    const input = gameState.input.inputs;
    for (const k of reducedKeys) {
        inputHandlerMap[k](gameState, input[k]);
    }

    if (!inputHandlerMap.h(gameState, input.h) && !inputHandlerMap.l(gameState, input.l)) {
        gameState.caleb.physics.vel.x = 0;
    }
}

/**
 * @param state {GameState}
 * @param nextPos {Vector2D}
 * @param nextAABB {AABB}
 */
function testCollisions(state, nextPos, nextAABB) {

    for (const platform of state.platforms) {
        const platformAABB = platform.physics.body;
        if (nextAABB.intersects(platformAABB)) {
            if (nextPos.y + state.caleb.physics.body.height > platformAABB.pos.y) {
                nextPos.y = platformAABB.pos.y - state.caleb.physics.body.height;
            }

            state.caleb.physics.vel.y = 0;
            state.caleb.jumping = false;
            break
        }
    }
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
    const gravityEffect = state.opts.gravity.multiplyCopy(deltaNorm);

    if (caleb.jumping) {
        const dist = Math.abs(caleb.physics.body.pos.y - caleb.jumpStart.y);
        const remaining = caleb.jumpDistance - dist;
        const easing = remaining <= caleb.opts.jumpEaseRange

        let jump = -caleb.opts.jumpNormHeight;
        let jumpNormDist = jump * deltaNorm;
        if (!easing && remaining + jumpNormDist <= caleb.opts.jumpEaseRange) {

            const correctedDist = remaining - caleb.opts.jumpEaseRange;
            const correctedJump = correctedDist / deltaNorm

            // 0.01 is a bonus to force into easing
            jump = -(correctedJump + 0.01);
        } else if (easing) {
            jump = -caleb.opts.jumpEaseRange * 2;
        }

        caleb.jumping = remaining > 0;
        vel.y = jump
    } else {
        vel.add(gravityEffect);
    }

    caleb.noJumpTime -= delta

    const nextPos = pos.addCopy(vel.multiplyCopy(deltaNorm));
    const nextAABB = new AABB(nextPos, caleb.physics.body.width, caleb.physics.body.height);

    testCollisions(state, nextPos, nextAABB);

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
    handleInput(gameState);
    updatePosition(gameState, delta);

    // techincally i could move this into the engine side not in each update
    Window.project(gameState.ctx.canvas, caleb);
}

/**
* @param _ {GameState}
*/
export function tickClear(_) { }


