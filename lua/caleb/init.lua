local Caleb = require("caleb.game")
local Window = require("caleb.window")
local Bussin = require("caleb.bus")
local Key = require("caleb.key")
local Renderer = require("caleb.renderer")
local utils    = require("caleb.utils")

local ns_id = vim.api.nvim_create_namespace("CalebGame")

--- @class CalebGame
--- @field sequencer KeySequencer
--- @field bus Bussin
--- @field win GameControl | nil
--- @field rend Renderer | nil
--- @field playing boolean
--- @field last_win number
--- @field caleb Caleb | nil
local CalebGame = {}
CalebGame.__index = CalebGame

--- @return CalebGame
function CalebGame:new()
    local bus = Bussin.Bussin:new()

    return setmetatable({
        bus = bus,
        win = nil,
        playing = false,
        rend = nil,
        sequencer = Key:new(bus, {}),
    }, self)
end

function CalebGame:start_game()
    assert(self.playing == false, "cannot start a game when a game is active")

    self.playing = true
    self.last_win = vim.api.nvim_get_current_win()
    self.win = Window.GameControl:new({})
    self.win:activate()

    self.rend = Renderer.Renderer:new(self.win._game)
    self.caleb = Caleb:new(self.win, self.rend, {
        frame_time = 33
    })

    self.bus:add_callback(Bussin.Events.Quit, function()
        self:end_game()
    end)

    vim.on_key(function(key)
        self.sequencer:feed(key)
    end, ns_id)

    self.caleb:start()
end


function CalebGame:end_game()
    assert(self.win ~= nil, "you are ending a game before you began one")
    assert(self.rend ~= nil, "you are ending a game before you began one")
    assert(self.playing, "cannot end a game when no game is active")

    self.caleb:stop()
    self.win:deactivate()
    self.playing = false
    vim.api.nvim_set_current_win(self.last_win)
    utils.force_game_mode()

    self.win = nil
    self.rend = nil
    self.bus = nil
    self.sequencer = nil

    vim.on_key(nil, ns_id)
end

return CalebGame
