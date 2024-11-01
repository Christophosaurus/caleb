local utils = require("caleb.utils")
local float = require("caleb.window.float")
local M = {}
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
        active = false,
    }, self)
end

function GameControl:activate()
    self._control = float.create_control_window()
    self._game = float.create_game_window()

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
            vim.api.nvim_set_current_win(self._control.win)
        end
    })

    autocmd("ModeChanged", {
        group = group,
        pattern = "*",
        callback = function(event)
            if not self._active then
                return
            end
            local mode = utils.split(event.match, ":")
            print(vim.inspect(mode))
        end
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
end

function GameControl:deactivate()
    if self._on_key_id ~= nil then
        vim.on_key(nil, self._on_key_id)
        self._on_key_id = nil
    end

    utils.del_group_id()
end

local game = GameControl:new({})
game:activate()
vim.defer_fn(function()
    game:deactivate()
end, 5000)

return M
