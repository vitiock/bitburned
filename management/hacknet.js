//TODO: Find highest return for money

import {loadCycleConfig, loadCycleState, nFormatter} from "/helpers";

function getUpperSpend(ns) {
	let upperSpend = ns.getPlayer().money*.9

	return upperSpend
}

/** @param {NS} ns **/
export async function main(ns) {
	return;
	let cycleState = loadCycleState(ns);
	if(cycleState.cycleDuration > 90 * 60 * 1000){
		return;
	}


	while(ns.hacknet.maxNumNodes() > ns.hacknet.numNodes() && ns.hacknet.getPurchaseNodeCost() < getUpperSpend(ns)) {
		ns.hacknet.purchaseNode();
		ns.toast("Purchased Hacknet Node");
		await ns.sleep(1)
	}

	if(ns.hacknet.numNodes() === 0) {
		return;
	}


	let purchased = true
	while(purchased) {
		purchased = false;
		let bestValue
		if (ns.hacknet.numNodes() === 0) {
			bestValue = 1;
		} else {
			let nodeStats = ns.hacknet.getNodeStats(0);
			let totalProduction = ns.formulas.hacknetServers.hashGainRate(nodeStats.level, 0, nodeStats.ram, nodeStats.cores);
			bestValue = (ns.hacknet.getPurchaseNodeCost() / totalProduction) * 2;
		}
		let node = 0;
		let type = 'purchase node';

		for (let i = 0; i < ns.hacknet.numNodes(); i++) {
			let nodeStats = ns.hacknet.getNodeStats(i);
			let totalProduction = ns.formulas.hacknetServers.hashGainRate(nodeStats.level, 0, nodeStats.ram, nodeStats.cores);
			let levelProduction = ns.formulas.hacknetServers.hashGainRate(nodeStats.level + 1, 0, nodeStats.ram, nodeStats.cores);
			let levelValue = ns.hacknet.getLevelUpgradeCost(i, 1) / (levelProduction - totalProduction);
			if (levelValue < bestValue) {
				bestValue = levelValue;
				node = i;
				type = 'level'
			}

			let ramProduction = ns.formulas.hacknetServers.hashGainRate(nodeStats.level, 0, nodeStats.ram * 2, nodeStats.cores);
			let ramValue = ns.hacknet.getRamUpgradeCost(i, 1) / (ramProduction - totalProduction);
			if (ramValue < bestValue) {
				bestValue = ramValue;
				node = i;
				type = 'ram'
			}

			let coresProduction = ns.formulas.hacknetServers.hashGainRate(nodeStats.level, 0, nodeStats.ram, nodeStats.cores + 1);
			let coresValue = ns.hacknet.getCoreUpgradeCost(i, 1) / (coresProduction - totalProduction);
			if (coresValue < bestValue) {
				bestValue = coresValue;
				node = i;
				type = 'core'
			}
			await ns.sleep(1);
		}

		if (type === 'core') {
			if (ns.hacknet.getCoreUpgradeCost(node, 1) < getUpperSpend(ns)) {
				ns.hacknet.upgradeCore(node, 1);
				ns.toast("Upgrading core on hacknet node " + node);
				purchased = true
			}
		} else if (type === 'ram') {
			if (ns.hacknet.getRamUpgradeCost(node, 1) < getUpperSpend(ns)) {
				ns.hacknet.upgradeRam(node, 1);
				ns.toast("Upgrading ram on hacknet node " + node);
				purchased = true
			}
		} else if (type === 'level') {
			if (ns.hacknet.getLevelUpgradeCost(node, 1) < getUpperSpend(ns)) {
				ns.hacknet.upgradeLevel(node, 1);
				ns.toast("Upgrading level on hacknet node " + node);
				purchased = true
			}
		}
		await ns.sleep(1);
	}


	for(let i = 0; i < ns.hacknet.numNodes(); i++){
		if(ns.hacknet.getCacheUpgradeCost(i, 1) < ns.getPlayer().money/100){
			ns.hacknet.upgradeCache(i, 1);
		}
	}

}
