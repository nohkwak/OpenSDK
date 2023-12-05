import { parseKlayUnits, formatKlayUnits } from "@klaytn/js-ext-core";

// Equivalent to web3.utils.fromWei
export function fromPeb(number: any, unitName?: string): string {
  return formatKlayUnits(number, unitName);
}

// Equivalent to web3.utils.toWei
export function toPeb(value: string, unitName?: string): string {
  return parseKlayUnits(value, unitName).toString();
}