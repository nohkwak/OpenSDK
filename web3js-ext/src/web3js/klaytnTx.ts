import { Bytes, Transaction, Web3 } from "web3";
const { KlaytnTxFactory } = require("../../../ethers-ext/dist/src/core");
const _ = require( "lodash" );

// const priv = "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80";
const priv="0xb3cf575dea0081563fe5482de2fe4425e025502b1f4ae7e02b2540ac0a5beda1";

// @ethersproject/abstract-signer/src.ts/index.ts:allowedTransactionKeys
const ethersAllowedTransactionKeys: Array<string> = [
    "accessList", "ccipReadEnabled", "chainId", "customData", "data", "from", "gasLimit", "gasPrice", "maxFeePerGas", "maxPriorityFeePerGas", "nonce", "to", "type", "value",
];
  
// ethers.js may strip or reject some Klaytn-specific transaction fields.
// To prserve transaction fields around super method calls, use
// saveCustomFields and restoreCustomFields.
export function saveCustomFields(tx: any): any {
    // Save fields that are not allowed in ethers.js
    const savedFields: any = {};
    for (const key in tx) {
      if (ethersAllowedTransactionKeys.indexOf(key) === -1) {
        savedFields[key] = _.get(tx, key);
        _.unset(tx, key);
      }
    }
  
    // Save txtype that is not supported in ethers.js.
    // and disguise as legacy (type 0) transaction.
    //
    // Why disguise as legacy type?
    // Signer.populateTransaction() will not fill gasPrice
    // unless tx type is explicitly Legacy (type=0) or EIP-2930 (type=1).
    // Klaytn tx types, however, always uses gasPrice.
    if (_.isNumber(tx.type) && KlaytnTxFactory.has(tx.type)) {
      savedFields["type"] = tx.type;
      tx.type = 0;
    }
  
    // 'from' may not be corresponded to the public key of the private key in Klaytn account
    // So 'from' field also has to be saved
    savedFields["from"] = tx.from;
    _.unset(tx, "from");
  
    return savedFields;
}
  
export function restoreCustomFields(tx: any, savedFields: any) {
    for (const key in savedFields) {
      _.set(tx, key, savedFields[key]);
    }
}


export class KlaytnTx implements Transaction {
    txData: any;
    readonly gasPrice: bigint;
  
    v: string = "";
    r: string = "";
    s: string = "";
  
    constructor(txData: any) {
      this.txData = txData;
      this.gasPrice = txData.gasPrice;
      // @ts-ignore
      this.ktx = KlaytnTxFactory.fromObject(this.txData);
    }
  
    sign(priv: Bytes) {
      // @ts-ignore
      const sigHash = this.ktx.sigRLP();
      // @ts-ignore
      const signature = Web3.eth.accounts.sign(sigHash, priv);

      console.log('signature: ', signature);
      console.log('priv: ', priv);

      this.v = "0xf4f6";
      this.r = "0x24883ecddbe1f93343f2b25815a9da97a83af5e7ae4964ae67b2f319efb64f8d";
      this.s = "0x4a55170208ae0cda7e796f895db96fc3ec6d7416f6692b23f13c9c632b0a09d3";
      return this;
      // return signature;
    }
  
    validate(what: boolean): string[] {
      return [];
    }
  
    serialize(): Bytes {
      // this.ktx.txHashRLP
      return "0xf86e078505d21dba008252089470997970c51812dc3a010c7d01b50e0d17dc79c8880de0b6b3a76400008082f4f5a03a22142a0cae2bc220ddf9b2dd7571907ab308ae3b1ac213d0c2b73883b63640a0240ee0c611a869208f89a4fc8423f51772e009f6b473d9445e292fc2cabd6252"
    }
  
    getMessageToSign(): Bytes {
      // this.ktx.sigRLP
      return "0x2123412323";
    }
}