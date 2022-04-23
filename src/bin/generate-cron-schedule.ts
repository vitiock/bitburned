import {NS} from "Bitburner";

/** @param {NS} ns **/
export async function main(ns: NS) {
  let player = ns.getPlayer();

  let currentBitnode = player.bitNodeN;
  let sourceFiles = ns.getOwnedSourceFiles();
  ns.tprint(JSON.stringify(sourceFiles));
  let sourceFileMap = {};
  for(let file of sourceFiles) {
    sourceFileMap[file.n] = file.lvl;
  }
  ns.tprint(JSON.stringify(sourceFileMap));

  if(sourceFileMap[4] > 0){
    ns.tprint("Can process actions");
  }
  if(sourceFileMap[2] > 0){
    ns.tprint( "Can manage a gang");
    if(ns.gang.inGang()){
      ns.tprint("Include gang management script")
    } else {
      ns.tprint("Include gang formation script");
    }
  }
  if(sourceFileMap[3] > 0){
    ns.tprint("Can manage a corporation");
  }
}