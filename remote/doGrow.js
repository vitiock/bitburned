const argsSchema = [
	['target', 'n00dles'],
	['sleep', 0],
	['expectedweakens', 1],
	['reapPercentage', 5]
]

/** @param {NS} ns **/
export async function main(ns) {
	const flags = ns.flags(argsSchema);
	await ns.sleep(flags['sleep'])
	let growth = await ns.grow(flags['target'])
	if( growth === 0){
		ns.toast("Grew 0 dollars", 'error')
	}
}