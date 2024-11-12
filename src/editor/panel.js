export class PlatformControls extends HTMLElement {
  constructor() {
    super();
  }
}

/**
 * @param {EditorState} state
 * @param {EditorPlatform} platform
 */
function createPlatformControls(state, platform) {
    const panel = state.panel

    const type = document.createElement("div")
    type.innerText = "type"

}

/**
 * @param {EditorState} state
 */
function removePlatformControls(state) {
}

