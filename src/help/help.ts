import {NS} from "Bitburner";

type FlagDetail = {
  flag: string,
  description: string,
}

export type HelpConfig = {
  title: string,
  description: string,
  flagDetails: FlagDetail[]
}

export function printHelp(ns: NS, help: HelpConfig) {
  ns.tprint(`=== ${help.title} =====`)
  ns.tprint(help.description);
  ns.tprint(`=======================`)
  for(let flagDetail of help.flagDetails) {
    ns.tprint( `${flagDetail.flag}: ${flagDetail.description}`)
  }
}