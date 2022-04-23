import {NS} from "Bitburner";

class Logger {
  ns: NS;

  constructor(ns: NS) {
    this.ns = ns;
  }

  public log(message: string){
    this.ns.print(message)
  }
}

export {Logger}