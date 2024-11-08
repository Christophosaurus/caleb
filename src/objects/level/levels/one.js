import { Vector2D } from "../../../math/vector.js"
import { AABB } from "../../../math/aabb.js"
import * as Level from "../level.js"
import { GAME_HEIGHT, GAME_WIDTH } from "../../../window.js";
import * as Caleb from "../../caleb/caleb.js"

/**
 * @returns {LevelSet}
 */
export function createLevel() {
    const aPlatforms = [
        Level.createObstacle(new AABB(new Vector2D(0, 10), 10, 1)),
        Level.createObstacle(new AABB(new Vector2D(0, 0), 1, 10)),
        Level.createLetteredWall(new AABB(new Vector2D(20, 5), 1, 10), "abcdefghij"),
        Level.createNextLevel(1, new AABB(new Vector2D(1, GAME_HEIGHT), 5, 1), new Vector2D(
            Level.DO_NOT_USE_FOR_INITIAL_POS_OR_YOU_WILL_BE_FIRED,
            1,
        )),
    ];

    /** @type {Level} */
    const a = {
        platforms: aPlatforms,
        letterMap: Level.createLetterMap(aPlatforms),
        initialPosition: new Vector2D(10, 1),
    }

    const bPlatforms = [
        Level.createObstacle(new AABB(new Vector2D(5, 10), 10, 1)),
        Level.createObstacle(new AABB(new Vector2D(GAME_WIDTH - 1, 0), 1, 10)),
        Level.createNextLevel(0, new AABB(new Vector2D(1, -1), 5, 1), new Vector2D(
            Level.DO_NOT_USE_FOR_INITIAL_POS_OR_YOU_WILL_BE_FIRED,
            GAME_HEIGHT - 1 - Caleb.CALEB_HEIGHT,
        )),
    ];

    /** @type {Level} */
    const b = {
        platforms: bPlatforms,
        letterMap: Level.createLetterMap(bPlatforms),
        initialPosition: new Vector2D(3, 1),
    }

    return {
        title: "one",
        difficulty: 1,
        levels: [a, b],
        activeLevel: a,
        initialLevel: a,
    }
}

