// TODO: Move this to a loop, that will die once max server size is reached, to reduce running this over and over and over again.

import {nFormatter} from "./helpers.js";

/** @param {NS} ns **/
export async function main(ns) {
	let currentServers = ns.getPurchasedServers();
	let currentHosts = [];
	currentServers.map((hostName) => currentHosts.push(ns.getServer(hostName)));

	if(currentServers.length < 25){
			if( ns.purchaseServer("hax-" + ns.getPurchasedServers().length, 128).length > 0){
				ns.toast("Bought a new server with 128GB of ram");
			} else {
				ns.toast(ns.getPurchasedServerCost(128));
			}
	} else {
		let min = currentHosts.sort((a, b) => {
			return a.maxRam - b.maxRam;
		})


		ns.toast("Current server ram spread (" + min[0].maxRam + ", " + min[24].maxRam + ")", 'info')

		let minRam = min[0].maxRam;
		
		let ramSize = minRam;

		while(ns.getPlayer().money > ns.getPurchasedServerCost(ramSize)){
			ramSize = ramSize * 2;
		}

		let targetRam = ramSize/2;

		let hostnameToReplace = min[0].hostname
		if(targetRam > minRam) {
			ns.toast("Upgrading " + hostnameToReplace + " from " + minRam + "GBs to " + targetRam + "GBs of RAM")
			ns.killall(hostnameToReplace)
			if(ns.deleteServer(hostnameToReplace)) {
				ns.purchaseServer(hostnameToReplace, targetRam);
			} else {
				ns.toast("Failed to upgrade server " + hostnameToReplace, 'error');
			}
		}
	}
}