local eq = assert.are.same
local window = require("caleb.window")

describe("app#color", function()
    it("should open and close down windows correctly", function()
        local game = window.GameControl:new({})
        game:activate()

        local win_info = game:dump_window_information()

        -- i know, reaching into the internals... blah blah
        eq(true, vim.api.nvim_buf_is_valid(win_info.game.buf))
        eq(true, vim.api.nvim_buf_is_valid(win_info.control.buf))
        eq(true, vim.api.nvim_win_is_valid(win_info.game.win))
        eq(true, vim.api.nvim_win_is_valid(win_info.control.win))

        eq(true, game:is_active())

        game:deactivate()

        -- i know, reaching into the internals... blah blah
        eq(false, vim.api.nvim_win_is_valid(win_info.game.win))
        eq(false, vim.api.nvim_win_is_valid(win_info.control.win))

        eq(false, vim.api.nvim_buf_is_valid(win_info.control.buf))
        eq(false, vim.api.nvim_buf_is_valid(win_info.game.buf))

        eq(false, game:is_active())
    end)
end)
