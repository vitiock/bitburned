/** @param {NS} ns **/
export async function main(ns) {
	let currentServers = ns.getPurchasedServers();
	let currentHosts = [];
	currentServers.map((hostName) => currentHosts.push(ns.getServer(hostName)));


	if(currentServers.length < 25){
		let ramSize = 8;
		while(ns.getPlayer().money > ns.getPurchasedServerCost(ramSize)){
			ramSize = ramSize * 2;
		}
		if( ramSize > 8) {
			ns.purchaseServer("hax-" + ns.getPurchasedServers().length, ramSize/2)
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