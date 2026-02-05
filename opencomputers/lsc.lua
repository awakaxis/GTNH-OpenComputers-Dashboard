-- TODO: simple test file, needs work
local component = require("component")
local internet = require("internet")
local event = require("event")

for a, t in component.list() do
	print(a, t)
	if t == "gt_machine" then
		local proxy = component.proxy(a)
		for k, c in pairs(proxy) do
			print(k)
		end
		repeat
			print(proxy.getStoredEU())
			internet.request("http://192.168.1.3:8000/submit-lsc?stored_eu=" .. tostring(proxy.getStoredEU()))
		until event.pull(1) == "interrupted"
	end
end

