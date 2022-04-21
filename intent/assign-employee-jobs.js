const argsSchema = [
  ['division', ''],
  ['city', '']
]

/**
 *
 * @param {NS} ns
 */
export async function main(ns) {
  let flags = ns.flags(argsSchema);
  ns.tprint("assigning employees for " + flags.division + " in city: " + flags.city);
  let office = ns.corporation.getOffice(flags.division, flags.city);
  for(let i = 12; i < office.employees.length; i++){
    let employee = ns.corporation.getEmployee(flags.division, flags.city, office.employees[i]);
    if(employee.pos === 'Unassigned'){
      let start = Date.now();
      ns.tprint("Updating job for: " + employee.name)
      if(flags.city === 'Sector-12'){
        await ns.corporation.assignJob(flags.division, flags.city, employee.name, 'Management')
      } else {
        await ns.corporation.assignJob(flags.division, flags.city, employee.name, 'Research & Development')
      }
      ns.tprint(Date.now()-start);
    }
  }
}