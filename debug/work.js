/** @param {NS} ns **/
const argsSchema = [
  ['company', ''],
  ['focus', false]
]


/**
 *
 * @param {NS} ns
 * @returns {Promise<void>}
 */
export async function main(ns) {
  let flags = ns.flags(argsSchema);
  //ns.applyToCompany('Four Sigma', 'software')
  ns.tprint("Working for " + flags['company'])
  if(flags['company'] === 'Fulcrum Secret Technologies'){
    ns.applyToCompany('Fulcrum Technologies', 'software');
    if(!ns.workForCompany('Fulcrum Technologies', flags.focus)){
      ns.universityCourse('rothman university', 'Study Computer Science', flags.focus)
    };
  } else {
    ns.applyToCompany(flags['company'], 'software');
    if(!ns.workForCompany(flags['company'], flags.focus)){
      ns.universityCourse('rothman university', 'Study Computer Science', flags.focus)
    };
  }
  await ns.sleep(60*1000);
}