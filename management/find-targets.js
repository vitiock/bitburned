/** @param {NS} ns **/
export async function main(ns) {
	let targets = ['home']
	let scanned = []

	while (targets.length > 0) {		
		let name = targets.pop();
		scanned.push(name);
		ns.print("Probing: " + name)

		let server = ns.getServer(name);
		if (name == 'home') {
			let hosts = ns.scan(name);
			for(let i = 0; i < hosts.length; i++){
				if(!scanned.includes(hosts[i])) {
					targets.push(hosts[i]);					
				}
				await ns.sleep(100);
			}
		} else if (!server.hasAdminRights) {	
			ns.print("Attempting to gain access to: " + name)		
			if(ns.fileExists('BruteSSH.exe', 'home') && !server.sshPortOpen){
				ns.tprint("Opening ssh port on: " + name)
				ns.brutessh(name);
			}

			if(ns.fileExists('FTPCrack.exe', 'home') && !server.ftpPortOpen){
				ns.tprint("Opening ftp port on: " + name)
				ns.ftpcrack(name);
			}

			if(ns.fileExists('relaySMTP.exe', 'home') && !server.smtpPortOpen){
				ns.toast("Opening SMTP port on: " + name)
				ns.relaysmtp(name);
			}

			if(ns.fileExists('HTTPWorm.exe', 'home') && !server.httpPortOpen) {
				ns.toast("Opening HTTP port on: " + name)
				ns.httpworm(name);
			}

			if(ns.fileExists('SQLInject.exe', 'home') && !server.sqlPortOpen) {
				ns.toast("Opening SQL port on: " + name)
				ns.sqlinject(name);
			}

			if(server.openPortCount >= server.numOpenPortsRequired && server.requiredHackingSkill <= ns.getPlayer().hacking) {				
				ns.toast("Nuking server: " + name)
				ns.nuke(name);
				await ns.scp('hack.js', name)
			}
		} else {
			if(!server.backdoorInstalled) {
				//await ns.installBackdoor(server.hostname);
				//ns.toast("Backdooring: " + server.hostname);
			}
			let hosts = ns.scan(name);
			for(let i = 0; i < hosts.length; i++){
				if(!scanned.includes(hosts[i])) {
					targets.push(hosts[i]);
				}
				await ns.sleep(100);
			}
		}
	};
}