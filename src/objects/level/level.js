import { assert } from "../../assert.js";
import { AABB } from "../../math/aabb.js";
import { Vector2D } from "../../math/vector.js";
import { clonePhysics } from "../../utils.js";
import { GAME_HEIGHT, GAME_WIDTH, projectCoords, projectInto } from "../../window.js";
import { getRow } from "../caleb/utils.js";
import * as Easing from "../../math/ease.js"

export const DO_NOT_USE_FOR_INITIAL_POS_OR_YOU_WILL_BE_FIRED = -69

let _id = 0;

/**
 * @param {CanvasRenderingContext2D} ctx
 * @param {string} text
 * @param {number} x
 * @param {number} y
 * @param {number} calebY
 */
function renderText(ctx, text, x, y, calebY) {
    const [_x, _y] = projectCoords(ctx.canvas, x + 0.25, y + 0.5)

    if (y === calebY) {
        ctx.fillStyle = "purple";
    } else {
        ctx.fillStyle = "white";
    }

    ctx.textAlign = "left"
    ctx.textBaseline = "middle"
    ctx.fillText(text, _x, _y)
}


/** @param {GameState} state
*/
export function render(state) {
    const ctx = state.getCtx();
    ctx.fillStyle = "black";

    const plats = state.level.activeLevel.platforms
    const calebY = getRow(state.caleb);

    for (const p of plats) {
        const render = p.behaviors.render
        if (!render) {
            continue
        }

        ctx.fillRect(render.renderX,
            render.renderY,
            render.renderWidth,
            render.renderHeight
        );

        const letters = p.behaviors.lettered?.letters
        if (letters) {
            const {x, y} = p.physics.current.body.pos
            for (let i = 0; i < letters.length; ++i) {
                renderText(ctx, letters[i], x, y + i, calebY);
            }
        }
    }

}

/**
 * @param {EditorPlatform} platform
 * @returns {BasedPlatform}
 */
export function createPlatformFromEditorPlatform(platform) {
    const aabb = platform.AABB.clone()
    aabb.pos.subtract(new Vector2D(5, 5))
    const plat = createPlatform(aabb)

    plat.behaviors.circuit = platform.behaviors.circuit
    plat.behaviors.next = platform.behaviors.next
    plat.behaviors.instagib = platform.behaviors.instagib
    plat.behaviors.obstacle = platform.behaviors.obstacle
    plat.behaviors.lettered = platform.behaviors.lettered

    if (platform.behaviors.render) {
        plat.behaviors.render = {
            renderX: 0,
            renderY: 0,
            renderWidth: 0,
            renderHeight: 0,
        }
    }

    return plat
}

/**
 * @param {AABB} aabb
 * @returns {BasedPlatform}
*/
export function createPlatform(aabb) {
    const id = _id++
    return {
        behaviors: {},
        id,
        physics: {
            current: {
                vel: new Vector2D(0, 0),
                acc: new Vector2D(0, 0),
                body: aabb,
            },
            next: {
                vel: new Vector2D(0, 0),
                acc: new Vector2D(0, 0),
                body: aabb.clone(),
            },
        }
    };
}

/**
 * @param {BasedPlatform} platform
 * @returns {BasedPlatform}
 */
export function withRender(platform) {
    platform.behaviors.render = {
        renderX: 0,
        renderY: 0,
        renderWidth: 0,
        renderHeight: 0,
    };

    return platform
}

/**
 * @param {BasedPlatform} platform
 * @returns {BasedPlatform}
 */
export function withObstacle(platform) {
    assert(platform.behaviors.instagib === undefined, "cannot have an obsacle that is also instagib")
    platform.behaviors.obstacle = {type: "obstacle"}
    return platform
}

/**
 * @param {BasedPlatform} platform
 * @param {number} toLevel
 * @param {Vector2D} toLevelPosition
 * @returns {BasedPlatform}
 */
export function withNextLevel(platform, toLevel, toLevelPosition) {
    platform.behaviors.next = {
        toLevel,
        toLevelPosition,
        type: "next-level",
    };
    return platform
}

/**
 * @param {BasedPlatform} platform
 * @param {string} letters
 * @returns {BasedPlatform}
*/
export function withLetters(platform, letters) {
    const aabb = platform.physics.current.body;
    assert(aabb.width >= 1, "aabb width has to be at least 1", aabb)
    if (aabb.width === 1) {
        assert(letters.length === aabb.height, "letters.length must be equal to aabb.height", "letters", letters, "aabb", aabb);
    } else {
        assert(letters.length === aabb.height * 2, "if width of aabb is 2 or more, then letters.length === aabb.height * 2", "letters", letters, "aabb", aabb);
    }

    platform.behaviors.lettered = {
        type: "lettered",
        letters: letters,
    };
    return platform
}

/**
 * @param {BasedPlatform} platform
 * @returns {BasedPlatform}
 */
export function withInstaGib(platform) {
    assert(platform.behaviors.obstacle === undefined, "cannot have instagib that is also obstacle")
    platform.behaviors.instagib = { type: "insta-gib", };
    return platform
}

/**
 * @param {BasedPlatform} platform
 * @param {number} time
 * @param {Vector2D} endPos
 * @returns {BasedPlatform}
 */
export function withCircuit(platform, time, endPos) {
    platform.behaviors.circuit = {
        type: "circuit",
        time,
        currentTime: 0,
        currentDir: 1,
        startPos: platform.physics.current.body.pos.clone(),
        endPos,
    }

    return platform
}


/**
 * @param {BasedPlatform[]} platforms
 * @returns {(string | null)[][]}
 */
export function createLetterMap(platforms) {
    const out = [];
    for (let y = 0; y < GAME_HEIGHT; y++) {
        out.push(new Array(GAME_WIDTH).fill(null));
    }

    for (const p of platforms) {
        const letters = p.behaviors.lettered?.letters
        if (!letters) {
            continue
        }

        const {x, y} = p.physics.current.body.pos
        for (let i = 0; i < letters.length && y + i < GAME_HEIGHT; ++i) {
            out[y + i][x] = letters[i]
        }
    }

    return out;
}

/**
 * @param {GameState} state
 * @param {number} r
 * @returns {{key: string, idx: number}[]}
 */
export function getLetters(state, r) {
    // TODO this just has to create such garbage...
    return getLettersByRow(state, r).map((key, idx) => ({key, idx})).filter(({key}) => key !== null)
}

/**
 * @param {GameState} state
 * @param {number} r
 * @returns {string[]}
 */
export function getLettersByRow(state, r) {
    return state.level.activeLevel.letterMap[r] || []
}


/**
 * @param {GameState} state
 * @param {number} _
 */
export function check(state, _) { }

/**
 * @param {GameState} state
 * @param {number} _
 */
export function apply(state, _) {
    for (const p of state.level.activeLevel.platforms) {
        const render = p.behaviors.render
        if (render) {
            projectInto(state.getDim(), render, p.physics.next.body)
        }


        const next = p.physics.next;
        const curr = p.physics.current;

        curr.body.set(next.body)
        curr.vel.set(next.vel)
        curr.acc.set(next.acc)
    }

}

/**
 * @param {GameState} state
 * @param {number} delta
 */
export function update(state, delta) {
    for (const p of state.level.activeLevel.platforms) {
        const circuit = p.behaviors.circuit
        if (!circuit) {
            continue
        }

        // TODO: probably calculate out the velocity instead of updating position
        circuit.currentTime += delta

        let percentDone = Math.min(1, circuit.currentTime / circuit.time)
        percentDone = Easing.x3(percentDone)

        if (circuit.currentDir === -1) {
            percentDone = 1 - percentDone
        }


        // TODO: here is the problem
        const x = circuit.startPos.x + (circuit.startPos.x - circuit.endPos.x) * percentDone
        const y = circuit.startPos.y + (circuit.startPos.y - circuit.endPos.y) * percentDone

        const next = p.physics.next
        const pos = next.body.pos
        const dNorm = (delta / 1000)
        const xDiff = (x - pos.x) / dNorm
        const yDiff = (y - pos.y) / dNorm

        next.vel.x = xDiff
        next.vel.y = yDiff
        pos.x = x
        pos.y = y

        if (circuit.currentDir === 1 && percentDone === 1 ||
            circuit.currentDir === -1 && percentDone === 0) {
            circuit.currentDir *= -1
            circuit.currentTime = 0
        }
    }
}

/**
 * @param {GameState} state
 */
export function tickClear(state) {
}

/**
 * @param {BasedPlatform} platform
 * @returns {BasedPlatform}
 */
export function clonePlatform(platform) {
    const out = {...platform}
    out.physics = clonePhysics(out).physics
    return out
}
