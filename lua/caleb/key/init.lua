local Events = require("caleb.bus").Events

--- @class KeySequencerOpts

--- @class KeySequencer
--- @field opts {}
--- @field last_chars string[]
--- @field bussin Bussin
local KeySequencer = {}
KeySequencer.__index = KeySequencer

--- @param bussin Bussin
--- @param opts KeySequencerOpts
--- @returns KeySequencer
function KeySequencer:new(bussin, opts)
    return setmetatable({
        opts = opts,
        bussin = bussin,
        last_chars = {}
    }, self)
end

--- @param key string
function KeySequencer:feed(key)
    if
        #key > 1
        and string.byte(key, 1) == 128
        and string.byte(key, 2) == 253
    then
        return
    end

    print("attempting to remove escape", key, key == "", key == "\27")
    if key == "" or key == "\27" then
        return
    end

    if key == "" then
        self.bussin:emit(Events.ForceWindowReset, {})
    elseif key == "h" then
        self.bussin:emit(Events.PlayerMovement, {key = key})
    elseif key == ":" then
        table.insert(self.last_chars, ":")
    elseif #self.last_chars > 0 then
        self:_combo(key)
    end

end

function KeySequencer:_combo(key)
    print("combo!!!!", key)
    if key == "w" then
        self.bussin:emit(Events.Save, {})
    elseif key == "q" then
        self.bussin:emit(Events.Quit, {})
    end

    self:_reset()
end

function KeySequencer:_reset()
    self.last_chars = {}
end

return KeySequencer
