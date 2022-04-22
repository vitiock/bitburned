const argsSchema = [
  ['num', 10],
  ['help', false],
  ['port', 7]
]

function displayHelpInfo(ns){
  ns.tprintf("\n\n=== Generate Debug Events =====")
  ns.tprintf("Creates debug events on the specified port for testing purposes")
  ns.tprintf("\n")
  ns.tprintf("=== Flags =========================")
  ns.tprintf("--help : Displays this information on how to use the script.")
  ns.tprintf("--port : Overrides the port to be written to (Default 7).")
  ns.tprintf("--num  : Number of events to generate (default 10).\n\n\n")
}


/** Simple script that will output to toast/terminal/log
 *
 *  @param {NS} ns
 *  **/
export async function main(ns) {
  let flags = ns.flags(argsSchema);

  if(flags.help){
    displayHelpInfo(ns);
    return;
  }

  for(let i = 0; i < flags.num; i++){
    await ns.writePort(flags.port, JSON.stringify({eventType: "hacked", eventData: i}));
  }
}