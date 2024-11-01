local eq = assert.are.same
local consts = require("caleb.consts")
local Renderer = require("caleb.renderer")
local float = require("caleb.window.float")

describe("app#color", function()
    it("should open and close down windows correctly", function()
        local win = float.create_game_window()
        local ren = Renderer.Renderer:new(win)

        ren:background({
            render_x = 5,
            render_y = 7,
            render_width = 1,
            render_height = 1,
            colors = { 1 },
        })

        -- FORGIVE ME FOR I HAVE SINNED
        local idx = Renderer.to_render_space(5, 7)
        eq(1, ren.current.background[idx])

    end)
end)
