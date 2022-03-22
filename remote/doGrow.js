/** @param {NS} ns **/
export async function main(ns) {
	await ns.sleep(ns.args[1])
	let growth = await ns.grow(ns.args[0])
	if( growth == 0){
		ns.toast("Grew 0 dollars", 'error')
	}
	//ns.toast("Grew " + ns.args[0] + " by " + growth)
}