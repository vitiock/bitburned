const argsSchema = [
	['target', 'n00dles'],
	['sleep', 0],
	['expectedweakens', 1],
	['expectedgrows', 1],
	['reapPercentage', 5],
]

/** @param {NS} ns **/
export async function main(ns) {
	const flags = ns.flags(argsSchema);
	await ns.sleep(flags['sleep'])
	let hacked = await ns.hack(flags['target'])
	ns.toast("Hacked " + flags['target'] + " for " + hacked);
}