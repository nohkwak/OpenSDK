const { JsonRpcProvider } = require("@klaytn/ethers-ext");
(() => {
  const provider = new JsonRpcProvider("https://public-en-baobab.klaytn.net");
  const blockNumber = "0x80";

  provider.debug
    .dumpBlock(blockNumber, {}, (err, data, response) => {})
    .then((data) => {
      console.log(data);
    });
})();
