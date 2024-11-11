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
        editor: HTMLElement
        panel: HTMLElement
        platforms: EditorPlatform[]
        mouse: {
            startingEl: ElementState | null
            state: "invalid" | "down"
        },
        elements: ElementState[][]
        selectedElements: ElementState[]

    }

    type PanelItems = {
        createPlatform: any,
    }

    type EventCB = (event: Event) => void
    type StateCB = (s: EditorState, evt: Event) => void
    type PlatformCB = (s: EditorState, p: EditorPlatform, evt: Event) => void
    type ElementCB = (s: EditorState, es: ElementState, evt: Event) => void

    type EditorPlatform = {
        AABB: AABB,
        selected: {
            offset: Vector2D,
            starting: Vector2D,
        } | null
        behaviors: {
            lettered?: Lettered
            next?: NextLevelBehavior
            obstacle?: ObstacleBehavior
            instaGib?: InstaGib
            circuit?: Circuit
            render?: CanvasProjectable
        }
        el: HTMLElement | null
    }
}
