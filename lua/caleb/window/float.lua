local M = {}
local api = vim.api

--- @class FloatWindow
--- @field win number
--- @field buf number

local function get_control_window_opts()
    local width = api.nvim_get_option("columns")
    local height = api.nvim_get_option("lines")

    return {
        relative = "editor",
        width = 1,
        height = 1,
        row = height - 2,
        col = width - 2,
        style = "minimal",
    }
end

--- @return FloatWindow
function M.create_control_window()
    local opts = get_control_window_opts()
    local buf = api.nvim_create_buf(false, true)
    local win = api.nvim_open_win(buf, true, opts)

    return { win = win, buf = buf }
end

local function get_game_window_opts()
    local width = api.nvim_get_option("columns")
    local height = api.nvim_get_option("lines")

    local p_height = math.max(0, math.floor((height - 24) / 2))

    -- gutter makes this a bit offset...
    local p_width = math.max(0, math.floor((width - 80) / 2))

    return {
        relative = "editor",
        width = 80,
        height = 24,
        row = p_height,
        col = p_width,
        style = "minimal",
    }
end

--- @return FloatWindow
function M.create_game_window()
    local opts = get_game_window_opts()
    local buf = api.nvim_create_buf(false, true) -- No file, scratch buffer
    local win = api.nvim_open_win(buf, true, opts)

    return { win = win, buf = buf }
end

---@param game FloatWindow
function M.resize_game_window(game)
    local opts = get_game_window_opts()
    api.nvim_win_set_config(game.win, opts)
end

---@param control FloatWindow
function M.resize_control_window(control)
    local opts = get_control_window_opts()
    api.nvim_win_set_config(control.win, opts)
end

---@param win FloatWindow
function M.close_float(win)
    if vim.api.nvim_buf_is_valid(win.buf) then
        vim.api.nvim_buf_delete(win.buf, {
            force = true,
        })
    end

    if vim.api.nvim_win_is_valid(win.win) then
        vim.api.nvim_win_close(win.win, true)
    end
end

return M
