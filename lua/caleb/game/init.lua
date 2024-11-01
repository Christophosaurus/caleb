local GameState = require("caleb.game.state")

--- @class CalebOptions
--- @field frame_time number

--- @class Caleb
--- @field opts CalebOptions
--- @field playing boolean
--- @field win GameControl
--- @field rend Renderer
--- @field state CalebGameState
local Caleb = {}
Caleb.__index = Caleb

--- @param win GameControl
--- @param rend Renderer
--- @param opts CalebOptions
--- @return Caleb
function Caleb:new(win, rend, opts)
    return setmetatable({
        state = GameState.new_game_state(),
        rend = rend,
        win = win,
        opts = opts,
        playing = false,
    }, self)
end

local box = {
    colors = {1},
    render_height = 1,
    render_width = 1,
    render_x = math.floor(30),
    render_y = math.floor(12),
}

function Caleb:_game_loop()
    if not self.playing then
        return
    end

    --- # update part
    box.render_x = box.render_x + self.state.x

    if box.render_x > 60 then
        self.state.x = -1
    elseif box.render_x < 20 then
        self.state.x = 1
    end

    --- # render part
    self.win:render()
    self.rend:background(box)
    self.rend:render()

    vim.defer_fn(function()
        self:_game_loop()
    end, self.opts.frame_time)
end

function Caleb:stop()
    self.playing = false
end

function Caleb:start()
    self.playing = true
    self:_game_loop()
end


return Caleb
