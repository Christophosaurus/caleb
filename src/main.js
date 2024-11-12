import * as Config from "./game-config.js"
import * as Levels from "./objects/level/levels/levels.js"
import { assert } from "./assert.js";
import * as Runner from "./game-runner.js";

const canvas = /** @type {HTMLCanvasElement} */ (document.getElementById("game_canvas"))
assert(!!canvas, "expected canvas to exist")

const urlParams = new URLSearchParams(window.location.search);
const debug = urlParams.get("debug") === "1";

// TODO level selection will likely need to be passed in
const level = Levels.levels()[0]
const state = Config.createCanvasGame(canvas, Config.getGameConfig(debug), level)
Config.addBrowserListeners(state, canvas)

const ticks = [Runner.tickWithRender]
const loop = Runner.createGameLoop(state)
Runner.clear(state)
Runner.addStandardBehaviors(state)
Runner.run(
    state,
    loop,
    ticks,
    () => {
        console.log("game finished")
    });




