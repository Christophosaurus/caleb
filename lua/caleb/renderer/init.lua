local float = require("caleb.window.float")
local consts = require("caleb.consts")
local colors = require("caleb.renderer.colors")

local WIDTH = consts.RENDER_WIDTH
local HEIGHT = consts.RENDER_HEIGHT

--- @class Renderable
--- @field colors (number | nil)[]
--- @field render_height number
--- @field render_width number
--- @field render_x number
--- @field render_y number

--- @class RenderPlane
--- @field foreground (number | nil)[]
--- @field background (number | nil)[]

---assumes 0 based index for both x and y
---@param x number
---@param y number
---@return number
local function to_render_space(x, y)
    return (y - 1) * consts.RENDER_WIDTH + x
end


local function debug_plane(plane)
    print("debugging")
    for y = 1, consts.RENDER_HEIGHT, 1 do
        local offset = (y - 1) * consts.RENDER_WIDTH
        local line = string.format("%02d:", y)
        for x = 1, consts.RENDER_WIDTH, 1 do
            if plane[offset + x] == nil then
                line = line .. " "
            else
                line = line .. "1"
            end
        end
        print(line)
    end
end

---@param plane RenderPlane
---@param renderable Renderable
local function onto_plane(plane, renderable)
    for y = 1, renderable.render_height, 1 do
        local offset_y = y + renderable.render_y - 1
        for x = 1, renderable.render_width, 1 do
            local offset_x = x + renderable.render_x - 1

            if renderable.render_x + (x - 1) > WIDTH then
                print("placement is off the board")
                break
            end

            local idx = to_render_space(offset_x, offset_y)
            plane[idx] = renderable.colors[(y - 1) * renderable.render_width + x]
        end
    end
end

--- @class Renderer
--- @field current RenderPlane
--- @field _cursor {x: number, y: number}
--- @field _window FloatWindow
local Renderer = {}
Renderer.__index = Renderer

---
local function clear_color_plane(plane)
    for i = 1, WIDTH * HEIGHT, 1 do
        plane[i] = nil
    end
    return plane
end

--- @return RenderPlane
local function create_render_plane()
    return {
        foreground = clear_color_plane({}),
        background = clear_color_plane({}),
    }
end

--- @param window FloatWindow
--- @return Renderer
function Renderer:new(window)
    colors.set_colors(window)
    return setmetatable({
        _window = window,
        current = create_render_plane(),
    }, self)
end

--- @param renderable Renderable
function Renderer:foreground(renderable)
    onto_plane(self.current.foreground, renderable)
end

--- @param renderable Renderable
function Renderer:background(renderable)
    onto_plane(self.current.background, renderable)
end

--- @param x number
--- @param y number
function Renderer:cursor(x, y)
    self.ccursor = { x, y }
end

function Renderer:debug()
    debug_plane(self.current.background)
end

function Renderer:render()
    colors.clear_highlights()
    float.clear_game_window(self._window)
    float.enforce_cursor_in_game_window(self._window)

    for y = 1, consts.RENDER_HEIGHT, 1 do
        local offset = (y - 1) * consts.RENDER_WIDTH
        for x = 1, consts.RENDER_WIDTH, 1 do
            if self.current.background[offset + x] ~= nil then
                vim.api.nvim_buf_add_highlight(
                    self._window.buf,
                    colors.ns_id,
                    colors.Colors.Red,
                    y,
                    x,
                    x + 1
                )
            end
        end
    end

    clear_color_plane(self.current.background)
end

return {
    Renderer = Renderer,
    to_render_space = to_render_space,
}

