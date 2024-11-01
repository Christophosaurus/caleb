--- @alias Callback fun(event: string, args: any): nil

--- @class Bussin
--- @field callbacks table<string, Callback[]>
local Bussin = {}
Bussin.__index = Bussin

--- @returns Bussin
function Bussin:new()
    return setmetatable({
        callbacks = {}
    }, self)
end

---@param event string
---@param cb Callback
function Bussin:add_callback(event, cb)
    if not self.callbacks[event] then
        self.callbacks[event] = {}
    end

    table.insert(self.callbacks[event], cb)
end

---@param event string
---@param args any
function Bussin:emit(event, args)
    if not self.callbacks[event] then
        return
    end
    for _, value in ipairs(self.callbacks[event]) do
        value(event, args)
    end
end

return {
    Bussin = Bussin,
    Events = {
        ForceWindowReset = "fwr",
        PlayerMovement = "pm",
        Save = "s",
        Quit = "q",
    }
}
