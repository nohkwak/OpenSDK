const { JsonRpcProvider } = require("@klaytn/ethers-ext");
(() => {
  const provider = new JsonRpcProvider("https://public-en-baobab.klaytn.net");
  const address = "0xfa415bb3e6231f488ff39eb2897db0ef3636dd32";

  provider.personal
    .lockAccount(address, {}, (err, data, response) => {})
    .then((data) => {
      console.log(data);
    });
})();
