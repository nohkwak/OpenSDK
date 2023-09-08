import { Transaction as LegacyTransaction, TypedTransaction, TxData, TxOptions } from "web3-eth-accounts";
import { bytesToHex, hexToBytes, toHex, toNumber, numberToHex, toBigInt } from "web3-utils";
import { keccak256 } from 'ethereum-cryptography/keccak.js';
import { RLP } from '@ethereumjs/rlp';
import { Bytes, Numbers, Transaction as TransactionFields, Web3Context } from "web3";
import _ from "lodash";
import { prepareTransactionForSigning } from "web3-eth";
import { Web3RequestManager } from "web3-core";

import { KlaytnTxFactory } from "@klaytn/ethers-ext";
export interface KlaytnTxData extends TxData {
  from?: string,
  chainId?: bigint,
}

// See web3-types/src/eth_types.ts:TransactionBase and its child interfaces
const web3jsAllowedTransactionKeys = [
  "value", "accessList", "common", "gas", "gasPrice", "type", "maxFeePerGas",
	"maxPriorityFeePerGas", "data", "input", "nonce", "chain", "hardfork",
	"chainId", "networkId", "gasLimit", "yParity", "v", "r", "s",
  "from", "to",
];

// web3.js may strip or reject some Klaytn-specific transaction fields.
// To prserve transaction fields around web3js function calls, use saveCustomFields.
export function saveCustomFields(tx: any): any {
  // Save fields that are not allowed in web3.js
  const savedFields: any = {};
  for (const key in tx) {
    if (web3jsAllowedTransactionKeys.indexOf(key) === -1) {
      savedFields[key] = _.get(tx, key);
      _.unset(tx, key);
    }
  }

  // Save txtype that is not supported in web3.js.
  // and disguise as legacy (type 0) transaction
  // because web3js-ext's KlaytnTx is based on web3js's LegacyTransaction.
  if (KlaytnTxFactory.has(tx.type)) {
    savedFields["type"] = tx.type;
    tx.type = 0;
  }

  return savedFields;
}



// Fill required fields from the context
export async function prepareTransaction(
  transaction: TransactionFields,
  context: Web3Context,
  privateKey: Bytes): Promise<TypedTransaction>
{  
  if (KlaytnTxFactory.has(transaction.type)) {
    transaction = _.clone(transaction);

    let savedFields = saveCustomFields(transaction);

    let tx = await prepareTransactionForSigning(transaction, context, privateKey, true, true);

    // if (!(tx.gasLimit)) {
    //   if ( !context ) {
    //     const estimateGasAllowedKeys: string[] = [
    //       "from", "to", "gasLimit", "gasPrice", "value", "input"];
    //     const ttx = encodeTxForRPC(estimateGasAllowedKeys, tx);

    //     const result = await context.  .send("klay_estimateGas", [ttx]);
    //     // For the problem that estimateGas does not exactly match,
    //     // the code for adding some Gas must be processed in the wallet or Dapp.
    //     // e.g.
    //     //   In ethers, no special logic to modify Gas
    //     //   In Metamask, multiply 1.5 to Gas for ensuring that the estimated gas is sufficient
    //     //   https://github.com/MetaMask/metamask-extension/blob/9d38e537fca4a61643743f6bf3409f20189eb8bb/ui/ducks/send/helpers.js#L115
    //     tx.gasLimit = Math.ceil(result * 2.5);
    //   } else {
    //     throw new Error("Klaytn transaction can only be populated from a Klaytn JSON-RPC server");
    //   }
    // }

    let txData = { ...tx, ...savedFields };

    // Below fields might be
    // (1) not specified at the first place,
    // (2) or lost during prepareTransactionForSigning,
    // (3) or not populated by prepareTransactionForSigning.
    txData.from ??= transaction.from;
    txData.chainId ??= tx.common.chainId();

    // if (!(txData.gasLimit)) {
    //   txData.gasLimit = await estimateKlaytnGas(context.requestManager, txData);
    // }

    let txOptions = (tx as any).txOptions;

    console.log( txData )
    console.log( txOptions )

    return new KlaytnTx(txData, txOptions);
  } else {
    return await prepareTransactionForSigning(transaction, context, privateKey, true, true);
  }
}

async function estimateKlaytnGas(
	requestManager: Web3RequestManager,
	transaction: any
) {
  const estimateGasAllowedKeys: string[] = [
    "from", "to", "gasLimit", "gasPrice", "value", "input"];
  const ttx = encodeTxForRPC(estimateGasAllowedKeys, transaction);

	return requestManager.send({
		method: 'klay_estimateGas',
		params: [ttx],
	});
}

// Mimics the LegacyTransaction.
// See web3-eth-accounts/src/tx/legacyTransaction.ts
// and web3-eth-accounts/src/tx/baseTransaction.ts
//
// Functions modified to support sign():
// - getMessageToSign
// - _processSignature
// - serialize
export class KlaytnTx extends LegacyTransaction {

  // BaseTransaction._type is always 0. KlaytnTx._klaytnType is nonzero.
  private readonly _klaytnType: number;
  public readonly from?: string;
  public readonly chainId?: bigint;

  // Parsed KlaytnTx object
  private readonly klaytnTxData: any; // TODO: import KlaytnTx as CoreKlaytnTx from ethers-ext

  // Most fields are class properties, except 'type' is defined as getter in BaseTransaction.
  public override get type(): number {
    return this._klaytnType;
  }

  // This constructor creates a frozen read-only transaction object out of TxData.
  // Any modifications to the fields (e.g. adding the signature) should involve
  // the construction of a new object, rather than modifying the fields directly.
  public constructor(txData: KlaytnTxData, txOptions: TxOptions = {}) {
    // Allow adding new fields inside constructor.
    const savedFreeze = txOptions.freeze;
    txOptions.freeze = false;

    // Construct LegacyTransaction and parse TxData fields
    super(txData, txOptions);

    // parse Klaytn-specific fields
    if (!txData.type) {
      // Should not reach here because KlaytnTx is selected via explicit type field.
      throw new Error("Missing 'type' field");
    }
    this._klaytnType = toNumber(txData.type) as number;
    this.from = txData.from;
    this.chainId = txData.chainId;

    // A readonly CoreKlaytnTx object
    this.klaytnTxData = KlaytnTxFactory.fromObject({
      // Convert to type understood by CoreKlaytnTx.
      // TODO: add more fields for other TxTypes
      type:     toHex(this.type || 0),
      nonce:    toHex(this.nonce),
      gasPrice: toHex(this.gasPrice),
      gasLimit: toHex(this.gasLimit),
      to:       this.to ? bytesToHex(this.to.toString()) : undefined,
      value:    toHex(this.value),
      from:     this.from ? this.from : undefined,
      data:     bytesToHex(this.data),
      input:    bytesToHex(this.data),
      chainId:  this.chainId ? toHex(this.chainId) : undefined,
    });
    if (this.v && this.r && this. s) {
      this.klaytnTxData.addSenderSig([
        Number(this.v),
        numberToHex(this.r),
        numberToHex(this.s),
      ]);
    }

    // Recreate the behavior at the end of LegacyTransaction.constructor().
    this.txOptions.freeze = savedFreeze;
    if (this.txOptions.freeze ?? true) {
      Object.freeze(this);
    }
  }

  public getMessageToSign(hashMessage: false): Uint8Array[];
  public getMessageToSign(hashMessage?: true): Uint8Array;
  public getMessageToSign(hashMessage = true) {
    const rlp = hexToBytes(this.klaytnTxData.sigRLP());
    if (hashMessage) {
      return keccak256(rlp); // Hashed Uint8Array
    } else {
      return RLP.decode(rlp); // RLP-decoded Uint8Array[]
    }
  }

  // Returns a new KlaytnTx by adding the signature
  protected _processSignature(v: bigint, r: Uint8Array, s: Uint8Array): KlaytnTx {
    // Klaytn TxTypes must comply to EIP-155.
    v += this.common.chainId() * BigInt(2) + BigInt(8);

    return new KlaytnTx({
      ...this,
      type: this.type, // The '...this' expression does not include this.type because it's a getter.
      v: v,
      r: toBigInt(bytesToHex(r)),
      s: toBigInt(bytesToHex(s)),
    }, this.txOptions);
  }

  // Returns the raw transaction
  public serialize(): Uint8Array {
    return hexToBytes(this.klaytnTxData.txHashRLP());
  }
}

function encodeTxForRPC(allowedKeys:string[], tx: any): any {
  // TODO: refactoring like below
  // https://github.com/ethers-io/ethers.js/blob/master/packages/providers/src.ts/json-rpc-provider.ts#L701
  // return {
  //   from: hexlify(tx.from),
  //   gas: tx.gasLimit? fromnumber(tx.gasLimit) : null;
  // };

  const ttx: any = {};
  for (const key in tx) {
    if (allowedKeys.indexOf(key) != -1) {
      let value = _.get(tx, key);

      if (value == 0 || value === "0x0000000000000000000000000000000000000000") {
        value = "0x";
      // } else if (typeof(value) == "number" || value instanceof BigNumber) {
      //   // https://github.com/ethers-io/ethers.js/blob/master/packages/providers/src.ts/json-rpc-provider.ts#L701
      //   ttx[key] = hexValue(value);
      } else {
        ttx[key] = value;
      }
    }
  }
  return ttx;
}
