
/** @type {BusListeners} */
let listeners = {};

/**
 * @template {keyof BusArgMap} T
 * @param {T} type
 * @param {BusArgMap[T]} args
 */
export function emit(type, args) {
    for (const cb of listeners[type] || []) {
        cb(args)
    }
}

/**
 * @template {keyof BusArgMap} K
 * @param {K} type
 * @param {(args: BusArgMap[K]) => void} cb
 */
export function listen(type, cb) {
    let cbs = listeners[type]
    if (!cbs) {
        cbs = listeners[type] = []
    }
    cbs.push(cb)
}

/**
 * @template {keyof BusArgMap} K
 * @param {K} type
 * @param {(args: BusArgMap[K]) => void} cb
 */
export function remove(type, cb) {
    const cbs = listeners[type]
    if (!cbs) {
        return
    }

    const idx = cbs.indexOf(cb)
    if (idx >= 0) {
        cbs.splice(idx, 1)
    }
}

export function clear() {
    listeners = {}
}

class Render extends Event {
    constructor() {
        super("render")
    }
}

export function render() {
    const render = /** @type {RenderEvent} */(new Render())
    emit("render", render)
}

export function editorChange() {
    emit("editor-change", {type: "editor-change"})
}

/**
 * @param {EditorState} state
*/
export function editorSave(state) {
    emit("editor-save", {type: "editor-save", platforms: state.platforms})
}
