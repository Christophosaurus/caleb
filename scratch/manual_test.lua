R("caleb")

local window = require("caleb.window")

local game = window.GameControl:new({})
game:activate()
vim.defer_fn(function()
    game:deactivate()
end, 5000)

