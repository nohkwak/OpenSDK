const { JsonRpcProvider } = require("@klaytn/ethers-ext");
(() => {
  const provider = new JsonRpcProvider("https://public-en-baobab.klaytn.net");
  const blockNumber = 89;

  provider.governance
    .itemsAt(blockNumber, {}, (err, data, response) => {})
    .then((data) => {
      console.log(data);
    });
})();
