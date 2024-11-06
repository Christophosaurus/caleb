import { AABB } from "./math/aabb";
import { Vector2D } from "./math/vector";

export {};

declare global {

    type GameOptions = {
        caleb: CalebOpts,
        gravity: Vector2D,
        frameTimeMS: number,

        tolerance: {
            topBy: number,
            bottomBy: number,
        }

    }

    type CalebJumpEaseCB = (percent: number) => number
    type CalebJumpOpts = {
        jumpEaseMS: number,
        jumpEaseFn: CalebJumpEaseCB,
        jumpEaseRange: number,
        jumpNormHeight: number,
        noJumpBase: number,
        noJumpMultiplier: number,
    }

    type CalebDashOpts = {
        dashNormWidth: number,
        distance: number,
        dashEaseRange: number,
    }

    type CalebOpts = {
        normWidthsPerSecond: number,
        jump: CalebJumpOpts,
        dash: CalebDashOpts,
    }

    // TODO maybe i need to refactor this to make sense of the world....
    // feels like i could have some sort of "action" and just have that
    // describe what i want
    //
    // F and T should be able to help me reduce this... if needed
    type CalebJump = {
        jumping: boolean,
        jumpDistance: number,
        jumpStart: Vector2D | null,
        jumpDir: 1 | -1,
        noJumpTime: number,
    }

    type CalebDash = {
        dashing: boolean,
        dashDistance: number,
        dashStart: Vector2D | null,
        dashDir: 1 | -1,
        noDashTime: number,
    }

    type Caleb = Collidable & CanvasProjectable & {
        opts: CalebOpts,
        renderColor: string,
        dead: boolean,
        deadAt: number,

        jump: CalebJump,
        dash: CalebDash,

        // i don't want "proper" jumping mechanics.  i want linear jump
        // slow top (for f/F/t/T or w)
    }

    type InputMessage = {
        time: number,
        type: "down" | "up",
        key: string,
    }

    type Platform = Collidable & CanvasProjectable & { id: number }
    type LetteredWall = Platform & { letters: string[] }

    type Level = {
        platforms: Platform[]
        initialPosition: Vector2D
    }

    type GameState = {
        opts: GameOptions
        caleb: Caleb
        ctx: CanvasRenderingContext2D
        level: Level

        rn: {
            zero: number
        }

        gameOver: boolean,
        input: InputState,
        loopStartTime: number,
        loopDelta: number,
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
    type InputTiming = {timestamp: number, tickHoldDuration: number, initial: boolean}
    type DIGIT = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9
    type HandlerKey = "h" | "l" | "k" | "j" | "w" | "b"
    type InputState = {
        hasInput: boolean,
        inputs: InputMap,
    }
    type CalebInputHandlerMapCB = (state: GameState, timing: InputTiming) => boolean

    type HandlerMap = { [K in HandlerKey | DIGIT]: Handler; } & { total: number }
    type InputMap = { [K in HandlerKey | DIGIT]: InputTiming };
    type CalebInputHandlerMap  = { [K in HandlerKey | DIGIT]: CalebInputHandlerMapCB };

    type UpdateableModule = {
        update(gameState: GameState, delta: number): void
        tickClear(gameState: GameState): void
    }

    type RenderableModule = {
        render(gameState: GameState): void
    }

}

