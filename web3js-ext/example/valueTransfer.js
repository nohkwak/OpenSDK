const { Web3, Web3Context } = require("web3");
const { Bytes, Transaction } = require("web3");
const { prepareTransactionForSigning, transactionBuilder, formatTransaction } = require("web3-eth");
const { ETH_DATA_FORMAT } = require("web3-types");
const { format } = require("web3-utils");
const { signTransaction } = require( "web3-eth-accounts");
const { TypedTransaction } = require("web3-eth-accounts");
const { KlaytnTx, saveCustomFields, restoreCustomFields } = require( "../dist");
const { KlaytnTxFactory } = require("../../ethers-ext/dist/src/core");


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

  // let web3 = new KlaytnWeb3(provider);
  // var web3 = new Web3(provider);
  let web3 = new Web3(provider);

  let balance = await web3.eth.getBalance(addr);
  console.log(balance);

  let account = web3.eth.accounts.privateKeyToAccount(priv);
  console.log(account);

  // extend
  // web3.eth.accounts.signTransaction = async (transaction: Transaction, privateKey: Bytes | string) => {
  //   let tx: TypedTransaction;
  //   if (transaction.type !== undefined) {
  //     // @ts-ignore
  //     tx = new KlaytnTx(transaction) as Transaction;
  //   } else {
  //     tx = await prepareTransactionForSigning(transaction, web3);
  //   }
  //   const privateKeyBytes = format({ format: 'bytes' }, privateKey, ETH_DATA_FORMAT);
  //   return signTransaction(tx, privateKeyBytes);
  // }

  web3.eth.accounts.signTransaction = async (transaction, privateKey ) => {
    let tx;
    if ( transaction.type == undefined ) {
      tx = await prepareTransactionForSigning(transaction, web3, privateKey, true, true);
    } else if ( transaction.type !== undefined && KlaytnTxFactory.has(transaction.type) ) {
      
      // const populatedTransaction = await transactionBuilder({ transaction, web3context, privateKey});
      // const formattedTransaction = formatTransaction( populatedTransaction, ETH_DATA_FORMAT);

      const savedFields = saveCustomFields(transaction);
      transaction = await prepareTransactionForSigning(transaction, web3, privateKey, true, true);
      restoreCustomFields(transaction, savedFields);

      // @ts-ignore
      tx = new KlaytnTx(transaction);
    } else {
      throw new Error("Unsupporting type");
    }
    const privateKeyBytes = format({ format: 'bytes' }, privateKey, ETH_DATA_FORMAT);
    return signTransaction(tx, privateKeyBytes);
  }
  // end extend





  let tx = {
    from: account.address,
    to: to,
    // nonce: 319, 
    value: 1e9,
    // gas: 21000,
    // gasPrice: 25e9,
    // type: 8,
  };
  let signResult = await web3.eth.accounts.signTransaction(tx, account.privateKey);
  console.log(signResult);

  let sendResult = await web3.eth.sendSignedTransaction(signResult.rawTransaction);
  console.log(sendResult.transactionHash);

  let receipt = await web3.eth.getTransactionReceipt(sendResult.transactionHash);
  console.log(receipt);
}

/*
async function klaytnSignTransaction(tx: Transaction, priv: string): Promise<SignTransactionResult> {
  if (!tx.type) {
    web3.eth.accounts.signTransaction = function(tx, priv) {
      saveFields()
      tx = prepareTransactionForSigning(tx, web3);
      // typeof tx === web3.Transaction || TxTypeValueTransfer, implements web3.TypedTransaction
      restoreFields()

      return signTransaction(tx, priv);
    };

    return web3.eth.accounts.signTransaction(tx, priv);
  } else {

  }
}
*/

main();