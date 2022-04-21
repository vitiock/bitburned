/** @param {NS} ns **/
import {fixWidthString, loadCycleState} from "/helpers";

let doc = eval('document')

export async function main(ns) {
  ns.disableLog('sleep');
  ns.clearLog();

  let value = 0;
  let headers = doc.getElementsByTagName('h6');
  console.log("Total headers: " + headers.length)
  for(let i = 0; i < headers.length; i++){
    if(headers[i].innerText === '/dashboard/cycle.js') {
      console.log(headers[i])
      headers[i].innerText = "Cycle Dashboard"
    }
    if(headers[i].innerText === 'Cycle Dashboard') {
      console.log(headers[i].parentNode.parentNode.parentNode.children[1].children[0]);
      headers[i].parentNode.parentNode.parentNode.children[1].children[0].style.width = '1000px';
      headers[i].parentNode.parentNode.parentNode.children[1].children[0].style.height = '600px';
      let buttonHolder = headers[i].parentNode.children[1];
      if(buttonHolder.children.length <= 3) {
        let runButton = buttonHolder.children[0]
        console.log(runButton)
        let newButton = runButton.cloneNode(true);
        buttonHolder.prepend(newButton);
      } else {
        buttonHolder.children[0].innerText = 'Sloop'
        buttonHolder.children[0].addEventListener("click", () => {
          value = value + 1;
        });
      }
    }
  }

  while(true){
    ns.clearLog();
    let cycleState = loadCycleState(ns);
    ns.print("Phase: " + cycleState.currentPhase);
    ns.print("Next Action: " + cycleState.nextAction);
    ns.print(fixWidthString(" Augment", 25));
    for(let i = 0; i < cycleState.cycleAugments.length; i++){
      let augment = cycleState.cycleAugments[i];
      try {
        ns.print(" " + fixWidthString(augment.name, 25) + "   Faction(s): " + augment.factions.join(', '))
      } catch (e) {
        ns.tprint(JSON.stringify(augment));
        ns.toast(e.toString())
      }
    }

    for(let i = 0; i < cycleState.actions.length; i++){
      let action = cycleState.actions[i];
      ns.print( action.action + " : " + action.target + " : " + action.value)
    }

    ns.print('Value: ' + value)
    ns.print('Karma: ' + ns.heart.break())

    await ns.sleep(1000);
  }
}