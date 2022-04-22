const argsSchema = [
	['target', 'n00dles'],
	['sleep', 0],
	['expectedweakens', 1],
	['expectedgrows', 1],
	['reapPercentage', 5],
	['expectedEndTime', 0],
	['manipulateStock', true]
]

/** @param {NS} ns **/
export async function main(ns) {
	const flags = ns.flags(argsSchema);
	await ns.sleep(flags['sleep'])
	let hacked = await ns.hack(flags['target'], {stock: flags['manipulateStock']})
	let event = {
		eventType: "hacked",
		eventData: JSON.stringify({
			hacked: hacked,
			endTime: Date.now(),
			expectedEndTime: flags.expectedEndTime,
			percentage: flags.reapPercentage
		})
	}

	await ns.writePort(7, JSON.stringify(event));
}