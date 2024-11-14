
/**
 * @param {EditorState} state
 * @param {ElementState} es
*/
export function down(state, es) {
    state.mouse.state = "down"
    state.mouse.startingEl = es
}

/**
 * @param {EditorState} state
*/
export function clearState(state) {
    state.mouse.startingEl = null
    state.mouse.state = "invalid"
}

/**
 * maintains startingEl for selection purposes
 * @param {EditorState} state
*/
export function up(state) {
    state.mouse.state = "invalid"
}
