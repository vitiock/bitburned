/**
 *
 * @param {NS} ns
 */
export async function main(ns) {
  ns.tprint("Spending hashes");
  if(ns.hacknet.numNodes() === 0){
    return;
  }

  let productionRate = 0;
  for(let i = 0; i < ns.hacknet.numNodes(); i++) {
    productionRate += ns.hacknet.getNodeStats(i).production;
  }

  let currentHashes = ns.hacknet.numHashes()
  while(currentHashes >= ns.hacknet.hashCapacity() * .9 || (currentHashes >= 4 && ns.getPlayer().money < 1e9)){
    ns.hacknet.spendHashes('Sell for Money')
    currentHashes = ns.hacknet.numHashes();
  }

  /*
  if(ns.hacknet.spendHashes('Improve Studying')){
    ns.toast("Improved studying");
  }
  */
  /*
  if(ns.hacknet.spendHashes('Sell for Corporation Funds')){
    ns.toast("Got corporation funds");
  }

  if(ns.hacknet.spendHashes('Exchange for Corporation Research')){
    ns.toast("Got corporation research");
  }
  */

  /*
  if(ns.hacknet.spendHashes('Reduce Minimum Security', 'megacorp')){
    ns.toast("Reducing ecorp security");
  }

  if(ns.hacknet.spendHashes('Increase Maximum Money', 'megacorp')){
    ns.toast("Increasing ecorp funds");
  }
*/
  if(ns.hacknet.spendHashes('Generate Coding Contract')){
    ns.toast("Generated a coding contract", 'info', null);
  }

}