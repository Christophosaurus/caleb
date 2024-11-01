local utils = require("caleb.utils")
local float = require("caleb.window.float")
local autocmd = vim.api.nvim_create_autocmd

--- @class GameControl
--- @field _active boolean
--- @field _control nil | FloatWindow
--- @field _game nil | FloatWindow
--- @field _on_key_id nil | any
local GameControl = {}
GameControl.__index = GameControl

function GameControl:new(opts)
    return setmetatable({
        opts = opts,
        _active = false,
    }, self)
end

function GameControl:is_active()
    return self._active
end

function GameControl:dump_window_information()
    return {
        game = self._game,
        control = self._control,
    }
end

function GameControl:activate()
    assert(self._active == false, "the game is already active")

    self._control = float.create_control_window()
    self._game = float.create_game_window()
    self:_force_window()

    assert(self._control.buf ~= nil, "unable to create control window buf")
    assert(self._game.buf ~= nil, "unable to create game window buf")

    local group = utils.caleb_group_id()
    -- force cursor
    autocmd("BufLeave", {
        group = group,
        pattern = "*",
        callback = function()
            if not self._active then
                return
            end

            self:_force_window()
        end,
    })

    self._active = true
end

function GameControl:deactivate()
    assert(self._active, "cannot deactivate a playing game")

    utils.del_group_id()
    float.close_float(self._game)
    float.close_float(self._control)

    self._game = nil
    self._control = nil
    self._active = false
end

function GameControl:_force_window()
    local ctrl_valid = vim.api.nvim_win_is_valid(self._control.win)
    local game_valid = vim.api.nvim_win_is_valid(self._game.win)

    if ctrl_valid and game_valid then
        vim.api.nvim_set_current_win(self._control.win)
        vim.api.nvim_win_set_buf(self._game.win, self._game.buf)
        utils.force_game_mode()
    else
        self:deactivate()
    end
end

function GameControl:render()
    self:_force_window()
end

return {
    GameControl = GameControl,
}
