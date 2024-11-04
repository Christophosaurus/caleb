import { AABB } from "./math/aabb";
import { Vector2D } from "./math/vector";

export {};

declare global {

    type GameOptions = {
        caleb: CalebOpts,
        gravity: Vector2D,
    }

    type CalebOpts = {
        normWidthsPerSecond: number,
    }

    type Caleb = Collidable & CanvasProjectable & {
        opts: CalebOpts,

        keyDown: string[],

        renderWidth: number,
        renderHeight: number,
        renderX: number,
        renderY: number,

        renderColor: string,
    }

    type InputMessage = {
        time: number,
        type: "down" | "up",
        key: string,
    }

    type GameState = {
        opts: GameOptions
        caleb: Caleb
        ctx: CanvasRenderingContext2D

        input: KeyboardEvent[]
        loopStartTime: number,
    }

    type CanvasProjectable = Collidable & {
        renderX: number,
        renderY: number,
        renderWidth: number,
        renderHeight: number,
    }

    type Collidable = {
        physics: {
            vel: Vector2D,
            acc: Vector2D,
            body: AABB,
        }
    }
}

