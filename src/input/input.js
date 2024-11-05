/** @type HandlerKey[] */
export const keys = ["h", "l", "k"];

/**
 * Note: there cannot be more than 1 of each type of event per frame
 * this should not pose a problem to anyone following the rules as frames are
 * 16 or 33ms.  that would be a keydown, up, then another down over that period of time
 * @param key {HandlerKey}
 * @param out {InputMap}
 * @return Handler
 */
export function createHandler(key, out) {
    /** @param event {KeyEvent} */
    return function(event) {
        if (event.type === "keydown") {
            const item = out[key];
            if (item.timestamp > 0) {
                return
            }
            item.timestamp = event.timestamp;
        } else if (event.type === "keyup") {
            const item = out[key];
            if (item.timestamp === 0) {
                return
            }

            item.tickHoldDuration = event.timestamp - item.timestamp;
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
            item.timestamp = gameState.loopStartTime;
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
    gameState.input.hasInput = false;
}

/** @return InputState */
export function createInputState() {
    const inputs = /** @type InputMap */(
        keys.reduce((acc, key) => {
        acc[key] = {timestamp: 0, tickHoldDuration: 0}
        return acc;
    }, {}));

    /** @type InputState */
    const inputMap = {
        hasInput: false,
        inputs,
    };

    return inputMap;
}

/** @param event {KeyboardEvent}
 * @return {KeyEvent | null} */
function keyboardEventToKeyEvent(event) {
    if (event.type !== "keydown" && event.type !== "keyup") {
        return null;
    }

    return {
        timestamp: event.timeStamp + performance.timeOrigin,
        key: event.key,
        type: event.type,
    };
}

/** @param state {InputState}
/** @param el {{addEventListener: (evt: string, cb: (...args: any) => void) => void}} */
export function listenForKeyboard(state, el) {

    const handler = /** @type HandlerMap */(
        keys.reduce((acc, key) => {
        acc[key] = createHandler(key, state.inputs)
        return acc;
    }, {}));
    handler.total = 0;

    /** @param event {KeyboardEvent} */
    function listen(event) {
        const evt = keyboardEventToKeyEvent(event);
        if (event.key in handler) {
            handler[event.key](evt);
        }
    }

    el.addEventListener("keydown", listen)
    el.addEventListener("keyup", listen)
}

