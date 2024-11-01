--- @class Caleb
--- @field x number
--- @field y number
--- @field colors (number | nil)[]
--- @field render_height number
--- @field render_width number
--- @field render_x number
--- @field render_y number
local Caleb = {}
Caleb.__index = Caleb

function Caleb:new(x, y)
    return setmetatable({
        x = x,
        y = y,
        colors = { 1 },
        render_height = 1,
        render_width = 1,
        render_x = math.floor(x),
        render_y = math.floor(y),
    }, self)
end

function Caleb:update() end

function Caleb:key_down(key) end

return Caleb
