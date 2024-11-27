import { AABB } from "../../../math/aabb.js"
import { createPhysics } from "../../../math/utils.js"
import { Vector2D } from "../../../math/vector.js"

// TODO stop it immediately, bad
import * as Const from "../../../editor/consts.js"


const margin = new Vector2D(Const.editor.margin, Const.editor.margin)
/**
 * @param {EditorLevelSet} levelSet
 * @returns {LevelSet}
*/
export function convertLevelSet(levelSet) {
    /** @type {LevelSet} */
    const out = {
        title: levelSet.title,
        difficulty: levelSet.difficulty,
        initialLevel: levelSet.initialLevel,
        levels: []
    }

    for (const eLevel of levelSet.levels) {
        /** @type {Level} */
        const level = {
            platforms: [],
            initialPosition: Vector2D.fromObject(eLevel.initialPosition),
            letterMap: []
        }

        for (const p of eLevel.platforms) {
            const aabb = AABB.fromObject(p.AABB)
            aabb.pos.subtract(margin)

            level.platforms.push({
                physics: {
                    next: createPhysics(aabb),
                    current: createPhysics(aabb),
                },
                id: p.id,
                behaviors: {
                    next: p.behaviors.next,
                    circuit: p.behaviors.circuit,
                    instagib: p.behaviors.instagib,
                    obstacle: p.behaviors.obstacle,
                    render: p.behaviors.render ? {
                        type: "render",
                        renderX: 0,
                        renderY: 0,
                        renderWidth: 0,
                        renderHeight: 0,
                    } : undefined
                },
            })
        }

        eLevel.initialPosition = Vector2D.fromObject(eLevel.initialPosition)
        out.levels.push(level)
    }

    return out
}
