import { AABB } from "./math/aabb.js";
import { Vector2D } from "./math/vector.js";

export {};

declare global {
    type ElementState = {
        id: number
        pos: Vector2D
        el: HTMLDivElement
        selected: boolean
    }

    type EditorState = {
        debug: boolean,
        tick: number
        editor: HTMLElement
        overlay: HTMLElement
        platformControls: HTMLElement
        worldOutline: HTMLElement
        platforms: EditorPlatform[]
        activePlatform: null | EditorPlatform
        mouse: {
            startingEl: ElementState | null
            state: "invalid" | "down"
        },
        elements: ElementState[][]
        selectedElements: ElementState[]

    }

    type EventCB = (event: Event) => void
    type StateCB = (s: EditorState, evt: Event) => void
    type PlatformCB = (s: EditorState, p: EditorPlatform, evt: Event) => void
    type ElementCB = (s: EditorState, es: ElementState, evt: Event) => void

    type EditorPlatform = {
        state: EditorState,
        AABB: AABB,
        selected: {
            offset: Vector2D,
            starting: Vector2D,
            down: boolean,
            moving: boolean,
            tick: number,
        } | null
        behaviors: {
            lettered?: Lettered
            next?: NextLevelBehavior
            obstacle?: ObstacleBehavior
            instagib?: InstaGib
            circuit?: Circuit
            render?: Render
        }
        el: HTMLElement | null
    }
}
