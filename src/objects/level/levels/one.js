import { Vector2D } from "../../../math/vector.js"
import { AABB } from "../../../math/aabb.js"
import * as Level from "../level.js"
import { GAME_HEIGHT, GAME_WIDTH } from "../../../window.js";
import * as CalebUtils from "../../caleb/utils.js"

/**
 * @returns {LevelSet}
 */
export function createLevel() {
    const aPlatforms = [
        Level.withRender(Level.withObstacle(Level.createPlatform(new AABB(new Vector2D(0, 10), 10, 1)))),
        Level.withRender(Level.withObstacle(Level.createPlatform(new AABB(new Vector2D(0, 0), 1, 10)))),
        Level.withRender(Level.withCircuit(
            Level.withInstaGib(Level.createPlatform(new AABB(new Vector2D(20, 5), 1, 3))),
            5000,
            new Vector2D(27, 5),
        )),
        Level.withRender(Level.withCircuit(
            Level.withObstacle(Level.createPlatform(new AABB(new Vector2D(15, 3), 5, 1))),
            5000,
            new Vector2D(27, 5),
        )),
        Level.withRender(Level.withInstaGib(Level.withLetters(Level.createPlatform(new AABB(new Vector2D(20, 5), 1, 10)), "abcdefghij"))),
        Level.withNextLevel(Level.createPlatform(new AABB(new Vector2D(1, GAME_HEIGHT), 5, 1)), 1, new Vector2D(
            Level.DO_NOT_USE_FOR_INITIAL_POS_OR_YOU_WILL_BE_FIRED,
            1,
        )),
    ];

    /** @type {Level} */
    const a = {
        platforms: aPlatforms,
        letterMap: Level.createLetterMap(aPlatforms),
        initialPosition: new Vector2D(7, 1),
    }

    return {
        title: "one",
        difficulty: 1,
        levels: [a],
        activeLevel: a,
        initialLevel: a,
    }
}

