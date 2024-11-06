import { Vector2D } from "../../../math/vector.js"
import { AABB } from "../../../math/aabb.js"
import * as Level from "../level.js"

/**
 * @returns {LevelSet}
 */
export function createLevel() {
    const platforms = [
        Level.createPlatform(new AABB(new Vector2D(0, 10), 10, 1)),
        Level.createLetteredWall(new AABB(new Vector2D(20, 5), 1, 10), "abcdefghij"),
    ];
    return {
        platforms,

        title: "one",
        difficulty: 0,
        letterMap: Level.createLetterMap(platforms),
        initialPosition: new Vector2D(10, 1),
    }
}

