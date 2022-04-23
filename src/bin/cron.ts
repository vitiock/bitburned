import {NS} from "Bitburner";
import {Logger} from "/logger/logger";
import {CronJob} from "/cron/job";

const CRON_FILE = "/temp/cron.txt"
const CRON_STATE_FILE = "/temp/cron-state.txt"

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
  try {
    return JSON.parse(ns.read(CRON_FILE));
  } catch (e) {
    return [];
  }
}

/** @param {NS} ns **/
export async function main(ns: NS) {
  let cronJobs = loadCronFile(ns)
  let cronState = {}
  let logger = new Logger(ns);

  ns.tail();

  logger.log(`Running CRON with ${cronJobs.length} Jobs`)
  for(let cronJob of cronJobs){
    if(cronState[cronJob.script] === undefined){
      cronState[cronJob.script] = {
        lastRun: 0,
        lastPid: 0
      }
    }

    if(Date.now() - cronState[cronJob.script].lastRun > cronJob.rate) {
      let pid = ns.exec(cronJob.script, 'home', 1);
      if (pid === 0) {
        //ERROR
      } else {
        cronState[cronJob.script].lastPid = pid;
        cronState[cronJob.script].lastRun = Date.now();
      }
    }
  }
}