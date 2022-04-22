const argsSchema = [
  ['event', ''],
  ['data', ''],
  ['help', false]
]

function displayHelpInfo(ns){
  ns.tprintf("\n\n=== Event Handler - hack =====")
  ns.tprintf("Simple script to regenerate server file after a server has been nuked")
  ns.tprintf("\n\n\n")
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

  ns.tprint(flags.data);
}