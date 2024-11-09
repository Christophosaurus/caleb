/**
 * @param {InputState} state
 * @param {string} key
 * @returns {Input}
 */
export function get(state, key) {
    let idx = -1
    for (let i = 0; idx === -1 && i < state.inputs.length; ++i) {
        const input = state.inputs[i]
        if (input.key === key) {
            return input
        }
    }
    return null
}

/** @param gameState {GameState}
/** @param _ {number} */
export function apply(gameState, _) {
}

/** @param gameState {GameState}
/** @param _ {number} */
export function update(gameState, _) {
    const input = gameState.input
    input.tick = gameState.tick
    input.hasInput = input.inputs.length > 0
}


/** @param gameState {GameState} */
export function tickClear(gameState) {
    const inputs = gameState.input.inputs
    for (let i = inputs.length - 1; i >= 0; --i) {
        const item = inputs[i]
        if (item.type === "down-up" || item.type === "up") {
            inputs.splice(i, 1)
        } else if (item.type === "down") {
            item.type = "hold"
        }
    }
    gameState.input.hasInput = false;
}

/**
 * @returns {InputState}
 */
export function createInputState() {
    return {
        inputs: [],
        hasInput: true,
        tick: 0,
        numericModifier: 0,
        anykey: false
    }
}

/**
 * @param {InputState} state
 * @param {KeyboardEvent} event
 */
export function processKey(state, event) {
    if (event.key.length > 1 || event.repeat) {
        return
    }

    let input = get(state, event.key)
    if (input !== null && event.type === "keyup") {
        if (input.tick === state.tick) {
            input.type = "down-up"
        } else {
            input.type = "up"
        }
    } else if (input === null && event.type === "keyup") {
        input = get(state, event.key.toLowerCase())
        if (input && input.tick === state.tick) {
            input.type = "down-up"
        } else if (input) {
            input.type = "up"
        }
    } else if (input && event.type === "keydown") {
        input.type = "down"
    } else if (input === null && event.type === "keydown") {
        state.inputs.push({
            tick: state.tick,
            type: "down",
            key: event.key,
        });
    }
}

/**
 * @param {HTMLElement} el
 * @param {InputState} state
 */
export function listenTo(el, state) {
    /** @param event {KeyboardEvent} */
    function listen(event) {
        processKey(state, event);
    }

    el.addEventListener("keydown", listen)
    el.addEventListener("keyup", listen)
}
