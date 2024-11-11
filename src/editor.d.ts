export {};

declare global {
    type ElementState = {
        id: number
        pos: Position
        el: HTMLDivElement
        selected: boolean
    }

    type Position = {
        row: number
        col: number
    }

    type EditorState = {
        mouse: {
            startingEl: ElementState | null
            state: "invalid" | "down"
        },
        elements: ElementState[][]
        selectedElements: ElementState[]

    }

    type ElementCB = (s: EditorState, es: ElementState, evt: Event) => void
}
