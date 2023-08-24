import { Bytes, Transaction, Web3, utils } from "web3";
var Accounts = require('web3-eth-accounts');

import { keccak256 } from 'ethereum-cryptography/keccak.js';

// eslint-disable-next-line import/extensions
import * as ethereumCryptography from 'ethereum-cryptography/secp256k1.js';
const secp256k1 = ethereumCryptography.secp256k1 ?? ethereumCryptography;

// const { uint8ArrayConcat } = require('../../node_modules/web3-utils/src');

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
    // prepareTransactionForSigning() will not fill gasPrice
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
    // readonly gasPrice: bigint;
  
    v: string = "";
    r: string = "";
    s: string = "";
  
    constructor(txData: any, pTx?:any) {
      this.txData = txData;
      // this.gasPrice = txData.gasPrice;
      
      // @ts-ignore
      if (!txData.chainId){ 
        // @ts-ignore
        this.txData.chainId = pTx.common._chainParams.chainId;
      }

      // @ts-ignore
      if (!txData.gasLimit){ 
        // @ts-ignore
        this.txData.gasLimit = pTx.gasLimit;
      }

      // @ts-ignore
      if (!txData.gasPrice){ 
        // @ts-ignore
        this.txData.gasPrice = pTx.gasPrice;
      }

      // @ts-ignore
      if (!txData.nonce){ 
        // @ts-ignore
        this.txData.nonce = pTx.nonce;
      }

      // @ts-ignore
      this.klaytnTxData = KlaytnTxFactory.fromObject(this.txData);
    }
  
    sign(privateKey: Bytes) {
      if (privateKey.length !== 32) {
        throw new Error("Private key must be 32 bytes in length.");
      }  

      // let klaytnTxData = KlaytnTxFactory.fromObject(this.txData);

      // @ts-ignore
      const message = this.getMessageToSign();
      const msgHash = keccak256(str2ab(message));
      // @ts-ignore
      const { r, s, v } = this._ecsign(msgHash, privateKey);
      console.log(v,r,s);

      // const tx = this._processSignature(v, r, s);
      
      const sig = [ 
          utils.toHex(v),
          "0x"+Buffer.from(r).toString('hex'),
          "0x"+Buffer.from(s).toString('hex'),
      ];

      console.log('siggggg', sig);

      // @ts-ignore
      this.klaytnTxData.addSenderSig(sig);

      // this.v = "0xf4f6";
      // this.r = "0x24883ecddbe1f93343f2b25815a9da97a83af5e7ae4964ae67b2f319efb64f8d";
      // this.s = "0x4a55170208ae0cda7e796f895db96fc3ec6d7416f6692b23f13c9c632b0a09d3";

      this.v = utils.toHex(v);
      this.r = "0x"+Buffer.from(r).toString('hex');
      this.s = "0x"+Buffer.from(s).toString('hex');

      // return {
      //   v: v,
      //   r: r,
      //   s: s,
      //   messageHash: msgHash,
      //   rawTransaction: klaytnTxData.txHashRLP(),
      //   transactionHash: keccak256(str2ab(klaytnTxData.txHashRLP())),
      // }

      return this;
    }
  
    getMessageToSign(): Bytes {
      // @ts-ignore		
			return Buffer.from(this.klaytnTxData.sigRLP(), 'hex');
    }

    private _ecsign(msgHash: Uint8Array, privateKey: Uint8Array, chainId?: bigint): /* ECDSASignature */ any {
      const signature = secp256k1.sign(msgHash, privateKey);
      const signatureBytes = signature.toCompactRawBytes();
  
      const r = signatureBytes.subarray(0, 32);
      const s = signatureBytes.subarray(32, 64);
  
      const v =
        chainId === undefined
          ? BigInt(signature.recovery! + 27)
          : BigInt(signature.recovery! + 35) + BigInt(chainId) * BigInt(2);
  
      return { r, s, v };
    }

    protected _processSignature(_v: bigint, r: Uint8Array, s: Uint8Array) {
      let v = _v;
      // if (this.supports(Capability.EIP155ReplayProtection)) {
      //   v += this.common.chainId() * BigInt(2) + BigInt(8);
      // }
  
      // if (this.txData.chainId) { // EIP-155
      //   sig.v = sig.recoveryParam + tx.chainId * 2 + 35;
      // }
      // @ts-ignore
      this.klaytnTxData.addSenderSig([
        utils.toHex(v),
        "0x"+Buffer.from(r).toString('hex'),
        "0x"+Buffer.from(s).toString('hex'),
      ]);
  
      let rawTransactionData; 
      // @ts-ignore
      if ( this.klaytnTxData.hasFeePayer()) {
        // @ts-ignore
        rawTransactionData = this.klaytnTxData.senderTxHashRLP();
      } else {
        // @ts-ignore
        rawTransactionData = this.klaytnTxData.txHashRLP();
      }
            
      // @ts-ignore
      const opts = { ...this.txOptions, common: this.common };
  
      // // @ts-ignore
      // return KlaytnTx.fromTxData(
      //   {
      //     // @ts-ignore
      //     nonce: this.nonce,
      //     // @ts-ignore
      //     gasPrice: this.gasPrice,
      //     // @ts-ignore
      //     gasLimit: this.gasLimit,
      //     // @ts-ignore
      //     to: this.to,
      //     // @ts-ignore
      //     value: this.value,
      //     // @ts-ignore
      //     data: this.data,
      //     v,
      //     r: Accounts.uint8ArrayToBigInt(r),
      //     s: Accounts.uint8ArrayToBigInt(s),
      //   },
      //   opts,
        
      // );

      return {
        rawTransaction: rawTransactionData
      }; 
    }  

    validate(what: boolean): string[] {
      return [];
    }
  
    serialize(): Bytes {
      // return "0xf86e078505d21dba008252089470997970c51812dc3a010c7d01b50e0d17dc79c8880de0b6b3a76400008082f4f5a03a22142a0cae2bc220ddf9b2dd7571907ab308ae3b1ac213d0c2b73883b63640a0240ee0c611a869208f89a4fc8423f51772e009f6b473d9445e292fc2cabd6252"

      // @ts-ignore
      return this.klaytnTxData.txHashRLP();
    }
  
}


// https://blog.naver.com/PostView.naver?blogId=loverman85&logNo=221076955716
function str2ab(str: any) {
  var buf = new ArrayBuffer(str.length*2); // 2 bytes for each char
  var bufView = new Uint8Array(buf);
  for (var i=0, strLen=str.length; i < strLen; i++) {
    bufView[i] = str.charCodeAt(i);
  }
  return bufView;
}