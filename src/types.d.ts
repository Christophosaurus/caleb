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


    type KeyEvent = { type: "keydown" | "keyup", timestamp: number, key: string };
    type Handler = (event: KeyEvent) => void
    type InputTiming = {timestamp: number, tickHoldDuration: number}
    type DIGIT = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9
    type HandlerKey = "h" | "l" | "k"
    type InputState = {
        hasInput: boolean,
        inputs: InputMap,
    }
    type CalebInputHandlerMapCB = (state: GameState, timing: InputTiming) => void

    type HandlerMap = { [K in HandlerKey | DIGIT]: Handler; } & { total: number }
    type InputMap = { [K in HandlerKey]: InputTiming };
    type CalebInputHandlerMap  = { [K in HandlerKey | DIGIT]: CalebInputHandlerMapCB };

    type UpdateableModule = {
        update(gameState: GameState, delta: number): void
        tickClear(gameState: GameState): void
    }

    type RenderableModule = {
        render(gameState: GameState): void
    }

}

