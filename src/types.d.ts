import { AABB } from "./math/aabb";
import { Vector2D } from "./math/vector";

export {};

declare global {

    type GameOptions = {
        caleb: CalebOpts,
        gravity: Vector2D,
        frameTimeMS: number,
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

        input: InputState,
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


    type KeyEvent = { type: "keydown" | "keyup", timeStamp: number, key: string };
    type Handler = (event: KeyEvent) => void
    type HandlerMap = {
        h: Handler,
        l: Handler,
        total: number,
    }
    type InputTiming = {timestamp: number, tickHoldDuration: number}
    type InputMap = {
        h: InputTiming,
        l: InputTiming,
    }
    type InputState = {
        hasInput: boolean,
        inputs: InputMap,
    }
    type HandlerKey = "h" | "l"
    type CalebInputHandlerMapCB = (state: GameState, timing: InputTiming) => void
    type CalebInputHandlerMap = {
        h: CalebInputHandlerMapCB,
        l: CalebInputHandlerMapCB,
    }

    type UpdateableModule = {
        update(gameState: GameState, delta: number): void
        tickClear(gameState: GameState): void
    }

    type RenderableModule = {
        render(gameState: GameState): void
    }

}

