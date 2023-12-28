const { JsonRpcProvider } = require("@klaytn/ethers-ext");
(() => {
  const provider = new JsonRpcProvider("https://public-en-baobab.klaytn.net");

  const address = "0x295a70b2de5e3953354a6a8344e616ed314d7251";
  const quantity = "0x0";
  const blockNumberOrHashOrTag = "latest";

  provider.eth
    .getStorageAt(
      address,
      quantity,
      blockNumberOrHashOrTag,
      {},
      (err, data, response) => {},
    )
    .then((data) => {
      console.log(data);
    });
})();
