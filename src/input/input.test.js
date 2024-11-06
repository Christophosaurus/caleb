// @ts-ignore
import test from "node:test";

// @ts-ignore
import * as assert from "node:assert";
import * as Input from "./input.js";

/** @param input {InputState}
* @return {GameState} */
function createGameState(input) {
    return /** @type GameState */({
        input,
    })
}

/** @return {{h: Handler, l: Handler, input: InputState, state: GameState }}*/
function createTest() {
    const input = Input.createInputState();
    const state = createGameState(input);
    const h = Input.createHandler("h", input.inputs);
    const l = Input.createHandler("l", input.inputs);

    return {
        input, state, h, l
    }
}

test("keyup without a keydown does nothing", () => {
    const {
        input, state, h
    } = createTest();


    h({
        timestamp: 120,
        key: "h",
        type: "keyup"
    });
    state.loopStartTime = 125;

    Input.update(state, 25);

    assert.equal(input.hasInput, false, "expected no valid input")
    assert.equal(input.inputs.h.tickHoldDuration, 0, "no hold time")
    assert.equal(input.inputs.h.timestamp, 0, "no timestamp")
});

test("keydown frame 1, partial, then keyup partial", () => {
    const {
        input, state, h
    } = createTest();

    h({
        timestamp: 120,
        key: "h",
        type: "keydown"
    });
    state.loopStartTime = 125;

    Input.update(state, 25);

    assert.equal(input.hasInput, true, "expected valid input")
    assert.equal(input.inputs.h.tickHoldDuration, 5, "5 milliseconds of hold time")
    assert.equal(input.inputs.h.timestamp, 125, "timestamp should be updated to the gameloop time as we have played that much time")

    Input.tickClear(state);

    h({
        timestamp: 142,
        key: "h",
        type: "keyup"
    });
    state.loopStartTime = 150;

    Input.update(state, 25);
    assert.equal(input.hasInput, true, "expected valid input")
    assert.equal(input.inputs.h.tickHoldDuration, 17, "there should be a bit of holding input time left")
    assert.equal(input.inputs.h.timestamp, 0, "timestamp should be removed to be cleared next round")

    Input.tickClear(state);
    assert.equal(input.hasInput, false, "expected valid input")
});

test("keydown and up in a single frame", () => {
    const {
        input, state, h
    } = createTest();

    h({
        timestamp: 120,
        key: "h",
        type: "keydown"
    });
    h({
        timestamp: 123,
        key: "h",
        type: "keyup"
    });
    state.loopStartTime = 125;

    Input.update(state, 25);

    assert.equal(input.hasInput, true, "expected valid input")
    assert.equal(input.inputs.h.tickHoldDuration, 3, "3 milliseconds of hold time")
    assert.equal(input.inputs.h.timestamp, 0, "timestamp has already processed all the possible input")

    Input.tickClear(state);
    assert.equal(input.hasInput, false, "expected valid input")
});


