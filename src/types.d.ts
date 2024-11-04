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

    type Caleb = {
        opts: CalebOpts,

        pos: Vector2D,
        vel: Vector2D,
        acc: Vector2D,

        width: number,
        height: number,

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

    type CanvasProjectable = {
        pos: Vector2D,
        width: number,
        height: number,

        renderX: number,
        renderY: number,
        renderWidth: number,
        renderHeight: number,
    }
}

