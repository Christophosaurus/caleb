
/** @type HandlerKey[] */
export const keys = ["h", "l"];

/**
 * @param key {HandlerKey}
 * @param out {InputMap}
 * @return HandlerMap
 */
export function createHandler(key, out) {
    /** @param event {KeyEvent} */
    return function(event) {
        if (event.type === "keydown") {
            const item = out[key];
            if (item.timestamp > 0) {
                return
            }

            item.timestamp = event.timeStamp * performance.timeOrigin;
        } else if (event.type === "keyup") {
            const item = out[key];
            if (item.timestamp === 0) {
                return
            }

            const timestamp = event.timeStamp * performance.timeOrigin;
            item.tickHoldDuration = timestamp - item.timestamp;
            item.timestamp = 0;
        }
    }
}

/** @param gameState {GameState}
/** @param _ {number} */
export function update(gameState, _) {
    const inputs = gameState.input.inputs;
    for (let i = 0; i < keys.length; ++i) {
        const item = inputs[keys[i]];
        if (item.timestamp > 0) {
            item.tickHoldDuration = gameState.loopStartTime - item.timestamp;
        }
    }

    if (inputs.h.tickHoldDuration > 0 && inputs.l.tickHoldDuration > 0) {
        const h = inputs.h.tickHoldDuration;
        const l = inputs.l.tickHoldDuration;
        if (h > l) {
            inputs.h.tickHoldDuration = h - l;
            inputs.l.tickHoldDuration = 0;
        } else {
            inputs.l.tickHoldDuration = l - h;
            inputs.h.tickHoldDuration = 0;
        }
    }

    let hasInput = false;
    for (let i = 0; !hasInput && i < keys.length; ++i) {
        hasInput = inputs[keys[i]].tickHoldDuration > 0
    }

    gameState.input.hasInput = hasInput;
}


/** @param gameState {GameState} */
export function tickClear(gameState) {
    for (let i = 0; i < keys.length; ++i) {
        gameState.input.inputs[keys[i]].tickHoldDuration = 0;
    }
}

/** @return InputState */
export function createInputState() {
    /** @type InputState */
    const inputMap = {
        inputs: {
            h: {timestamp: 0, tickHoldDuration: 0},
            l: {timestamp: 0, tickHoldDuration: 0},
        },
        hasInput: false,
    };

    return inputMap;
}


/** @param state {InputState}
/** @param el {HTMLElement} */
export function listenForKeyboard(state, el) {

    const handler = /** @type HandlerMap */ ({
        h: createHandler("h", state.inputs),
        l: createHandler("l", state.inputs),
    });

    el.addEventListener("keydown", function(event) {
        if (event.key in handler) {
            handler[event.key](event);
        }
    })

    el.addEventListener("keyup", function(event) {
        if (event.key in handler) {
            handler[event.key](event);
        }
    })
}

