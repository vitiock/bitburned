const argsSchema = [
  ['event', ''],
  ['data', ''],
  ['help', false]
]

/** @param {NS} ns **/
export async function main(ns) {
  let flags = ns.flags(argsSchema);

  ns.tprint("Recieved event of type: " + flags.event)
  ns.tprint("Event Data: " + flags.data);
}