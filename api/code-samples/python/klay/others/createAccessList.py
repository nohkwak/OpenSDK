import json
from opensdk.sdk import OpenSDK

host = "https://api.baobab.klaytn.net:8651"

callObject = {
      "from": "0x3bc5885c2941c5cda454bdb4a8c88aa7f248e312",
      "to": "0x00f5f5f3a25f142fafd0af24a754fafa340f32c7",
      "gas": "0x3d0900",
      "gasPrice": "0x3b9aca00",
      "data": "0x20965255"
    }
blockTag = "latest"

sdk = OpenSDK(host)
klay_response = sdk.klay.create_access_list(callObject, blockTag)

print(json.loads(klay_response.response.data))
