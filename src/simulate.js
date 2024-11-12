import * as Input from "./input/input.js";
import * as Levels from "./objects/level/levels/levels.js";
import { tick } from "./simulation/input.js";
import * as State from "./state/state.js";
import * as Utils from "./utils.js";
import * as Simulation from "./simulation/state.js";
import { GAME_HEIGHT, GAME_WIDTH } from "./window.js";
import { tickWithoutRender } from "./game2.js";

/** @type {Dimension} */
const dim = {width: GAME_WIDTH * 100, height: GAME_HEIGHT * 100}
let now = 0

function getDim() { return dim }
function getCtx() { return null }
Utils.setNow(() => now);

/** @param {number} next */
function setTime(next) { now = next }

const seed = +process.argv[2]
const ticks = +process.argv[3]
const state =

const ticks = [
    tickWithoutRender
]
