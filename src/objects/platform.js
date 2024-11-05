
/** @param state {GameState}
*/
export function render(state) {
    const envs = state.platforms
    const ctx = state.ctx;

    for (const e of envs) {
        ctx.fillRect(e.renderX, e.renderY, e.renderWidth, e.renderHeight);
    }
}

