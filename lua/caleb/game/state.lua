
--- @class CalebGameState
--- @field x number

--- @return CalebGameState
local function new_game_state()
    return { x = 1 }
end

return {
    new_game_state = new_game_state,
}

