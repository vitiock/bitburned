// TODO: Move this to a loop, that will die once max server size is reached, to reduce running this over and over and over again.

import {formatMoney, loadCycleState} from "/helpers";

/** @param {NS} ns **/
export async function main(ns) {
	let cycleState = loadCycleState(ns);
	if(cycleState.currentPhase !== 'GROW' && cycleState.currentPhase !== 'REP'){
		return;
	}
	let currentServers = ns.getPurchasedServers();
	let currentHosts = [];
	currentServers.map((hostName) => currentHosts.push(ns.getServer(hostName)));

	let minRam = 32;
	if(currentHosts.length >= 2){
		currentHosts = currentHosts.sort( (a, b) => b.maxRam - a.maxRam)
		minRam = currentHosts[1].maxRam*2;
	}

	if(currentServers.length < 25){
		ns.print("Server cost: " + ns.getPurchasedServerCost(minRam))
			if( ns.purchaseServer("hax-" + ns.getPurchasedServers().length, minRam).length > 0){
				ns.toast("Bought a new server with " + minRam + "GB of ram");
			}
	} else {
		let min = currentHosts.sort((a, b) => {
			return a.maxRam - b.maxRam;
		})

		let minRam = min[0].maxRam;
		
		let ramSize = minRam;
		let targetSize = min[23].maxRam * 2;
		//ns.tprint("Target ram size = " + min[23].maxRam * 2 + " costing " + formatMoney(Math.ceil(ns.getPurchasedServerCost(min[23].maxRam*2)), 2))

		while(ns.getPlayer().money > ns.getPurchasedServerCost(ramSize)){
			ramSize = ramSize * 2;
		}

		let targetRam = ramSize/2;
		if(targetRam < targetSize){
			return;
		}

		let hostnameToReplace = min[0].hostname
		if(targetRam > minRam) {
			ns.toast("Upgrading " + hostnameToReplace + " from " + minRam + "GBs to " + targetRam + "GBs of RAM for " + formatMoney(Math.floor(ns.getPurchasedServerCost(targetRam)), 1), 'info', 10000)
			ns.killall(hostnameToReplace)
			if(ns.deleteServer(hostnameToReplace)) {
				ns.purchaseServer(hostnameToReplace, targetRam);
			} else {
				ns.toast("Failed to upgrade server " + hostnameToReplace, 'error');
			}
		}
	}
}