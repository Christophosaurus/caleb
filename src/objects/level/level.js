import { assert } from "../../assert.js";
import { AABB } from "../../math/aabb.js";
import { Vector2D } from "../../math/vector.js";
import { GAME_HEIGHT, GAME_WIDTH, projectCoords } from "../../window.js";
import { getRow } from "../caleb/utils.js";

export const DO_NOT_USE_FOR_INITIAL_POS_OR_YOU_WILL_BE_FIRED = -69

let _id = 0;

/**
 * @param {CanvasRenderingContext2D} ctx
 * @param {string} text
 * @param {number} x
 * @param {number} y
 * @param {number} calebY
 */
export function renderText(ctx, text, x, y, calebY) {
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


/** @param state {GameState}
*/
export function render(state) {
    const plats = state.level.activeLevel.platforms
    const ctx = state.ctx;
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
            const {x, y} = p.physics.body.pos
            for (let i = 0; i < letters.length; ++i) {
                renderText(ctx, letters[i], x, y + i, calebY);
            }
        }
    }

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
            vel: new Vector2D(0, 0),
            acc: new Vector2D(0, 0),
            body: aabb,
        },
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
    assert(platform.behaviors.instaGib === undefined, "cannot have an obsacle that is also instagib")
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
    const aabb = platform.physics.body;
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
    platform.behaviors.instaGib = { type: "insta-gib", };
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

        const {x, y} = p.physics.body.pos
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
    return state.level.activeLevel.letterMap[r].map((key, idx) => ({key, idx})).filter(({key}) => key !== null)
}
