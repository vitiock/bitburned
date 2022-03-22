// TODO: Iterate through servers to use one with most ram first
// TODO: Cleanup files
// TODO: Move architecture to finding work, then finding who can do that work, hacks should have single hosts though

let config;

/** @param {NS} ns **/
async function syncConfig(ns) {
	await ns.write('config.txt', JSON.stringify(config), "w")
}

async function writeThreadCounts(ns, counts) {
	await ns.write('threadCounts.txt', JSON.stringify(counts), "w")
}

/**
 * @param {Server} server
 * */
function canExploit(server) {
	return server.minDifficulty == server.hackDifficulty && server.moneyAvailable == server.moneyMax
}

/**
 * @param {Server} server
 * @param {ActiveThreads} activeThreads
 * */
function isBeingExploited(server, activeThreads) {
	if (!activeThreads[server.hostname] || activeThreads[server.hostname].hack == 0) {
		return true;
	}
	return false;
}

async function findNextTarget(ns, activeThreads) {
	let targets = ['home']
	let scanned = []

	let hostList = []

	while (targets.length > 0) {
		let name = targets.pop();
		scanned.push(name);

		let server = ns.getServer(name);
		hostList.push(server);
		if (name.startsWith('hax-')) {
		} else if (server.hasAdminRights && server.hackDifficulty != 0 && server.requiredHackingSkill <= ns.getPlayer().hacking) {
			let hosts = ns.scan(name);
			for (let i = 0; i < hosts.length; i++) {
				if (!scanned.includes(hosts[i])) {
					targets.push(hosts[i]);
				}
			}
		}
	};

	let adminServers = hostList.filter(server => server.hasAdminRights && !server.hostname.startsWith('hax-') && server.hostname != 'home')
	let exploitable = adminServers.filter(server => {
		if (canExploit(server)) {
			let isExploit = isBeingExploited(server, activeThreads);
			if( isExploit ) {
				ns.tprint(server.hostname + " is not being exploited");
				return true;
			}
		}

		return false
	})

	exploitable = exploitable.sort((a, b) => a.moneyAvailable - b.moneyAvailable)
	if (exploitable.length > 0) {
		return exploitable[0].hostname
	}

	let growable = adminServers.filter(server => {
		if (server.hackDifficulty == server.minDifficulty) {
			if (server.moneyAvailable < server.moneyMax) {
				let requiredGrowths = ns.growthAnalyze(server.hostname, server.moneyMax/server.moneyAvailable)
				if(activeThreads[server.hostname] && activeThreads[server.hostname].grow >= requiredGrowths) {
					return false;
				}
				return true;
			}
		}
		return false;
	})
	growable = growable.sort( (a, b) => a.moneyMax - b.moneyMax);
	if(growable.length > 0 ) {
		return growable[0].hostname;
	}

	let weakenable = adminServers.filter( server => {
		if( server.hackDifficulty > server.minDifficulty && !server.hostname.startsWith('hax')) {
			let requiredWeakens = (server.hackDifficulty-server.minDifficulty)/.05;
			if(!activeThreads[server.hostname] || activeThreads[server.hostname].weaken < requiredWeakens) {
				return true;
			}
			return false;
		}
		return false;
	})
	weakenable = weakenable.sort( (a, b) => a.moneyMax - b.moneyMax);
	if(weakenable.length > 0 ) {
		return weakenable[0].hostname;
	}
}

/** @param {NS} ns **/
export async function main(ns) {
	if (ns.fileExists('config.txt')) {
		ns.tprint("Loading config from file");
		let configData = await ns.read('config.txt');
		config = JSON.parse(configData);
		//ns.tprint(configData);
	} else {
		config = {
			target: 'n00dles',
			processes: [],
			reserve: {
				home: 32
			}
		}
		await syncConfig(ns);
	}

	config.reserve = {};
	config.reserve.home = 8;

	ns.tprint("Generating active thread map");
	let activeThreads = {}
	for (let i = 0; i < config.processes.length; i++) {
		let process = config.processes[i]
		if (process.growPid == 0 || !ns.isRunning(process.growPid)) {
			config.processes[i].growPid = 0
			config.processes[i].growThreads = 0
		}
		if (process.weakenPid == 0 || !ns.isRunning(process.weakenPid)) {
			config.processes[i].weakenPid = 0
			config.processes[i].weakenThreads = 0
		}
		if (process.hackPid == 0 || !ns.isRunning(process.hackPid)) {
			config.processes[i].hackPid = 0
			config.processes[i].hackThreads = 0
		}
		if (!activeThreads[process.target]) {
			activeThreads[process.target] = {
				grow: 0,
				weaken: 0,
				hack: 0
			}
		}

		activeThreads[process.target].grow += process.growThreads
		activeThreads[process.target].weaken += process.weakenThreads
		activeThreads[process.target].hack += process.hackThreads
	}

	config.processes = config.processes.filter(value => { return value.growPid != 0 || value.weakenPid != 0 || value.hackPid != 0 })

	//ns.tprint("Next Target: " + await findNextTarget(ns, activeThreads));

	//ns.tprint(JSON.stringify(activeThreads))


	ns.tprint("Target: " + config.target);

	//await findTarget(ns);

	let targets = ['home']
	let scanned = []


	if (await findNextTarget(ns, activeThreads)) {
		config.target = await findNextTarget(ns, activeThreads);
	}

	let targetServer = ns.getServer(config.target);

	while (targets.length > 0) {
		if (await findNextTarget(ns, activeThreads)) {
			config.target = await findNextTarget(ns, activeThreads);
			targetServer = ns.getServer(config.target);
			if(config.target == undefined) {
				ns.tprint("Fail");
			}
		}

		let name = targets.pop();
		scanned.push(name);

		let hosts = ns.scan(name);
		for (let i = 0; i < hosts.length; i++) {
			if (!scanned.includes(hosts[i])) {
				targets.push(hosts[i]);
			}
		}

		let server = ns.getServer(name);

		if (!server.hasAdminRights || targetServer == null) {
			continue;
		}


		let reservedRam = 0
		if (config.reserve[name] > 0) {
			reservedRam = config.reserve[name]
		}

		let availRam = server.maxRam - server.ramUsed - reservedRam

		if (!activeThreads[targetServer.hostname]) {
			activeThreads[targetServer.hostname] = {
				weaken: 0,
				grow: 0,
				hack: 0,
			}
		}


		if (targetServer.minDifficulty != targetServer.hackDifficulty) {
			let currentWeakens = activeThreads[targetServer.hostname].weaken;
			let requiredWeakens = Math.ceil((targetServer.hackDifficulty - targetServer.minDifficulty) / .05)

			if (currentWeakens >= Math.ceil(requiredWeakens)) {
				continue;
			}

			ns.tprint("We need more weakens!");

			let numThreads = Math.floor(availRam / ns.getScriptRam('./remote/doWeaken.js'))
			if (numThreads <= 0) {
				continue;
			}
			await ns.scp('/remote/doWeaken.js', name);
			let weakenPid = ns.exec('/remote/doWeaken.js', name, numThreads, config.target)
			let timeToWeaken = Math.floor(ns.getWeakenTime(config.target));
			let running = {
				target: config.target,
				host: name,
				growPid: 0,
				growThreads: 0,
				timeToGrow: 0,
				weakenPid: weakenPid,
				weakenThreads: numThreads,
				timeToWeaken: timeToWeaken,
				hackPid: 0,
				hackThreads: 0,
				timeToHack: 0
			}
			config.processes.push(running);
			activeThreads[targetServer.hostname].weaken += numThreads
		} else if (targetServer.moneyAvailable < targetServer.moneyMax - 1) {
			// We want growth to be neutral
			let maxGrowThreads = Math.floor(availRam / ns.getScriptRam('./remote/doGrow.js'))
			if (maxGrowThreads > 0) {
				let desiredGrowth = targetServer.moneyMax / targetServer.moneyAvailable
				if (desiredGrowth > 0) {
					let requiredThreads = ns.growthAnalyze(targetServer.hostname, desiredGrowth)

					requiredThreads = requiredThreads - activeThreads[targetServer.hostname].grow
					if (requiredThreads <= 0) {
						continue;
					}
					let useGrowThreads = Math.ceil(Math.min(requiredThreads, maxGrowThreads))
					let availMem = availRam - (ns.getScriptRam('./remote/doGrow.js') * useGrowThreads)
					let useWeakenThreads = Math.min(Math.floor(availMem / Math.ceil(ns.getScriptRam('./remote/doWeaken.js'))), Math.ceil(ns.growthAnalyzeSecurity(useGrowThreads) / .05))

					while (ns.weakenAnalyze(useWeakenThreads) < ns.growthAnalyzeSecurity(useGrowThreads)) {
						useGrowThreads = useGrowThreads - 1;
						availMem = availRam - (Math.ceil(ns.getScriptRam('./remote/doGrow.js')) * useGrowThreads)
						ns.tprint("Avail ram for weaken: " + availMem + " and grow threads " + useGrowThreads)
						useWeakenThreads = Math.floor(availMem / Math.ceil(ns.getScriptRam('./remote/doWeaken.js')))
					}

					if (useGrowThreads <= 0) {
						continue;
					}

					ns.tprint("Should use " + useGrowThreads + " grow threads and " + useWeakenThreads + " weaken threads")

					await ns.scp('/remote/doGrow.js', name);
					let timeToGrow = ns.getGrowTime(config.target);
					let timeToWeaken = ns.getWeakenTime(config.target);
					let growPid = 0;
					let weakenPid = 0;

					if (timeToWeaken < timeToGrow) {
						ns.tprint("We should wait " + (timeToGrow - timeToWeaken + 10) + " milliseconds first")
					} else {
						ns.tprint("We should wait " + (timeToWeaken - timeToGrow - 10) + " milliseconds first before growing")
						let timeToWait = Math.floor(timeToWeaken - timeToGrow - 10)
						growPid = ns.exec('/remote/doGrow.js', name, useGrowThreads+1, config.target, timeToWait, "From growth section", 0, Date.now());
						if(growPid == 0){
							if(ns.isRunning('./remote/doGrow.js', name)) {
								ns.toast("Failed due to script already running");
							}
							ns.toast("Failed to create grow: " + useGrowThreads + " on " + name + " for " + config.target + " with sleep of " + Math.floor(timeToWeaken - timeToGrow - 10), 'error', null);
							continue;
						} else {
							await ns.scp('/remote/doWeaken.js', name)
							weakenPid = ns.exec('/remote/doWeaken.js', name, useWeakenThreads, config.target, 0, growPid);
							if (weakenPid == 0) {
								ns.toast('Failed to create weaken for grow ' + useWeakenThreads + ' on ' + name + ' with avail mem ' + (ns.getServer(name).maxRam - ns.getServer(name).ramUsed), 'error', null);
							} else {
								ns.toast('Created weaken for growth');
							}
						}
					}
					let running = {
						target: config.target,
						host: name,
						growPid: growPid,
						growThreads: useGrowThreads,
						timeToGrow: timeToGrow,
						weakenPid: weakenPid,
						weakenThreads: useWeakenThreads,
						timeToWeaken: timeToWeaken,
						hackPid: 0,
						hackThreads: 0,
						timeToHack: 0
					}
					config.processes.push(running);
					ns.tprint(JSON.stringify(running));
					activeThreads[targetServer.hostname].grow += useGrowThreads
					activeThreads[targetServer.hostname].weaken += useWeakenThreads
				}
			}
		} else {
			if ( activeThreads[targetServer.hostname].hack > 0){
				continue;
			}
			let gain = ns.hackAnalyze(config.target);
			let neededThreads = Math.ceil(.15 / gain);

			let maxThreads = Math.floor(availRam / ns.getScriptRam('./remote/doHack.js'))
			if (maxThreads <= 0) {
				continue;
			}

			let hackThreads = Math.min(maxThreads, neededThreads)
			let weakenThreads = Math.min((availRam - (hackThreads * ns.getScriptRam('./remote/doHack.js'))) / ns.getScriptRam('./remote/weaken.js'), Math.ceil(ns.hackAnalyzeSecurity(hackThreads+1)/.05));
			while (ns.hackAnalyzeSecurity(hackThreads) > ns.weakenAnalyze(weakenThreads)) {
				hackThreads = hackThreads - 1;
				weakenThreads = Math.min((availRam - (hackThreads * ns.getScriptRam('./remote/doHack.js'))) / ns.getScriptRam('./remote/weaken.js'), Math.ceil(ns.hackAnalyzeSecurity(hackThreads+1)/.05));
			}

			let hackSize = hackThreads * ns.getScriptRam("remote/doHack.js");
			let weakenSize = weakenThreads * ns.getScriptRam("remote/weaken.js");

			let remainingRam = server.maxRam - server.ramUsed - hackSize - weakenSize;

			let growthThreads = Math.ceil(ns.growthAnalyze(config.target, 1.18))*2;

			//ns.toast("Would need " + growthThreads + " growth threads in remaining ram of " + remainingRam, 'info', null);			

			if (hackThreads <= 0) {
				continue;
			}

			let hackTime = ns.getHackTime(config.target)
			let weakenTime = ns.getWeakenTime(config.target)
			let growTime = ns.getGrowTime(config.target)
			let shouldGrow = false;
			let shouldWeaken = false;

			if( remainingRam > growthThreads * ns.getScriptRam('./remote/doGrow.js')){
				shouldGrow = true;
			}

			remainingRam -= (growthThreads * ns.getScriptRam('./remote/doGrow.js'));

			let growthWeakenThreads = Math.ceil(ns.growthAnalyzeSecurity(growthThreads)/.05)
			while(ns.weakenAnalyze(growthWeakenThreads) < ns.growthAnalyzeSecurity(growthThreads)){
				growthWeakenThreads++;
			}
			if(remainingRam > growthWeakenThreads * ns.getScriptRam('./remote/doWeaken.js')){
				shouldWeaken = true;
			}

			let hackPid = 0;
			let weakenPid = 0;
			let growPid = 0;

			if (hackThreads <= 0) {
				continue;
			}

			if (hackTime < weakenTime) {
				ns.tprint("We should wait " + (weakenTime - hackTime - 10) + " milliseconds first before hacking HackThreads: " + hackThreads)
				await ns.scp('/remote/doHack.js', name);
				hackPid = ns.exec('/remote/doHack.js', name, hackThreads, config.target, Math.floor(weakenTime - hackTime - 10), "Hack");
				ns.tprint("Hack pid: " + hackPid)
				if (hackPid == 0) {
					ns.toast("Failed to create hack threads " + hackThreads, 'error')
				} else {					
					weakenPid = ns.exec('/remote/doWeaken.js', name, weakenThreads, config.target, 0, "Weaken after hack 1");
					growPid = ns.exec('/remote/doGrow.js', name, growthThreads, config.target, (weakenTime-growTime+10), "Hack");
					weakenPid = ns.exec('/remote/doWeaken.js', name, growthWeakenThreads*2, config.target, 20, "Weaken after grow for hack");
				}
			} else {
				ns.tprint("We should wait " + (hackTime - weakenTime - 10) + " milliseconds first before weakening")
				hackPid = ns.exec('/remote/doHack.js', name, hackThreads, config.target, Math.floor(0), "Hacking");
				if (hackPid == 0) {
					ns.toast("Failed to create hack thread");
				} else {
					await ns.scp('/remote/doWeaken.js', name);
					weakenPid = ns.exec('/remote/doWeaken.js', name, weakenThreads, config.target, Math.floor(weakenTime - hackTime + 10), "Weaken after Hack 2");
				}
				if (weakenPid == 0) {
					ns.toast("Failed to create hack thread");
				}
			}
			let running = {
				target: config.target,
				host: name,
				growPid: growPid,
				growThreads: growthThreads,
				timeToGrow: 0,
				weakenPid: weakenPid,
				weakenThreads: weakenThreads + Math.ceil(ns.growthAnalyzeSecurity(growthThreads)/.04),
				timeToWeaken: weakenTime,
				hackPid: hackPid,
				hackThreads: hackThreads,
				timeToHack: hackTime
			}
			config.processes.push(running);
			activeThreads[targetServer.hostname].weaken += weakenThreads
			activeThreads[targetServer.hostname].hack += hackThreads
			await ns.sleep(1)

			ns.tprint("Adding hack threads to " + targetServer.hostname + " equals " + activeThreads[targetServer.hostname].hack );
		}
	};

	await syncConfig(ns);
	await writeThreadCounts(ns, activeThreads);
}