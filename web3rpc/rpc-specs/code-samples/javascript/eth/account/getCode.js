const { JsonRpcProvider } = require("@klaytn/ethers-ext");
(() => {
  const provider = new JsonRpcProvider("https://public-en-baobab.klaytn.net");

  const address = "0xce9fba8dca42d096d019cc1cb89f5803a2c40fb3";
  const blockNumberOrHash = "0x2";

  provider.eth
    .getCode(address, blockNumberOrHash, {}, (err, data, response) => {})
    .then((data) => {
      console.log(data);
    });
})();
