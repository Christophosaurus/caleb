local M = {}

M.Colors = {
    Red = "CalebRed",
}
M.ns_id = vim.api.nvim_create_namespace("CalebColors")

function M.clear_highlights()
    vim.api.nvim_buf_clear_namespace(0, M.ns_id, 0, -1)
end

---@param win FloatWindow
function M.set_colors(win)
    vim.api.nvim_set_hl(M.ns_id, M.Colors.Red, { bg = "#FF0000" })
    vim.api.nvim_win_set_hl_ns(win.win, M.ns_id)
end

return M
