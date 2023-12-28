const { JsonRpcProvider } = require("@klaytn/ethers-ext");
(() => {
  const provider = new JsonRpcProvider("https://public-en-baobab.klaytn.net");
  const file = "mutex.profile";

  provider.debug
    .writeMutexProfile(file, {}, (err, data, response) => {})
    .then((data) => {
      console.log(data);
    });
})();
