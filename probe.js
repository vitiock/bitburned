import { getOwnedServers, nFormatter } from './helpers.js'

/** @param {NS} ns **/
export async function main(ns) {
	ns.disableLog('sleep');	

	while(true) {
		let hostList = getOwnedServers(ns);
		hostList = hostList.filter( server => server.moneyMax > 0 );

		let countData = JSON.parse(ns.read('threadCounts.txt'));
			
		let sorted = hostList.sort((a, b) => {return b.moneyMax - a.moneyMax})	
		ns.clearLog()
		ns.print('Hostname                | Max Money |          Growth | Weakness | Required Growths |   WTC |   GTC |    HTC | Value')
		sorted.map((server, index) => {			
			let weakenCount = '0';
			if(countData[server.hostname]){
				weakenCount = nFormatter(countData[server.hostname].weaken, 0)
			}
			weakenCount = fixWidthStringRight(weakenCount, 5)

			let growCount = '0';
			if(countData[server.hostname]){
				growCount = nFormatter(countData[server.hostname].grow, 0)
			}
			growCount = fixWidthStringRight(growCount, 5)

			let hackCount = '0';
			if(countData[server.hostname]){
				hackCount = nFormatter(countData[server.hostname].hack, 0)
			}
			hackCount = fixWidthStringRight(hackCount, 5)

			let valuePercent = server.moneyAvailable / server.moneyMax;
			ns.print( fixWidthString(server.hostname, 24) + "| " 
			+ fixWidthStringRight(nFormatter(server.moneyMax, 1), 9) + " | " 
			+ percentToBar(valuePercent*100) + ' ' + fixWidthStringRight((Math.floor(valuePercent*100)).toString(), 3) + '% | '
			+ fixWidthStringRight((server.hackDifficulty - server.minDifficulty).toString().substr(0, 4), 8) + ' | '			
			+ fixWidthStringRight(nFormatter(Math.ceil(ns.growthAnalyze(server.hostname, server.moneyMax/server.moneyAvailable)), 1), 16) + ' | '
			+ weakenCount + ' | '
			+ growCount + ' | '
			+ hackCount + ' | '
			+ fixWidthStringRight(nFormatter(Math.floor(ns.hackAnalyze(server.hostname) * server.moneyAvailable), 0), 6)
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