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

    type PlatformBehaviors = "obstacle" | "next-level" | "instagib" | "lettered" | "circuit" | "render"
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
    type InstaGib = { type: "instagib" }
    type Render = { type: "render" }
    type BasedPlatform = Collidable & {
        id: number,
        behaviors: {
            lettered?: Lettered
            next?: NextLevelBehavior
            obstacle?: ObstacleBehavior
            instagib?: InstaGib
            circuit?: Circuit
            render?: CanvasProjectable
        }
    }

    type LevelSet = {
        title: string,
        difficulty: number,
        levels: Level[]
        activeLevel?: Level
        initialLevel: number
    }

    type Level = {
        platforms: BasedPlatform[]
        initialPosition: Vector2D
        letterMap: (string | null)[][]
    }

    type Dimension = {
        width: number
        height: number
    }

    type GameState = {
        done: boolean

        updateables: UpdateableModule[]
        renderables: RenderableModule[]
        applyables: UpdateAndApplyModule[]

        opts: GameOptions
        debug: {
            previous: {
                caleb: Collidable,
                platforms: BasedPlatform[],
            }
        },

        now: () => number,
        caleb: Caleb
        getCtx(): CanvasRenderingContext2D | null
        getDim(): Dimension
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
        listener: (e: KeyboardEvent) => void
        anykey: ((state: GameState) => void) | null
    }

    type GameLoop = (cb: () => void) => void;
    type GameTick = (state: GameState) => void

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

    type RenderEvent = Event & {type: "render"}
    type ResizeEvent = Event & {type: "resize"}
    type SaveEvent = {type: "editor-save", platforms: EditorPlatform[]}
    type ChangeEvent = {type: "editor-change"}

    type BusType = "hide-platform" | "show-platform" | "move-platform" | "release-platform" | "render" | "editor-save" | "editor-change" | "delete-platform" | "editor-started"
    type BusArgMap = {
        "editor-started": EditorState;
        "resize": ResizeEvent;
        "move-platform": EditorPlatform;
        "hide-platform": EditorPlatform;
        "show-platform": EditorPlatform;
        "release-platform": EditorPlatform;
        "delete-platform": EditorPlatform;
        "render": RenderEvent
        "editor-save": SaveEvent
        "editor-change": ChangeEvent
    };

    type BusArg = EditorPlatform
    type BusCB<K extends BusType> = (args: BusArgMap[K]) => void;
    type BusListeners = {
        [K in BusType]?: BusCB<K>[];
    };

    type SimRand = {
        randInt: () =>  number,
        randRange: (max: number, min?: number) =>  number,
        randRangeR: (r: SimRange) =>  number,
        rand: () => number
    }

    type SimState = {
        opts: SimOptions
        rand: SimRand
        state: GameState
        action: {
            actions: SimKeyAction[]
            idx: number
            start: number
        } | null
    }

    type SimKeyAction = {
        key: string
        held: number
        wait: number
        downPerformed: boolean
        upPerformed: boolean
    }

    type SimRange = {start: number, stop: number}
    type SimOptions = {
        holdRange: SimRange
        waitRange: SimRange
        maxJump: number
    }

    type KeyEvent = {
        type: "keydown" | "keyup"
        key: string
        repeat: boolean
    }
}

