from opensdk.sdk import OpenSDK

host = "https://api.baobab.klaytn.net:8651"

sdk = OpenSDK(host)
eth_response = sdk.eth.protocol_version()

print(eth_response)
