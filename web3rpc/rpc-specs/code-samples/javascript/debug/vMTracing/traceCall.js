const { JsonRpcProvider } = require("@klaytn/ethers-ext");

(async () => {
    let provider = new JsonRpcProvider("https://public-en-baobab.klaytn.net");
    const tracerCallObject = {"to":"0x46eda75e7ca73cb1c2f83c3927211655420dbc44","data":"0x3fb5c1cb00000000000000000000000000000000000000000000000000000000000003e7"};
    const blockNumber = "latest";
    const options = {"tracer":"revertTracer"};

    // The full list of JSON-RPC is available at:
    // https://docs.klaytn.foundation/content/dapp/json-rpc/api-references
    let data = await provider.debug.traceCall(tracerCallObject, blockNumber, options);
    console.log("Trace call", data);
}
)();