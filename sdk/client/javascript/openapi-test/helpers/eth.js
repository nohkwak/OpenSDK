const OpenSdk = require("opensdk-javascript");
const { RPC } = require("../test/constant");

const sdk = new OpenSdk(new OpenSdk.ApiClient(RPC));

export const getEthFilterId = () => {
    return new Promise((res, ej) => {
        const opts = {
            "fromBlock": "earliest",
            "toBlock": "latest",
            "address": "0x87ac99835e67168d4f9a40580f8f5c33550ba88b",
            "topics": [
                "0xd596fdad182d29130ce218f4c1590c4b5ede105bee36690727baa6592bd2bfc8"
            ]
        }
        sdk.eth.newFilter(opts, {}, (error, data, response) => {
            if (error) ej(error)
            return res(data.result)
        });
    })
}