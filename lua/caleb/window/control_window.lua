local M = {}
local api = vim.api

--- @class WindowOptions

-- Helper function to create a 1x1 floating window in the bottom right corner
function M.create_control_window()
  -- Get the dimensions of the current Neovim window
  local width = api.nvim_get_option("columns")
  local height = api.nvim_get_option("lines")

  -- Configure the window options
  local opts = {
    relative = "editor",
    width = 1,
    height = 1,
    row = height - 2,  -- Adjust for zero-based index and status line
    col = width - 2,   -- Adjust for zero-based index and padding
    style = "minimal"
  }

  -- Create a new buffer for the floating window
  local buf = api.nvim_create_buf(false, true) -- No file, scratch buffer
  if not buf then return end

  -- Create the floating window
  local win = api.nvim_open_win(buf, true, opts)

  -- Move the cursor to the floating window
  api.nvim_set_current_win(win)
end

return M
