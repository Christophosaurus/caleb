local Path = require("plenary.path")
local data_path = string.format("%s/caleb", vim.fn.stdpath("data"))

--- @class CalebData

--- @return CalebData
local function read()
    local path = Path:new(data_path)
    local exists = path:exists()

    if not exists then
        return {}
    end

    local out_data = path:read()

    if not out_data or out_data == "" then
        return {}
    end

    local ok, data = pcall(vim.json.decode, out_data)
    if not ok then
        return {}
    end

    return data
end

--- @param game_state CalebData
local function write(game_state)
    local ok, encoded = pcall(vim.json.encode, game_state)

    if not ok then
        error("invalid data provided.  could not json encode: " .. encoded)
    end

    Path:new(data_path):write(encoded, "w")
end

return {
    read = read,
    write = write,
}


