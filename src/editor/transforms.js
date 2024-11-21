import * as State from "./state.js"
import * as Search from "./search.js"
import * as Consts from "./consts.js"
import { assert, never } from "../assert.js"

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

export class Transforms {
    /** @type {EditorState} */
    state

    /** @type {Filter[]} */
    cbs

    /** @type {boolean} */
    #not

    /** @type {Action} */
    action

    /** @type {string} */
    name

    /** @type {boolean} */
    #debug

    /** @type {boolean} */
    #or

    /** @param {EditorState} state
    /** @param {Action} action */
    constructor(state, action) {
        this.state = state
        this.#debug = false
        this.cbs = []
        this.#not = false
        this.#or = false
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
     * @param {EventCB} f
     * @returns {this}
     */
    chain(f) {
        /** @type {Filter} */
        const filter = {
            name: f.name,
            fn: f,
            or: false,
            and: false,
            invert: this.#not,
        };

        if (this.#or) {
            const last = this.cbs.pop()
            filter.fn = [
                f,
                last,
            ];
            filter.or = true
        }

        this.cbs.push(filter);
        this.#not = false
        this.#or = false
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

    get or() {
        assert(this.cbs.length === 0, "there must be at least one call on the stack")
        this.#or = true
        return this;
    }

    get not() {
        this.#not = true
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
            return State.Mouse.isDown(that.state)
        });
    }

    /**
     * @returns {this}
     */
    inPlatform() {
        let that = this
        return this.chain(function fromPlatform(evt) {
            const platform = Search.platform(that.state, evt)
            return platform !== null
        })
    }

    /**
     * @returns {this}
     */
    inActivePlatform() {
        let state = this.state
        return this.chain(function fromPlatform(evt) {
            if (!State.hasActivePlatform(state)) {
                return false
            }
            const ap = State.activePlatform(state)
            const platform = Search.platform(state, evt)
            return platform !== null && platform === ap
        })
    }


    /**
     * @returns {this}
     */
    fastClick() {
        let that = this
        return this.chain(function mouseDuration() {
            return State.Mouse.duration(that.state) < Consts.behaviors.fastClickTimeMS
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

            const fns = c.fn
            let result = false

            if (typeof fns === "function") {
                result = fns(evt)
            } else {
                result = true
                for (const fn of fns) {
                    let tmp = fn(evt)
                    if (c.or) {
                        result ||= tmp
                    } else if (c.and) {
                        result &&= tmp
                    } else {
                        never("combination function with neither or / and set", c)
                    }
                }
            }

            if (c.invert && result || !c.invert && !result) {
                break
            }
        }

        if (i < this.cbs.length) {
            if (this.#debug) {
                console.log(`${this.name}: failed ${ran.map(fnString).join(".")}`)
            }
            return false
        }

        const es = Search.gridItem(this.state, evt)
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
