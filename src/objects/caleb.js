import { AABB } from "../math/aabb.js";
import { Vector2D } from "../math/vector.js";
import * as Window from "../window.js";

/** @type CalebInputHandlerMap */
const inputHandlerMap = {
    h: (state, timing) => {
        const hold = timing.tickHoldDuration;
        if (hold === 0) {
            state.caleb.physics.vel.x = 0;
            return;
        }

        const x = -state.opts.caleb.normWidthsPerSecond * (hold / 1000);
        state.caleb.physics.vel.x = x;
    },
    l: (state, timing) => {
        const hold = timing.tickHoldDuration;
        if (hold === 0) {
            state.caleb.physics.vel.x = 0;
            return;
        }
        state.caleb.physics.vel.x = state.opts.caleb.normWidthsPerSecond * (hold / 1000);
    },
};

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

        keyDown: [],

        renderWidth: 0,
        renderHeight: 0,
        renderX: 0,
        renderY: 0,

        // I don't know wghat the canvas coloring mechanism is yet
        renderColor: "#FFFFFF",
    };
}

/**
* @param gameState {GameState}
*/
function handleInput(gameState) {
    const input = gameState.input.inputs;
    inputHandlerMap.h(gameState, input.h);
    inputHandlerMap.l(gameState, input.l);
}

/**
* @param caleb {Caleb}
* @param gameState {GameState}
* @param delta {number}
*/
function updatePosition(caleb, gameState, delta) {
    /*
     * I am not going to consider any additional accelerations other than gravity
    if (caleb.acc.magnituteSquared() != 0) {
        caleb.vel.add(caleb.acc);
    }
    */

    const pos = caleb.physics.body.pos;
    const vel = caleb.physics.vel;

    // TODO bound caleb to the ground and just don't apply this movement
    const deltaNorm = delta / 1000;
    const gravVel = gameState.opts.gravity.multiplyCopy(deltaNorm);
    vel.add(gravVel);

    const scaledVel = vel.multiplyCopy(deltaNorm)
    const nextPos = pos.addCopy(scaledVel);

    // TODO Collision on future position?
    pos.set(nextPos.x, nextPos.y)
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
    updatePosition(caleb, gameState, delta);

    // techincally i could move this into the engine side not in each update
    Window.project(gameState.ctx.canvas, caleb);
}

/**
* @param _ {GameState}
*/
export function tickClear(_) { }


