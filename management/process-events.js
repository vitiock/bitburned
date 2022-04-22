const argsSchema = [
  ['loop', false],
  ['help', false],
  ['port', 7]
]

function displayHelpInfo(ns){
  ns.tprintf("\n\n=== NUKE Servers =====")
  ns.tprintf("This script will listen to port 7 for events, and dispatch script executions based on the event")
  ns.tprintf("\n")
  ns.tprintf("=== Flags ============")
  ns.tprintf("--help : Displays this information on how to use the script.")
  ns.tprintf("--port : Overrides the port to be listened on.")
  ns.tprintf("--loop : Run the script in a loop instead of a single time.\n\n\n")
}

/** @param {NS} ns **/
export async function main(ns) {
  let flags = ns.flags(argsSchema);
  let port = ns.getPortHandle(flags.port);

  let eventHandlers = {}
  eventHandlers.poop = [];
  eventHandlers.poop.push("/debug/print-event.js");
  eventHandlers.nuked = [];
  eventHandlers.nuked.push("/event-handlers/nuked.js");
  eventHandlers.hacked = [];
  eventHandlers.hacked.push("/event-handlers/on-hack.js");

  do{
    while(!port.empty()){
      let eventData = port.read();
      try {
        let event = JSON.parse(eventData.toString())
        if(eventHandlers[event.eventType]){
          for(let handler of eventHandlers[event.eventType]){
            try {
              let pid
              if(event.eventData !== undefined) {
                pid = ns.exec(handler, 'home', 1, '--event', event.eventType, '--data', event.eventData);
              } else {
                pid = ns.exec(handler, 'home', 1, '--event', event.eventType);
              }
              if(pid === 0){
                ns.tprint("ERROR: Failed to execute event handler for event of type: " +event.eventType);
              }
            } catch (e) {
              ns.tprint(e.toString());
            }
          }
        } else {
          ns.tprint("ERROR: No event handlers for event type: " + event.eventType);
        }
      } catch (e) {
        ns.tprint("ERROR: unable to parse event data, " +  eventData)
      }
    }

    if(flags.loop) {
      await ns.sleep(100);
    }
  } while(flags.loop)
}