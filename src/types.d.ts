import { AABB } from "./math/aabb";
import { Vector2D } from "./math/vector";

export {};

declare global {

    type GameOptions = {
        debug: boolean,
        caleb: CalebOpts,
        gravity: Vector2D,
        frameTimeMS: number,
        tickTimeMS: number,

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
        hodlTime: number,
        normWidthsPerSecond: number,
        jump: CalebJumpOpts,
        dash: CalebDashOpts,
    }

    type CalebJump = {
        jumping: boolean,
        jumpDistance: number,
        jumpStart: Vector2D | null,
        jumpDir: 1 | -1,
        noJumpTime: number,
    }

    type CalebHodl = {
        hodlTime: number,
    }


    type fFtTKey = "f" | "F" | "t" | "T"
    type fFtT = {
        type: fFtTKey
        startTick: number,
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
        platform: {
            tick: number,
            platform: BasedPlatform | null,
        },
        deadAt: number,

        hodl: CalebHodl
        jump: CalebJump
        dash: CalebDash
        fFtT: fFtT

        // i don't want "proper" jumping mechanics.  i want linear jump
        // slow top (for f/F/t/T or w)
    }

    type InputMessage = {
        time: number,
        type: "down" | "up",
        key: string,
    }

    type PlatformBehaviors = "obstacle" | "next-level" | "insta-gib" | "lettered" | "circuit"
    type Lettered = {
        type: "lettered"
        letters: string
    }
    type Circuit = {
        type: "circuit"
        startPos: Vector2D
        endPos: Vector2D
        time: number
        currentTime: number
        currentDir: -1 | 1
    }

    type NextLevelBehavior = {
        type: "next-level",
        toLevel: number,
        toLevelPosition: Vector2D
    }
    type ObstacleBehavior = { type: "obstacle" }
    type InstaGib = { type: "insta-gib" }
    type BasedPlatform = Collidable & {
        id: number,
        behaviors: {
            lettered?: Lettered
            next?: NextLevelBehavior
            obstacle?: ObstacleBehavior
            instaGib?: InstaGib
            circuit?: Circuit
            render?: CanvasProjectable
        }
    }

    type LevelSet = {
        title: string,
        difficulty: number,
        levels: Level[]
        activeLevel: Level
        initialLevel: Level
    }

    type Level = {
        platforms: BasedPlatform[]
        initialPosition: Vector2D
        letterMap: (string | null)[][]
    }

    type GameState = {
        opts: GameOptions
        debug: {
            previous: {
                caleb: Collidable,
                platforms: BasedPlatform[],
            }
        },

        now: () => number,
        caleb: Caleb
        ctx: CanvasRenderingContext2D

        level: LevelSet,
        levelChanged: boolean

        tick: number,

        rn: {
            zero: number
        }

        gameOver: boolean,
        input: InputState,
        loopStartTime: number,
        loopDelta: number,
    }

    type CanvasProjectable = {
        renderX: number,
        renderY: number,
        renderWidth: number,
        renderHeight: number,
    }

    type PhysicsBody = {
        vel2?: Vector2D,
        vel: Vector2D,
        acc: Vector2D,
        body: AABB,
    }

    type Collidable = {
        physics: {
            current: PhysicsBody
            next: PhysicsBody
        }
    }

    type InputTiming = {
        timestamp: number,
        tickHoldDuration: number,
        initial: boolean,
        done: boolean
    }

    type Input = {type: "down-up" | "down" | "hold" | "up", key: string, tick: number}
    type InputHandler = (state: GameState, input: Input) => boolean
    type InputState = {
        hasInput: boolean
        inputs: Input[]
        tick: number
        numericModifier: number
        anykey: boolean
    }

    type UpdateableModule = {
        update(gameState: GameState, delta: number): void
        tickClear(gameState: GameState): void
    }

    type UpdateAndApplyModule = {
        update(gameState: GameState, delta: number): void
        check(gameState: GameState, delta: number): void
        apply(gameState: GameState, delta: number): void
        tickClear(gameState: GameState): void
    }


    type RenderableModule = {
        render(gameState: GameState): void
    }

    type BehaviorNode = {
        enter(state: GameState): boolean
        run(state: GameState): void
        exit(state: GameState): void
    }

    type BusType = "hide-platform" | "show-platform" | "move-platform" | "release-platform"
    type BusArgMap = {
        "move-platform": EditorPlatform;
        "hide-platform": EditorPlatform;
        "show-platform": EditorPlatform;
        "release-platform": EditorPlatform;
    };

    type BusArg = EditorPlatform
    type BusCB<T extends BusArg> = (args: T) => void;
    type BusListeners = {
        [K in keyof BusArgMap]?: BusCB<BusArgMap[K]>[];
    };
}

