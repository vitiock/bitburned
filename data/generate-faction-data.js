/**
 *
 * @param {NS} ns
 */
import {generateFactionData} from "./helpers";

export async function main(ns) {
  await generateFactionData(ns, 'home');
}