local component = require("component")
local internet = require("internet")

local tProxy = component.proxy("172ab067-ab6f-4f0e-b9bf-99a3b698c7d0")

print("serving LSC information...")
while true do
	local sRequestBody = '{"stored": "%s", "avg_in": "%s", "avg_out": "%s", "passive_loss": "%s"}'
	local tSensorInformation = tProxy.getSensorInformation()
	local sStoredEU = tProxy.getStoredEU()
	local sAvgIn = tSensorInformation[10]:match("(.-)%s%(", 12)
	local sAvgOut = tSensorInformation[11]:match("(.-)%s%(", 13)
	local sPassiveLoss = tSensorInformation[7]:match("(.-)%sE", 15)
	internet.request(
		"http://192.168.1.3:8000/submit-lsc",
		sRequestBody:format(sStoredEU, sAvgIn, sAvgOut, sPassiveLoss),
		{},
		"PUT"
	)
	os.sleep(0.5)
end

