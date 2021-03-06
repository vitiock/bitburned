const argsSchema = [
  ['course', 'Study Computer Science'],
  ['university', 'rothman university'],
  ['focus', false]
]

/**
 *
 * @param {NS} ns
 */
export async function main(ns) {
  let flags = ns.flags(argsSchema);
  if(ns.getPlayer().workType === 'Studying or taking a class at university'){
    ns.toast("Already studying");
  } else {
    ns.toast("Studying " + flags.course + " at " + flags.university);
    ns.universityCourse(flags.university, flags.course, flags.focus)
  }
  await ns.sleep(60 * 1000);
}