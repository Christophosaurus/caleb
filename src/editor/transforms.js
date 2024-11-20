import * as State from "./state.js"

/** @param {any} fn
 * @returns {string}
 */
function fnString(fn) {
    if (fn.invert) {
        return `not(${fn.name})`
    }
    return fn.name
}

function hasParent(el, evt) {
    let curr = /** @type HTMLElement */(evt.target)
    if (curr == null) {
        return false
    }
    do {
        if (el === curr) {
            return true
        }
    } while ((curr = curr.parentElement))
    return false
}

/** @param {string} k
 * @returns {{key: string, ctrl: boolean}}
 */
function mapInput(k) {
    let ctrl = k.startsWith("C-")
    let key = ctrl ? k.split("-")[1] : k
    return { ctrl, key };
}

/**
 * @param {Window | HTMLElement | ((evt: Event) => boolean)} target
 * @returns {EventCB}
 */
function isEl(target) {
    return function(evt) {
        return evt.target === target
    }
}


export class Transforms {
    /** @type {EditorState} */
    state

    /** @type {EventCB[]} */
    cbs

    /** @type {boolean} */
    invert

    /** @type {Action} */
    action

    /** @type {string} */
    name

    /** @type {boolean} */
    #debug

    /** @param {EditorState} state
    /** @param {Action} action */
    constructor(state, action) {
        this.state = state
        this.#debug = false
        this.cbs = []
        this.invert = false
        this.action = action
        this.name = action.name;
    }

    /**
     * @returns {this}
     */
    get debug() {
        this.#debug = true
        return this
    }

    /**
     * @param {Event} event
     * @returns {ElementState | null}
     */
    #getElementState(event) {
        if (!event.type.includes("mouse")) {
            return
        }
        const evt = /** @type {MouseEvent} */(event)

        const x = evt.clientX
        const y = evt.clientY

        // TODO technically i can binary search over this 2D array, once with Y and once with X
        // Since its 2D and square, i can do both the X and the Y at the same time
        /** @type {ElementState | null} */
        let found = null
        outer: for (const row of this.state.elements) {
            const first = row[0]
            if (first.el.offsetTop + first.el.offsetHeight < y) {
                continue
            }
            for (const el of row) {
                if (el.el.offsetLeft + el.el.offsetWidth < x) {
                    continue
                }
                found = el
                break outer
            }
        }

        return found
    }

    /**
     * @param {EventCB} f
     * @returns {this}
     */
    chain(f) {
        // TODO deem as geniouous? (or cursed?)
        if (this.invert) {
            // @ts-ignore
            f.invert = true
        }

        this.cbs.push(f);
        this.invert = false
        return this;
    }

    /**
     * @param {string} t
     * @returns {this}
     */
    type(t) {
        return this.chain(function type(evt) {
            return evt.type === t
        })
    }

    get not() {
        this.invert = true
        return this;
    }

    /**
     * @param {string | string[]} k
     * @returns {this}
     */
    key(k) {
        const processedKeys = Array.isArray(k) ?
            k.map(mapInput) : [mapInput(k)];

        return this.chain(function key(event) {
            const evt = /** @type {KeyboardEvent} */(event)
            for (const p of processedKeys) {
                if (evt.key === p.key && evt.ctrlKey === p.ctrl) {
                    return true
                }
            }
        })
    }

    /**
     * @returns {this}
     */
    stateMouseDown() {
        let that = this
        return this.chain(function stateMouseDown() {
            return that.state.mouse.state === "down"
        });
    }

    /**
     * @returns {this}
     */
    fromPlatform() {
        let that = this
        return this.chain(function fromPlatform(evt) {
            const platforms = State.platforms(that.state)
            for (const p of platforms) {
                if (p.el === evt.target) {
                    return true
                }
            }
        })
    }

    /**
     * @returns {this}
     */
    stateHasSelected() {
        let that = this
        return this.chain(function stateHasSelected() {
            return State.hasSelected(that.state)
        })
    }

    /**
     * @returns {this}
     */
    activePlatform() {
        let that = this
        return this.chain(function activePlatform() {
            return State.hasActivePlatform(that.state)
        })
    }

    /**
     * @returns {this}
     */
    controls() {
        let that = this
        return this.chain(function controls(evt) {
            return hasParent(that.state.platformControls, evt)
        })
    }

    /**
     * @returns {this}
     */
    isGridItem() {
        return this.chain(function isGridItem(evt) {
            let curr = /** @type HTMLElement */(evt.target)
            return curr?.classList?.contains("grid-item")
        })
    }

    /**
     * @returns {this}
     */
    fromEditor() {
        let that = this
        return this.chain(function fromEditor(evt) {
            return hasParent(that.state.editor, evt)
        })
    }

    /**
    * @param {Event} evt
    */
    run(evt) {
        const ran = [];
        let i = 0
        for (; i < this.cbs.length; ++i) {
            const c = this.cbs[i]
            if (this.#debug) {
                ran.push(c)
            }

            const res = c(evt)
            // @ts-ignore invert.... this is dumb
            if (c.invert && res || !c.invert && !res) {
                break
            }
        }

        if (i < this.cbs.length) {
            if (this.#debug) {
                console.log(`${this.name}: failed ${ran.map(fnString).join(".")}`)
            }
            return false
        }

        const es = this.#getElementState(evt)
        if (this.#debug) {
            console.log(`${this.name}: succeeded ${ran.map(fnString).join(".")}`, es)
        }

        this.action(this.state, evt, es)
        return true
    }

    toString() {
        return `${this.name}: ${this.cbs.map(fnString)}`
    }
}

/**
 * @param {EditorState} state
 * @returns {(a: Action) => Transforms}
 */
export function createTransform(state) {
    return function(action) {
        return new Transforms(state, action);
    }
}
