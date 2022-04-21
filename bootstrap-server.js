// TODO: Move this to a loop, that will die once max server size is reached, to reduce running this over and over and over again.

import {formatMoney, nFormatter} from "./helpers.js";

/** @param {NS} ns **/
export async function main(ns) {
  if( ns.purchaseServer("hax-" + ns.getPurchasedServers().length, 2048).length > 0) {
    ns.toast("Purchased new server");
  } else {
    ns.toast("Server costs: " + formatMoney(ns.getPurchasedServerCost(2048), 3));
  }
}