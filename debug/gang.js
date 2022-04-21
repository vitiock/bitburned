/**
 *
 * @param {NS} ns
 * @param {GangMemberInfo} member
 * @param {GangTaskStats[]} taskDetails
 */
import {loadCycleState} from "/helpers";

function findBestTaskForMember(ns, member, taskDetails) {
  if(member.hack < 100) {
    return 'Train Hacking'
  }

  /*
  if(member.cha < 100) {
    return 'Train Charisma'
  }
   */

  let respect = 0;
  let task = 'Train Hacking'
  let skipMoney = false;
  let cycleState = loadCycleState(ns);
  if(ns.getPlayer().money > 100e9) {
    skipMoney = true;
  }
  for(let i = 0; i < taskDetails.length; i++) {
    if(taskDetails[i].baseRespect > respect && member.hack * taskDetails[i].hackWeight / 100 > taskDetails[i].difficulty * 4 && (taskDetails[i].baseMoney > 0 || skipMoney)) {
      task = taskDetails[i]
    }
  }
  return task.name;
}

let mode;

/** Simple script that will output to toast/terminal/log
 *
 *  @param {NS} ns
 *  **/
export async function main(ns) {
  if(!mode){
    mode = 'weaken';
  }
  if(ns.gang.inGang()){
    while(ns.gang.canRecruitMember()){
      ns.gang.recruitMember('Hooligan-'+ns.gang.getMemberNames().length);
    }

    let names = ns.gang.getMemberNames();
    let gangMembers = [];
    for(let i = 0; i < names.length; i++){
      let member = ns.gang.getMemberInformation(names[i]);
      gangMembers.push(member);
    }

    gangMembers = gangMembers.sort( (a, b) => a.hack - b.hack);

    let tasks = ns.gang.getTaskNames();
    let taskInfos = [];
    for(let i = 0; i < tasks.length; i++){
      let taskInfo = ns.gang.getTaskStats(tasks[i])
      taskInfos.push(taskInfo);
    }

    let gangInfo = ns.gang.getGangInformation()
    if(gangInfo.wantedLevel === 1){
      mode = 'grow';
    } else if (gangInfo.wantedLevel > 50 && gangInfo.wantedPenalty < .99) {
      mode = 'weaken';
    }

    if(mode === 'weaken'){
      ns.gang.setMemberTask(gangMembers[0].name, 'Train Hacking')
      for(let i=1; i < gangMembers.length; i++){
        ns.gang.setMemberTask(gangMembers[i].name, 'Ethical Hacking')
      }
    } else if (mode === 'grow') {
      ns.gang.setMemberTask(gangMembers[0].name, 'Train Hacking')
      for(let i=1; i < gangMembers.length; i++){
        let taskToDo = findBestTaskForMember(ns, gangMembers[i], taskInfos);
        ns.gang.setMemberTask(gangMembers[i].name, taskToDo)
      }
    }

    let sum = 0;
    gangMembers.map( member => {sum += member.earnedRespect})

    for(let i=0; i < gangMembers.length; i++){
      let results = ns.gang.getAscensionResult(gangMembers[i].name);
      if(results &&
        gangMembers[i].earnedRespect/sum < .2 &&
        gangMembers[i].hack_asc_mult*(results.hack-1) > 10 &&
        sum - gangMembers[i].earnedRespect > 2e6){
        ns.gang.ascendMember(gangMembers[i].name)
        ns.toast("Ascending " + gangMembers[i].name)
        break;
      }
      if(results) {
        let value = (results.hack + results.cha)-2
        if (value > 1) {
          //TODO: Don't augment if it would leave reputation < some reserve value
          ns.gang.ascendMember(gangMembers[i].name)
        }
      }
    }

    let equipmentNames = ns.gang.getEquipmentNames()
    for(let i = 1; i < equipmentNames.length; i++){
      for(let x = 0; x < gangMembers.length; x++) {
        let price = ns.gang.getEquipmentCost(equipmentNames[i])
        if (price < ns.getPlayer().money && ns.gang.getEquipmentType(equipmentNames[i]) === 'Augmentation' && ns.gang.getEquipmentStats(equipmentNames[i]).hack) {
          ns.gang.purchaseEquipment(gangMembers[x].name, equipmentNames[i])
        }

        if (price < ns.getPlayer().money / 10 && ns.gang.getEquipmentType(equipmentNames[i]) === 'Rootkit') {
          ns.gang.purchaseEquipment(gangMembers[x].name, equipmentNames[i])
        }
      }
    }
  }
}