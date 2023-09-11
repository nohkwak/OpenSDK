const { Web3 } = require("web3");
const { Bytes, Transaction } = require("web3");
const { prepareTransactionForSigning, transactionBuilder, formatTransaction } = require("web3-eth");
const { ETH_DATA_FORMAT } = require("web3-types");
const { format } = require("web3-utils");
const { signTransaction } = require( "web3-eth-accounts");
const { TypedTransaction } = require("web3-eth-accounts");
const { KlaytnTx, saveCustomFields, restoreCustomFields } = require( "./klaytnTx");
const { KlaytnTxFactory } = require("../../../ethers-ext/dist/src/core");

export class web3klaytn {

    constructor(provider: any) {
        const web3 = new Web3(provider);

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


        web3.eth.accounts.signTransaction = async (transaction: { type: undefined; }, privateKey: any ) => {
            let tx;
            if ( transaction.type == undefined ) {
                tx = await prepareTransactionForSigning(transaction, web3, privateKey, true, true);
            } else if ( transaction.type !== undefined && KlaytnTxFactory.has(transaction.type) ) {
                
                // const populatedTransaction = await transactionBuilder({ transaction, web3context, privateKey});
                // const formattedTransaction = formatTransaction( populatedTransaction, ETH_DATA_FORMAT);
        
                const savedFields = saveCustomFields(transaction);      
                const pTx = await prepareTransactionForSigning(transaction, web3, privateKey, true, true);
                console.log( pTx );
                restoreCustomFields(transaction, savedFields);
        
                // @ts-ignore
                tx = new KlaytnTx(transaction, pTx); 
            } else {
                throw new Error("Unsupporting type");
            }
            const privateKeyBytes = format({ format: 'bytes' }, privateKey, ETH_DATA_FORMAT);
            return signTransaction(tx, privateKeyBytes);
        }

        web3.eth.sendSignedTransaction =async (signedTx: { type: undefined; }) => {
          if (provider != null) {
            // eth_sendRawTransaction cannot process Klaytn typed transactions.
            // const txhash = await provider.send("klay_sendRawTransaction", [signedTx]);
            const txhash = await provider.sendAsync({
              method: "klay_sendRawTransaction",
              params: ['signedTx'],
              jsonrpc: "2.0",
              id: new Date().getTime()
            });
            console.log( txhash );

            return await web3.eth.getTransaction(txhash);
          } else {
            throw new Error("Klaytn typed transaction can only be broadcasted to a Klaytn JSON-RPC server");
          }
        }

        return web3; 
    }

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