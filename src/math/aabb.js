import { Vector2D } from "./vector.js";

export class AABB {
    /**
   * @constructor
   * @param {Vector2D} pos
   * @param {number} width
   * @param {number} height
   */
    constructor(pos = new Vector2D(0, 0), width = 0, height = 0) {
        this.pos = pos;
        this.width = width;
        this.height = height;
    }

    /**
   * @param {AABB} other
   * @returns {AABB}
   */
    set(other) {
        this.pos = other.pos.clone();
        this.width = other.width;
        this.height = other.height;
        return this;
    }

    /**
   * @param {AABB} other
   * @returns {boolean}
   */
    intersects(other) {
        return (
            this.pos.x < other.pos.x + other.width &&
                this.pos.x + this.width > other.pos.x &&
                this.pos.y < other.pos.y + other.height &&
                this.pos.y + this.height > other.pos.y
        );
    }

    /**
   * @param {Vector2D} point
   * @returns {boolean}
   */
    contains(point) {
        return (
            point.x >= this.pos.x &&
                point.x <= this.pos.x + this.width &&
                point.y >= this.pos.y &&
                point.y <= this.pos.y + this.height
        );
    }

    /**
   * @returns {Vector2D}
   */
    getCenter() {
        return new Vector2D(
            this.pos.x + this.width / 2,
            this.pos.y + this.height / 2
        );
    }

    /**
   * @param other {AABB}
   * @returns {boolean}
   */
    rightOf(other) {
        return this.pos.x >= other.pos.x + other.width;
    }

    /**
   * @param other {AABB}
   * @returns {boolean}
   */
    topOf(other) {
        return this.pos.y + this.height <= other.pos.y;
    }

    /**
   * @param other {AABB}
   * @returns {boolean}
   */
    leftOf(other) {
        return this.pos.x + this.width <= other.pos.x
    }

    /**
   * @param other {AABB}
   * @returns {boolean}
   */
    bottomOf(other) {
        return this.pos.y >= other.pos.y + other.height;
    }



    /**
   * @returns {AABB}
   */
    clone() {
        return new AABB(this.pos, this.width, this.height);
    }

    /**
   * @returns {string}
   */
    toString() {
        return `AABB(pos: ${this.pos}, width: ${this.width}, height: ${this.height})`;
    }
}

