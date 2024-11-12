import { renderlessTick } from "./game.js";
import * as Input from "./input/input.js";
import * as Levels from "./objects/level/levels/levels.js";
import * as State from "./state/state.js";
import * as Utils from "./utils.js";
import { GAME_HEIGHT, GAME_WIDTH } from "./window.js";

/** @type {Dimension} */
const dim = {width: GAME_WIDTH * 100, height: GAME_HEIGHT * 100}
function getDim() {
    return dim
}
function getCtx() {
    return null
}

const seed = +process.argv[2]
const ticks = +process.argv[3]
const rand = Utils.mulberry32(seed)
const opts = Utils.getSimulationConfig(rand);
const one = Levels.levels()[0];
const iS = Input.createInputState()
const state = State.createGameState(opts, iS, getDim, getCtx, one);

let now = 0
Utils.setNow(() => now);

for (let i = 0; i < ticks; ++i) {
    now = i * opts.frameTimeMS;
    renderlessTick(state, opts.frameTimeMS);
}
