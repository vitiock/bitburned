import {NS} from "Bitburner";

const CRON_FILE = "/temp/cron.txt"
const CRON_STATE_FILE = "/temp/cron-state.txt"

type CronJob = {
  name: string
  rate: number
}

type ExecutionDetails = {
  lastRun: number
  lastPid: number
}

type Executions = {
  [key: string]: ExecutionDetails;
}

type CronState = {
  lastRun: Executions
}

function loadCronFile(ns: NS) : CronJob[] {
  return JSON.parse(ns.read(CRON_FILE));
}

/** @param {NS} ns **/
export async function main(ns: NS) {
  let cronJobs = loadCronFile(ns)


  for(let cronJob of cronJobs){
    let pid = ns.exec(cronJob.name, 'home', 1);

  }
}