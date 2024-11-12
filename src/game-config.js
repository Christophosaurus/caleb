import * as Utils from "./utils.js";
import * as Input from "./input/input.js";
import * as State from "./state/state.js";
import * as Simulation from "./simulation/state.js";
import * as Window from "./window.js";
import { Vector2D } from "./math/vector.js";
import * as Ease from "./math/ease.js";

/**
 * @param canvas {HTMLCanvasElement}
 */
function configureCanvas(canvas) {
    canvas.getContext("2d").imageSmoothingEnabled = false;
    canvas.tabIndex = 0;
    canvas.focus();
    canvas.addEventListener('blur', () => {
        canvas.focus();
    });
    // TODO: this will probably need to fixed
    window.addEventListener('click', () => {
        canvas.focus();
    });

    window.addEventListener("resize", function() {
        Window.resize(canvas);
    });
    Window.resize(canvas);
}

/**
 * @param {HTMLCanvasElement} canvas
 * @param {GameOptions} gameopts
 * @param {LevelSet} levelSet
 * @returns {GameState}
 */
export function createCanvasGame(canvas, gameopts, levelSet) {
    configureCanvas(canvas)

    const inputState = Input.createInputState();
    const state = State.createGameState(
        gameopts,
        inputState,
        () => canvas,
        () => canvas.getContext("2d"),
    levelSet);

    // @ts-ignore
    window.state = state

    return state
}

/**
 * @param {GameState} state
 * @param {HTMLCanvasElement} canvas
 */
export function addBrowserListeners(state, canvas) {
    // TODO: clean these up?
    Input.listenTo(canvas, state.input);
    State.reset(state);

    window.addEventListener("resize", function() {
        State.projectStaticObjects(state);
    });
}

/**
 * @param {number} seed
 * @param {GameState} state
 */
export function addSimulation(seed, state) {
    const rand = Utils.mulberry32(seed)
    const simState = Simulation.createSimState(state, {
        maxJump: 15,
        waitRange: {start: 100, stop: 500},
        holdRange: {start: 100, stop: 1500},
    }, {
        rand,
        randRange: Utils.randRange(rand),
        randInt: Utils.randInt(rand),
        randRangeR: Utils.randRangR(rand),
    });

}

/**
 * @param {boolean} debug
 * @returns {GameOptions}
 */
export function getGameConfig(debug) {
    return {
        debug,

        frameTimeMS: 16,
        tickTimeMS: 8,

        caleb: {
            hodlTime: 500,
            normWidthsPerSecond: 10,
            dash: {
                dashNormWidth: 30,
                distance: 5,
                dashEaseRange: 0.10
            },

            jump: {
                jumpEaseMS: 500,
                jumpEaseRange: 0.10,
                jumpNormHeight: 30,
                jumpEaseFn: Ease.x3,
                noJumpBase: 450,
                noJumpMultiplier: 350,
            }
        },

        tolerance: {
            topBy: 0.15,
            bottomBy: 0.15,
        },

        gravity: new Vector2D(0, 28),
    }
}
