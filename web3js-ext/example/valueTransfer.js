const { Web3 } = require("web3");
const { web3klaytn } = require( "../dist");


// const priv = "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80";
const priv="0xb3cf575dea0081563fe5482de2fe4425e025502b1f4ae7e02b2540ac0a5beda1";
// const addr = "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266";
const addr = "0x3208ca99480f82bfe240ca6bc06110cd12bb6366";
// const to = "0x70997970c51812dc3a010c7d01b50e0d17dc79c8";
const to = "0xe81d480b3e90f11f82b35f3fED1400dcc79cf1B5";
// const url = "http://localhost:8545";
const url = "https://public-en-baobab.klaytn.net";


async function main() {
  let provider = new Web3.providers.HttpProvider(url);

  let web3 = new web3klaytn(provider);

  let sender = web3.eth.accounts.privateKeyToAccount(priv);
  console.log(sender);

  let tx = {
    from: sender.address,
    to: to,
    // nonce: 319, 
    value: 1e9,
    // gas: 21000,
    // gasPrice: 25e9,
    type: 8,
  };

  let signResult = await web3.eth.accounts.signTransaction(tx, sender.privateKey);
  console.log(signResult);

  let sendResult = await web3.eth.sendSignedTransaction(signResult.rawTransaction);
  console.log(sendResult.transactionHash);

  let receipt = await web3.eth.getTransactionReceipt(sendResult.transactionHash);
  console.log(receipt);
}

main();