const { JsonRpcProvider } = require("@klaytn/ethers-ext");

(async () => {
    let provider = new JsonRpcProvider("https://public-en-baobab.klaytn.net");
    const blockHash = '0xba647d41423faeebe8a7c64737d284fc2eba6f0388a3e1ebf6243db509ec1577'


    // The full list of JSON-RPC is available at:
    // https://docs.klaytn.foundation/content/dapp/json-rpc/api-references
    let data = await provider.eth.getBlockReceipts(blockHash);
    console.log("Block receipts", data);
}
)();