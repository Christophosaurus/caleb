import test from "node:test";
import * as assert from "node:assert";
import * as Pos from "./pos.js";

test("pos isGreaterThan", () => {
    assert.equal(Pos.gt({
        row: 6,
        col: 9,
    }, {
        row: 6,
        col: 8,
    }), true)

    assert.equal(Pos.gt({
        row: 6,
        col: 9,
    }, {
        row: 6,
        col: 10,
    }), false)

    assert.equal(Pos.equal({
        row: 6,
        col: 9,
    }, {
        row: 6,
        col: 9,
    }), true)
});



