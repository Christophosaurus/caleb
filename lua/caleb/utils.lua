local M = {}

function M.split(inputstr, sep)
    if sep == nil then
        sep = "%s"
    end
    local t = {}
    for str in string.gmatch(inputstr, "([^" .. sep .. "]+)") do
        table.insert(t, str)
    end
    return t
end

local current_auto_group = nil
local function create_autogroup()
    current_auto_group = vim.api.nvim_create_augroup("CalebControl", {})
end
create_autogroup()

function M.caleb_group_id()
    return current_auto_group
end

function M.del_group_id()
    if current_auto_group ~= nil then
        vim.api.nvim_del_augroup_by_id(current_auto_group)
    end
    create_autogroup()
end

function M.force_game_mode()
    vim.api.nvim_feedkeys(vim.api.nvim_replace_termcodes("<Esc>", true, false, true), "n", true)
    vim.api.nvim_command('stopinsert')
end

return M


