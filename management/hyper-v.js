// TODO: more efficient server usage
// TODO: go ham harder against bigger servers
// TODO: fall into debug mode if we need to repair

import {getFreeRam} from "/helpers.js";

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
	return server.minDifficulty === server.hackDifficulty && server.moneyAvailable === server.moneyMax
}

/**
 * @param {Server} server
 * @param activeThreads
 * */
function isBeingExploited(server, activeThreads) {
	return !activeThreads[server.hostname] || activeThreads[server.hostname].hack === 0;

}

/**
 *
 * @param {NS} ns
 * @param {string} hostname
 * @returns {{hack: number, grow: number, debug: boolean, growWeaken: number, hackWeaken: number}}
 */
async function getReapThreads(ns, hostname) {
	if (ns.fileExists('/reap/reap-' + hostname + '-5.txt')) {
		let reapConfigJson = await ns.read('/reap/reap-'+hostname+'-5.txt');
		let reapConfig = JSON.parse(reapConfigJson);
		if(reapConfig.hack && reapConfig.hack > 0) {
			return reapConfig;
		}
	}

	let gain = ns.hackAnalyze(hostname);
	let hackThreads = Math.ceil(.15 / gain);

	let hackAffect = ns.hackAnalyzeSecurity(hackThreads);

	let weakenThreads = 1;
	while (ns.weakenAnalyze(weakenThreads, 1) < hackAffect) {
		weakenThreads += 1;
	}

	// Add an extra 5 grow threads just to be on the safe side
	let growthThreads = Math.ceil(ns.growthAnalyze(hostname, 1.18)) + 5;

	let growthAffect = ns.growthAnalyzeSecurity(growthThreads)
	let growthWeakenThreads = 1
	while (ns.weakenAnalyze(growthWeakenThreads) < growthAffect) {
		growthWeakenThreads++;
	}

	let reapConfig = {
		hack: hackThreads,
		hackWeaken: weakenThreads,
		grow: growthThreads,
		growWeaken: growthWeakenThreads,
		debug: true
	}

	await ns.write('/reap/reap-' + hostname + '-5.txt', JSON.stringify(reapConfig), 'w');

	return reapConfig;
}

/**
 *
 * @param {NS} ns
 * @param {string} hostname
 * @param {{hack: number, grow: number, debug: boolean, growWeaken: number, hackWeaken: number}} reapConfig
 * @param {string} executor
 */
async function runDebugReap(ns, hostname, reapConfig, activeThreads, executor){
	let weakenTime = ns.getWeakenTime(hostname);
	let growTime = ns.getGrowTime(hostname);
	let hackTime = ns.getHackTime(hostname);

	if (reapConfig.grow === 0) {
		reapConfig.grow = 1;
	}

	let hackSleep = 0;
	let hackWeakenSleep = 0;
	let growSleep = 0;
	let growWeakenSleep = 0;

	if (weakenTime > hackTime && weakenTime > growTime) {
		hackSleep = weakenTime - hackTime - 20;
		hackWeakenSleep = 0;
		growSleep = weakenTime - growTime + 20;
		growWeakenSleep = 40;
	}
// debug
	if (growTime > weakenTime && growTime > hackTime) {
		hackSleep = growTime - hackTime - 20;
		hackWeakenSleep = growTime - weakenTime - 10;
		growSleep = 0;
		growWeakenSleep = growTime - weakenTime + 10;
	}

	if (hackTime > weakenTime && hackTime > growTime) {
		hackSleep = 0;
		hackWeakenSleep = hackTime - weakenTime + 10;
		growSleep = hackTime - growTime + 20;
		growWeakenSleep = hackTime - weakenTime + 30;
	}

	let totalRam = reapConfig.hack * ns.getScriptRam('/remote/doDebugHack.js') +
		reapConfig.hackWeaken * ns.getScriptRam('/remote/doWeaken.js') +
		reapConfig.grow * ns.getScriptRam('/remote/doDebugGrow.js') +
		reapConfig.growWeaken * ns.getScriptRam('/remote/doWeaken.js');

	let server = ns.getServer(executor)
	if ( getFreeRam(server) > totalRam) {

		await ns.scp('/remote/doDebugHack.js', executor);
		await ns.scp('/remote/doDebugGrow.js', executor);
		await ns.scp('/remote/doWeaken.js', executor);
		await ns.scp('/reap/reap-'+hostname+'-5.txt', executor);

		// Attempt to bring server back to neutral if not quite there yet

		let hackPid = ns.exec('/remote/doDebugHack.js', executor, reapConfig.hack, '--target', hostname, '--sleep', hackSleep, '--expectedweakens', reapConfig.hackWeaken, '--expectedgrows', reapConfig.grow);
		let hackWeakenPid = ns.exec('/remote/doWeaken.js', executor, reapConfig.hackWeaken, hostname, hackWeakenSleep, "Reap Hack Weaken", Date.now());
		let growPid = ns.exec('/remote/doDebugGrow.js', executor, reapConfig.grow, '--target', hostname, '--sleep', growSleep, '--expectedweakens', reapConfig.growWeaken);
		let growWeakenPid = ns.exec('/remote/doWeaken.js', executor, reapConfig.growWeaken, hostname, growWeakenSleep, "Reap Grow Weaken", Date.now());

		if(hackPid === 0 || hackWeakenPid === 0 || growPid === 0 || growWeakenPid === 0){
			ns.toast("Failed to create proper reap for debug", 'error');
		}

		let running = {
			target: config.target,
			host: executor,
			growPid: growPid,
			growThreads: reapConfig.grow,
			timeToGrow: 0,
			weakenPid: growWeakenPid,
			weakenThreads: reapConfig.hackWeaken + reapConfig.growWeaken,
			timeToWeaken: weakenTime,
			hackPid: hackPid,
			hackThreads: reapConfig.hack,
			timeToHack: hackTime
		}
		config.processes.push(running);
		activeThreads[hostname].weaken += reapConfig.hackWeaken + reapConfig.growWeaken
		activeThreads[hostname].hack += reapConfig.hack
	}
}

async function setReapToDebug(ns, hostname){
	if(ns.fileExists('/reap/reap-'+hostname+'-5.txt')) {
		await ns.rm('/reap/reap-'+hostname+'-5.txt');
	}
}

/**
 *
 * @param {NS} ns
 * @param {string} hostname
 * @param {{hack: number, grow: number, debug: boolean, growWeaken: number, hackWeaken: number}} reapConfig
 * @param {string} executor
 */
async function runReap(ns, hostname, reapConfig, activeThreads, executor){
	let weakenTime = ns.getWeakenTime(hostname);
	let growTime = ns.getGrowTime(hostname);
	let hackTime = ns.getHackTime(hostname);

	if (reapConfig.grow === 0) {
		reapConfig.grow = 1;
	}

	let hackSleep = 0;
	let hackWeakenSleep = 0;
	let growSleep = 0;
	let growWeakenSleep = 0;

	if (weakenTime > hackTime && weakenTime > growTime) {
		hackSleep = weakenTime - hackTime - 40;
		hackWeakenSleep = 0;
		growSleep = weakenTime - growTime + 40;
		growWeakenSleep = 80;
	}

	if (growTime > weakenTime && growTime > hackTime) {
		hackSleep = growTime - hackTime - 20;
		hackWeakenSleep = growTime - weakenTime - 10;
		growSleep = 0;
		growWeakenSleep = growTime - weakenTime + 10;
	}

	if (hackTime > weakenTime && hackTime > growTime) {
		hackSleep = 0;
		hackWeakenSleep = hackTime - weakenTime + 10;
		growSleep = hackTime - growTime + 20;
		growWeakenSleep = hackTime - weakenTime + 30;
	}

	let totalRam = reapConfig.hack * ns.getScriptRam('/remote/doHack.js') +
		reapConfig.hackWeaken * ns.getScriptRam('/remote/doWeaken.js') +
		reapConfig.grow * ns.getScriptRam('/remote/doGrow.js') +
		reapConfig.growWeaken * ns.getScriptRam('/remote/doWeaken.js');

	let itters = 0;
	let server = ns.getServer(executor)
	let showToast = false
	while ( getFreeRam(server) > totalRam) {
		showToast = true;
		await ns.scp('/remote/doHack.js', executor);
		await ns.scp('/remote/doGrow.js', executor);
		await ns.scp('/remote/doWeaken.js', executor);
		await ns.scp('/reap/reap-'+hostname+'-5.txt', executor);

		// Attempt to bring server back to neutral if not quite there yet

		let hackPid = ns.exec('/remote/doHack.js', executor, reapConfig.hack, hostname, hackSleep + itters * 500, "Reap Hack", Date.now());
		await ns.sleep(1);
		let hackWeakenPid = ns.exec('/remote/doWeaken.js', executor, reapConfig.hackWeaken, hostname, hackWeakenSleep + itters * 500, "Reap Hack Weaken", Date.now());
		await ns.sleep(1);
		let growPid = ns.exec('/remote/doGrow.js', executor, reapConfig.grow, hostname, growSleep + itters * 500, "Reap Grow", Date.now());
		await ns.sleep(1);
		let growWeakenPid = ns.exec('/remote/doWeaken.js', executor, reapConfig.growWeaken, hostname, growWeakenSleep + itters * 500, "Reap Grow Weaken", Date.now());
		await ns.sleep(1);

		if(hackPid === 0 || hackWeakenPid === 0 || growPid === 0 || growWeakenPid === 0){
			ns.toast("Failed to create proper reap", 'error');
		}

		let running = {
			target: config.target,
			host: executor,
			growPid: growPid,
			growThreads: reapConfig.grow,
			timeToGrow: 0,
			weakenPid: growWeakenPid,
			weakenThreads: reapConfig.hackWeaken + reapConfig.growWeaken,
			timeToWeaken: weakenTime,
			hackPid: hackPid,
			hackThreads: reapConfig.hack,
			timeToHack: hackTime
		}
		config.processes.push(running);
		activeThreads[hostname].weaken += reapConfig.hackWeaken + reapConfig.growWeaken
		activeThreads[hostname].hack += reapConfig.hack

		server = ns.getServer(executor)
		itters = itters + 1;
		await ns.sleep(10);
	}

	if(showToast) {
		ns.toast("Scheduled " + itters + " reap processes against " + hostname);
	}
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

	let adminServers = hostList.filter(server => server.hasAdminRights && !server.hostname.startsWith('hax-') && server.hostname != 'home' && server.moneyMax > 0)
	adminServers = adminServers.filter(server => {

		if(ns.fileExists('reap-lock-' + server.hostname + '.txt')) {
			//ns.tprint("Reap lock exists for: " + server.hostname);
			return false;
		}
		return true;
	})

	let exploitable = adminServers.filter(server => {
		if (canExploit(server)) {
			let isExploit = isBeingExploited(server, activeThreads);
			if( isExploit ) {
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
		let configData = await ns.read('config.txt');
		config = JSON.parse(configData);
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

		//await reapServer(ns, 'crush-fitness');
		//continue;

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
			await setReapToDebug(ns, targetServer.hostname);
			let currentWeakens = activeThreads[targetServer.hostname].weaken;
			let requiredWeakens = Math.ceil((targetServer.hackDifficulty - targetServer.minDifficulty) / .05)

			if (currentWeakens >= Math.ceil(requiredWeakens)) {
				continue;
			}


			let numThreads = Math.floor(availRam / ns.getScriptRam('/remote/doWeaken.js'))
			if (numThreads <= 0) {
				continue;
			}
			await ns.scp('/remote/doWeaken.js', name);
			let weakenPid = ns.exec('/remote/doWeaken.js', name, numThreads, config.target, 0)
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
			await setReapToDebug(ns, targetServer.hostname);
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
					let availMem = availRam - (ns.getScriptRam('/remote/doGrow.js') * useGrowThreads)
					let useWeakenThreads = Math.min(Math.floor(availMem / Math.ceil(ns.getScriptRam('/remote/doWeaken.js'))), Math.ceil(ns.growthAnalyzeSecurity(useGrowThreads) / .05))

					while (ns.weakenAnalyze(useWeakenThreads) < ns.growthAnalyzeSecurity(useGrowThreads)) {
						useGrowThreads = useGrowThreads - 1;
						availMem = availRam - (Math.ceil(ns.getScriptRam('/remote/doGrow.js')) * useGrowThreads)
						useWeakenThreads = Math.floor(availMem / Math.ceil(ns.getScriptRam('/remote/doWeaken.js')))
					}

					if (useGrowThreads <= 0) {
						continue;
					}

					await ns.scp('/remote/doGrow.js', name);
					let timeToGrow = ns.getGrowTime(config.target);
					let timeToWeaken = ns.getWeakenTime(config.target);
					let growPid = 0;
					let weakenPid = 0;

					if (timeToWeaken < timeToGrow) {
						ns.tprint("")
					} else {
						let timeToWait = Math.floor(timeToWeaken - timeToGrow - 10)
						let growPid = ns.exec('/remote/doGrow.js', name, useGrowThreads, config.target, timeToWait, "From growth section", 0, Date.now());
						if(growPid == 0){
							if(ns.isRunning('/remote/doGrow.js', name)) {
								ns.toast("Failed due to script already running");
							}
							ns.tprint("Failed to create grow: " + useGrowThreads + " on " + name + " for " + config.target + " with sleep of " + Math.floor(timeToWeaken - timeToGrow - 10));
							continue;
						} else {
							await ns.scp('/remote/doWeaken.js', name)
							weakenPid = ns.exec('/remote/doWeaken.js', name, useWeakenThreads, config.target, 0, growPid);
							if (weakenPid == 0) {
								ns.toast('Failed to create weaken for grow ' + useWeakenThreads + ' on ' + name + ' with avail mem ' + (ns.getServer(name).maxRam - ns.getServer(name).ramUsed), 'error', null);
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
					activeThreads[targetServer.hostname].grow += useGrowThreads
					activeThreads[targetServer.hostname].weaken += useWeakenThreads
				}
			}
		} else {
			let reapConfig = await getReapThreads(ns, targetServer.hostname);
			if( reapConfig.debug ) {
				await runDebugReap(ns, targetServer.hostname, reapConfig, activeThreads, name)
			} else {
				await runReap(ns, targetServer.hostname, reapConfig, activeThreads, name)
			}
		}
	};

	await syncConfig(ns);
	await writeThreadCounts(ns, activeThreads);
}