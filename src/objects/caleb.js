import { assert, never } from "../assert.js";
import { AABB } from "../math/aabb.js";
import { Vector2D } from "../math/vector.js";
import * as Window from "../window.js";

/** @param opts {CalebOpts}
/** @returns {Caleb} */
export function createCaleb(opts) {
    return {
        opts: opts,


        physics: {
            acc: new Vector2D(0, 0),
            vel: new Vector2D(0, 0),
            body: new AABB(new Vector2D(0, 0), 1, 1),
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
 * THIS IS HORRIBLE AND I WANT TO REFACTOR IT, BUT IT WILL WORK
 * THIS IS HORRIBLE AND I WANT TO REFACTOR IT, BUT IT WILL WORK
 * THIS IS HORRIBLE AND I WANT TO REFACTOR IT, BUT IT WILL WORK
 * THIS IS HORRIBLE AND I WANT TO REFACTOR IT, BUT IT WILL WORK
 * THIS IS HORRIBLE AND I WANT TO REFACTOR IT, BUT IT WILL WORK
 * THIS IS HORRIBLE AND I WANT TO REFACTOR IT, BUT IT WILL WORK
 * I HATE INPUT
 * I HATE INPUT
 * I HATE INPUT
 * I HATE INPUT
 * I HATE INPUT
 * I HATE INPUT
* @param caleb {Caleb}
* @param gameState {GameState}
* @param delta {number}
*/
function handleInput(caleb, gameState, delta) {
    const pageLoadTime = performance.timeOrigin;
    const keyDownMap = { };
    const pos = caleb.physics.body.pos;

    for (const k of gameState.input) {
        const remaining = gameState.loopStartTime - (pageLoadTime + k.timeStamp)

        // this feels like really shitty code
        if (k.type === "keydown" && !caleb.keyDown.includes(k.key) && !keyDownMap[k.key]) {
            if (k.key === "h") {
                pos.x -= (remaining / 1000) * caleb.opts.normWidthsPerSecond;
            } else if (k.key === "l") {
                pos.x += (remaining / 1000) * caleb.opts.normWidthsPerSecond;
            }
            keyDownMap[k.key] = true;

        } else if (k.type === "keyup") {
            const idx = caleb.keyDown.indexOf(k.key)
            keyDownMap[k.key] = false;

            if (idx === -1) {
                continue
            }

            const remainingDown = delta - remaining;
            if (k.key === "h") {
                pos.x -= (remainingDown / 1000) * caleb.opts.normWidthsPerSecond;
            } else if (k.key === "l") {
                pos.x += (remainingDown / 1000) * caleb.opts.normWidthsPerSecond;
            }

            caleb.keyDown.splice(idx, 1);

            // even more shitty code else if
        }
    }

    for (const k of caleb.keyDown) {
        if (k === "h") {
            pos.x -= (delta / 1000) * caleb.opts.normWidthsPerSecond;
        } else if (k === "l") {
            pos.x += (delta / 1000) * caleb.opts.normWidthsPerSecond;
        }
    }

    for (const [k, v] of Object.entries(keyDownMap)) {
        if (v && !caleb.keyDown.includes(k)) {
            caleb.keyDown.push(k)
        }
    }

    gameState.input.length = 0;
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
    vel.add(gameState.opts.gravity.multiplyCopy(deltaNorm));

    const scaledVel = vel.multiplyCopy(delta / 1000)
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
    updatePosition(caleb, gameState, delta);

    handleInput(caleb, gameState, delta);

    // techincally i could move this into the engine side not in each update
    Window.project(gameState.ctx.canvas, caleb);
}

/**
* @param gameState {GameState}
*/
export function tickClear(gameState) { }


