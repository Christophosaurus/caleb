R("caleb")

local Window = require("caleb.window")
local Renderer = require("caleb.renderer")

local win = Window.GameControl:new({})
win:activate()
local ren = Renderer.Renderer:new(win._game)

-- that way i can fake it????
-- perhaps testing will need this
local function now()
    return vim.loop.now()
end


local box = {
    colors = {1},
    render_height = 1,
    render_width = 1,
    render_x = math.floor(30),
    render_y = math.floor(12),
}

local start_time = now()
local function game_loop(state, opts)
    if now() - start_time > opts.run_time then
        win:deactivate()
        return
    end

    --- # update part
    box.render_x = box.render_x + state.x

    if box.render_x > 60 then
        state.x = -1
    elseif box.render_x < 20 then
        state.x = 1
    end

    --- # render part
    win:render()
    ren:background(box)
    ren:render()

    vim.defer_fn(function()
        game_loop(state, opts)
    end, opts.timeout)
end

game_loop({
    x = 1
}, {
    run_time = 50000,
    timeout = 33,
})
