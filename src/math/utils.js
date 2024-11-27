import { AABB } from "./aabb.js";
import { ZERO } from "./vector.js";

/**
 * @param {AABB} from
 * @returns {PhysicsBody}
*/
export function createPhysics(from) {
    return {
        acc: ZERO,
        vel: ZERO,
        vel2: undefined,
        body: from.clone(),
    }
}
