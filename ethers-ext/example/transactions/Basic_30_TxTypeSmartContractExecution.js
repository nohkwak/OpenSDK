// TxTypeSmartContractExecution
// https://docs.klaytn.foundation/content/klaytn/design/transactions/basic#txtypesmartcontractexecution
//
//   to : deployed contract address
//   value: Must be 0, if not payable
//   input: Refer ethers.utils.interface.encodeFunctionData
//          https://docs.ethers.org/v5/api/utils/abi/interface/#Interface--encoding
//
//          // 1) by using contract object
//          const CONTRACT_ADDRESS = '0xD7fA6634bDDe0B2A9d491388e2fdeD0fa25D2067';
//          const CONTRACT_ABI = ["function setNumber(uint256 newNumber) public", "function increment() public"];
//          const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);
//          const param = contract.interface.encodeFunctionData("setNumber", ["0x123"]);
//
//          // 2) by using utils.interface
//          const CONTRACT_ABI = ["function setNumber(uint256 newNumber) public", "function increment() public"];
//          const iface = new ethers.utils.Interface( CONTRACT_ABI );
//          const param = iface.encodeFunctionData("setNumber", [ "0x123" ])


const { Wallet, TxType } = require("@klaytn/ethers-ext");
const ethers = require("ethers");

const senderAddr = "0xa2a8854b1802d8cd5de631e690817c253d6a9153";
const senderPriv = "0x0e4ca6d38096ad99324de0dde108587e5d7c600165ae4cd6c2462c597458c2b8";
const contractAddr = "0xD7fA6634bDDe0B2A9d491388e2fdeD0fa25D2067";

async function main() {
  const provider = new ethers.providers.JsonRpcProvider("https://public-en-baobab.klaytn.net");
  const wallet = new Wallet(senderPriv, provider);

  const CONTRACT_ADDRESS = contractAddr;
  const CONTRACT_ABI = ["function setNumber(uint256 newNumber) public", "function increment() public"];
  const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);
  const param = contract.interface.encodeFunctionData("setNumber", ["0x123"]);

  let tx = {
    type: TxType.SmartContractExecution,
    from: senderAddr,
    to: contractAddr,
    value: 0,
    input: param,
    gasLimit: 100000,
  };

  const sentTx = await wallet.sendTransaction(tx);
  console.log("sentTx", sentTx);

  const rc = await sentTx.wait();
  console.log("receipt", rc);
}

main();
