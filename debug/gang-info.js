/** Simple script that will output to toast/terminal/log
 *
 *  @param {NS} ns
 *  **/
export async function main(ns) {
  if(ns.gang.inGang()){
    while(ns.gang.canRecruitMember()){
      ns.gang.recruitMember('Hooligan-'+ns.gang.getMemberNames().length);
    }

    ns.tprint("We are in a gang");
    let names = ns.gang.getMemberNames();
    let gangMembers = [];
    for(let i = 0; i < names.length; i++){
      let member = ns.gang.getMemberInformation(names[i]);
      gangMembers.push(member);
    }

    gangMembers = gangMembers.sort( (a, b) => a.hack - b.hack);
    for(let i = 0; i < gangMembers.length; i++){
      ns.tprint("--- " + gangMembers[i].name);
      ns.tprint("Hacking: " + gangMembers[i].hack);
    }

    let tasks = ns.gang.getTaskNames();
    for(let i = 0; i < tasks.length; i++){
      ns.tprint("Task: " + tasks[i]);
      let taskInfo = ns.gang.getTaskStats(tasks[i])
      ns.tprint(JSON.stringify(taskInfo, null, 2));
    }

    let gangInfo = ns.gang.getGangInformation()
    ns.tprint("Is hacking gang: " + gangInfo.isHacking);
  }
}