/** @param {NS} ns **/
export async function main(ns) {
	while(true) {
		let targets = ['home']
		let scanned = []
		let hostList = []

		while (targets.length > 0) {		
			let name = targets.pop();
			scanned.push(name);

			let server = ns.getServer(name);		
			if (server.hasAdminRights) {
				hostList.push(server);
				let hosts = ns.scan(name);
				for(let i = 0; i < hosts.length; i++){
					if(!scanned.includes(hosts[i])) {
						targets.push(hosts[i]);
					}
				}
			}
		};

		targets = ns.getPurchasedServers()
		while(targets.length > 0) {
			let name = targets.pop();
		}

		let sorted = hostList.sort((a, b) => {return a.maxRam - b.maxRam})

		ns.clearLog()
		ns.print('Hostname                |       Ram |  Free Ram |')
		sorted.map((server, index) => {
			let valuePercent = server.moneyAvailable / server.moneyMax;
			ns.print( fixWidthString(server.hostname, 24) + "| " 
			+ fixWidthStringRight(server.maxRam.toString(), 9) + " | "
				+ fixWidthStringRight((server.maxRam-server.ramUsed).toString(), 9) + " | "
			)})
		await ns.sleep(100);
	}
}

/** @param {string} value **/
function fixWidthString(value, desiredLength) {
	let newValue = value.substr(0, desiredLength)
	newValue = newValue.padEnd(desiredLength, ' ')
	return newValue
}

/** @param {string} value **/
function fixWidthStringRight(value, desiredLength) {
	let newValue = value.substr(0, desiredLength)
	newValue = newValue.padStart(desiredLength, ' ')
	return newValue
}

function percentToBar(value) {
	let bar = ''
	while(value >= 10) {
		value = value - 10;
		bar = bar +'▓'
	}
	if( value > 5) {
		bar = bar + '▒'
		return bar.padEnd(10, '░');
	}
	if (value > 0) {
		bar = bar+ '▒'
		return bar.padEnd(10, '░');		
	}
	return bar.padEnd(10, '░');
}