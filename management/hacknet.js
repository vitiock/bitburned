//TODO: Find highest return for money

function getUpperSpend(ns) {
	let upperSpend = ns.getPlayer().money/10

	if(ns.getPlayer().money < 25000) {
		upperSpend = ns.getPlayer().money
	}

	return upperSpend
}

/** @param {NS} ns **/
export async function main(ns) {
	return;	

	while(ns.hacknet.maxNumNodes() > ns.hacknet.numNodes() && ns.hacknet.getPurchaseNodeCost() < getUpperSpend(ns)) {
		ns.hacknet.purchaseNode();		
		ns.toast("Purchased Hacknet Node");
	}


	let purchased = true;
	while(purchased) {
		purchased = false;
		for(let i = 0; i < ns.hacknet.numNodes(); i++){
			if(ns.hacknet.getLevelUpgradeCost(i) < getUpperSpend(ns)) {
				ns.hacknet.upgradeLevel(i);
				purchased = true;
				ns.toast("Purchased hacknet Level")
//				return;
			}		
		}
		for(let i = 0; i < ns.hacknet.numNodes(); i++){
			if(ns.hacknet.getRamUpgradeCost(i) < getUpperSpend(ns)) {
				ns.hacknet.upgradeRam(i);
				purchased = true;
				ns.toast("Purchased hacknet Ram")
//				return;
			}		
		}
		for(let i = 0; i < ns.hacknet.numNodes(); i++){
			if(ns.hacknet.getCoreUpgradeCost(i) < getUpperSpend(ns)) {
				ns.hacknet.upgradeCore(i);
				purchased = true;
				ns.toast("Purchased hacknet Core")
//				return;
			}		
		}
	}
}