import {NS} from "Bitburner";
import {HelpConfig, printHelp} from "/help/help";

const argsSchema : [string, string | number | boolean | string[]][] = [
  ['loop', false],
  ['help', false]
]

type Task = {

}

type ThreadCounts = {

}

let loadTasks = (ns: NS) : Task[] => {
  try {
    return JSON.parse(ns.read('tasks.txt'));
  }
  catch (e) {
    return [];
  }
}

let loadThreadCounts = (ns: NS) : ThreadCounts => {
  try {
    return JSON.parse(ns.read('threadCounts.txt'));
  } catch(e) {
    return {};
  }
}

let helpConfig : HelpConfig = {
  title: 'Hack Manager',
  description: "Responsible for orechestrating hack grow & weaken efforts",
  flagDetails: [{
    flag: 'loop',
    description: 'sets that this script should be run in a loop'
  }]
}

/** @param {NS} ns **/
export async function main(ns: NS) {
  let flags = ns.flags(argsSchema);
  if(flags['help']){
    printHelp(ns, helpConfig);
  }

  ns.tprint("Starting Hack Manager");

  let tasks = loadTasks(ns);
  let threadCounts = loadThreadCounts(ns);
}