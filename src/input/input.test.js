import test from "node:test";
import * as assert from "node:assert";
import * as Input from "./input.js";

test("testing input for holding ", () => {
    const input = Input.createInputState();
    assert.equal(2 + 2, 4);
});


