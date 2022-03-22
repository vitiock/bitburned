/** @param {NS} ns **/
export async function main(ns) {
  await ns.wget('https://raw.githubusercontent.com/alainbryden/bitburner-scripts/main/git-pull.js', 'git-pull.js', 'home');
  await ns.exec('git-pull.js', 'home', 1, '--github', 'vitiock', '--repository', 'bitburned');
  ns.toast("Downloaded files from vitiock/bitburned", 'info');
}