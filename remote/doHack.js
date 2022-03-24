/** @param {NS} ns **/
export async function main(ns) {
	await ns.sleep(ns.args[1])
	let hacked = await ns.hack(ns.args[0])
}