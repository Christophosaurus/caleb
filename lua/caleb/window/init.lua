local utils = require("caleb.utils")
local float = require("caleb.window.float")
local autocmd = vim.api.nvim_create_autocmd

--- @class GameControl
--- @field _active boolean
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
    }
end

function GameControl:activate()
    assert(self._active == false, "the game is already active")

    self._game = float.create_game_window()
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
            self:_force_game_window()
        end,
    })

    self._on_key_id = vim.on_key(function(key)
        if
            #key > 1
            and string.byte(key, 1) == 128
            and string.byte(key, 2) == 253
        then
            return
        end
    end)

    self._active = true
end

function GameControl:deactivate()
    assert(self._active, "cannot deactivate a playing game")

    vim.on_key(nil, self._on_key_id)
    utils.del_group_id()
    float.close_float(self._game)

    self._game = nil
    self._on_key_id = nil
    self._active = false
end

function GameControl:_force_game_window()
    if vim.api.nvim_win_is_valid(self._game.win) then
        vim.api.nvim_set_current_win(self._game.win)
        vim.api.nvim_win_set_buf(self._game.win, self._game.buf)
    else
        self:deactivate()
    end
end

function GameControl:render()
    self:_force_game_window()
end

return {
    GameControl = GameControl,
}
