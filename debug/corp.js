let cities = [
  "Aevum",
  "Chongqing",
  "Sector-12",
  "New Tokyo",
  "Ishima",
  "Volhaven"
]

let researchOrder = [
  'Hi-Tech R&D Laboratory',
  'Market-TA.I',
  'Market-TA.II',
  'Overclock',
  'Self-Correcting Assemblers'
]

let upgrades = [
  'Smart Factories',
  'Smart Storage',
  'DreamSense',
  'Project Insight',
  'FocusWires',
  'Speech Processor Implants',
  'Nuoptimal Nootropic Injector Implants',
  'Neural Accelerators',
  'Wilson Analytics'
//  'ABC SalesBots'
]

let maxes;
let lows;

async function redistributeEmployees(ns, division, city, employees){
  let pid = ns.exec('/intent/assign-employee-jobs.js', 'home', 1, '--division', division, '--city', city);
  if(pid !== 0){
    return;
  }
  ns.tprint("Redistributing employees for: " + division + " city: " + city);

  if(employees.length > 12){
    for(let i = 12; i < employees.length; i++){
      if(city === 'Sector-12'){
        if(i%5 !== 4) {
          if(ns.corporation.getEmployee(division, city, employees[i]).pos !== 'Management') {
            await ns.corporation.assignJob(division, city, employees[i], 'Management');
          }
        } else {
          if(ns.corporation.getEmployee(division, city, employees[i]).pos !== 'Engineer') {
            await ns.corporation.assignJob(division, city, employees[i], 'Engineer');
          }
        }
      } else {
        if(ns.corporation.getEmployee(division, city, employees[i]).pos !== 'Research & Development') {
          await ns.corporation.assignJob(division, city, employees[i], 'Research & Development');
        }
      }
    }
  }
}

/** @param {NS} ns **/
export async function main(ns) {
  return;
  if(maxes === undefined) {
    maxes = {}
  }

  if(lows === undefined) {
    lows = {}
  }

  let corp = ns.corporation.getCorporation();

  let officeAPICost = ns.corporation.getUnlockUpgradeCost("Office API")
  if(officeAPICost < corp.funds && !ns.corporation.hasUnlockUpgrade("Office API")){
    ns.tprint("Should buy office api");
    ns.corporation.unlockUpgrade("Office API")
  }

  for(let division of corp.divisions){
    for(let city of division.cities){
      let office = ns.corporation.getOffice(division.name, city);
      while(office.employees.length < office.size){
        ns.tprint("We should hire employees");
        let employee = ns.corporation.hireEmployee(division.name, city);
        office = ns.corporation.getOffice(division.name, city);
      }
    }
  }

  for(let division of corp.divisions){
    for(let city of division.cities){
      if(!ns.corporation.hasWarehouse(division.name, city)){
        ns.corporation.purchaseWarehouse(division.name, city);
        ns.toast("Purchased warehouse for " + division.name + " in " + city)
        return;
      } else {
        let warehouse = ns.corporation.getWarehouse(division.name, city)
      }
    }
  }
  corp = ns.corporation.getCorporation();

  //Recycle products constantly
  for(let division of corp.divisions){
    let lowestRating = 9000000;
    let lowestName = undefined;
    let developing = false;
    let maxRating = 0
    if(division.products.length === 3) {
      for (let productName of division.products) {
        let product = ns.corporation.getProduct(division.name, productName);
        if (product.rat < lowestRating) {
          lowestRating = product.rat;
          lowestName = productName;
        }
        if(product.rat > maxRating) {
          maxRating = product.rat
        }
        if(product.developmentProgress < 100){
          developing = true;
        } else {
          for (let city of division.cities) {
            if (product.cityData[city][1] > product.cityData[city][2] && product.cityData[city][0] > product.cityData[city][1]*11) {
              ns.tprint(productName + " : " + city + " : " + " QTY: " + product.cityData[city][0] + " PROD: " + product.cityData[city][1] + " SALE: " + product.cityData[city][2])
              ns.tprint(productName + " is not selling as much as it's producing in " + city);
            }
            if(product.cityData[city][2] === 0){
              ns.tprint("Failed to sell: " + division.name + ":" + city);
            }
          }
        }
        ns.corporation.sellProduct(division.name, 'Sector-12', productName, 'MAX', 'MP', true);
        if(ns.corporation.hasResearched(division.name, 'Market-TA.II')) {
          ns.corporation.setProductMarketTA2(division.name, productName, true)
        }
        else if(ns.corporation.hasResearched(division.name, 'Market-TA.I')) {
          ns.corporation.setProductMarketTA1(division.name, productName, true);
        }
      }
      if(!developing){
        ns.toast("Product spread: " + (maxRating-lowestRating) + " : " + lowestName, 'info', null)
        maxes[division.name] = maxRating
        if(lows[division.name] && lowestRating < lows[division.name]){
          ns.toast("Product quality is falling for: " + division.name + "!", 'error', null)
        }

        lows[division.name] = lowestRating;
        ns.tprint("Lowest Product is: " + lowestName + " at " + lowestRating);
        if(corp.funds > 10e9) {
          ns.corporation.discontinueProduct(division.name, lowestName);
          ns.corporation.makeProduct(division.name, 'Sector-12', lowestName, 5e9, 5e9);
        }
      }
    }
  }
  corp = ns.corporation.getCorporation();


  let lowestOfficeUpgradeCost
  let lowestOfficeUpgradeName
  let lowestOfficeUpgradeCity
  for(let division of corp.divisions){
    for(let city of division.cities){
      let upgradeCost = ns.corporation.getOfficeSizeUpgradeCost(division.name, city, 3)
      let office = ns.corporation.getOffice(division.name, city);
      if(lowestOfficeUpgradeCost === undefined || lowestOfficeUpgradeCost > upgradeCost){
        lowestOfficeUpgradeCost = upgradeCost;
        lowestOfficeUpgradeName = division.name
        lowestOfficeUpgradeCity = city;
      }
    }
  }

  if(lowestOfficeUpgradeCost < corp.funds) {
    //ns.corporation.upgradeOfficeSize(lowestOfficeUpgradeName, lowestOfficeUpgradeCity, 3);
    //ns.tprint("We should upgrade the office of " + lowestOfficeUpgradeName + " in the city of " + lowestOfficeUpgradeCity + " for " + lowestOfficeUpgradeCost);
  }
  corp = ns.corporation.getCorporation();

  for(let division of corp.divisions){
    if(division.cities.length < 6){
      if(ns.corporation.getExpandCityCost() + ns.corporation.getPurchaseWarehouseCost() < corp.funds){
        for(let city of cities){
          if(!division.cities.includes(city)){
            ns.corporation.expandCity(division.name, city)
            ns.corporation.purchaseWarehouse(division.name, city);
            return;
          }
        }
      } else {
        //ns.tprint("Need " + (ns.corporation.getExpandCityCost() + ns.corporation.getPurchaseWarehouseCost()) + " to expand");
      }
    }
  }
  corp = ns.corporation.getCorporation();

  //ns.tprint("Checking for too many training employees");
  for(let division of corp.divisions) {
    for (let city of division.cities) {
      let office = ns.corporation.getOffice(division.name, city);
      if(office.employeeJobs.Training > 1){
        ns.tprint("Too many employees training at " + division.name + " in " + city)
        for(let employeeName of office.employees){
          let employee = ns.corporation.getEmployee(division.name, city, employeeName);
          if(employee.pos === 'Training'){
            ns.tprint("Should move: " + employeeName);
            await ns.corporation.assignJob(division.name, city, employeeName, "Research & Development")
          }
        }
      }

      if(office.size === 9){
        if(office.employeeJobs.Operations !== 3 ||
          office.employeeJobs.Engineer !== 2){
          await redistributeEmployees(ns, division.name, city, office.employees);
        }
      }
      if(office.size === 12){
        if(office.employeeJobs.Operations !== 4 ||
          office.employeeJobs.Engineer !== 2 ||
          (office.employeeJobs.Management !== 2 && city === 'Sector-12')){
          await redistributeEmployees(ns, division.name, city, office.employees);
        }
      }
      if(office.size > 12){
        if(office.employeeJobs.Operations < 4 ||
          office.employeeJobs.Engineer < 2 ||
          (office.employeeJobs["Research & Development"] > 3 && city === 'Sector-12') ||
          (office.employeeJobs["Research & Development"] < 2 && city !== 'Sector-12') ||
          office.employeeJobs.Unassigned > 0){
          await redistributeEmployees(ns, division.name, city, office.employees);
        }
      }
//      ns.tprint(JSON.stringify(office));
    }
  }



  for(let division of corp.divisions){
    for(let nextResearch of researchOrder) {
      if(!ns.corporation.hasResearched(division.name, nextResearch)){
        let cost = ns.corporation.getResearchCost(division.name, nextResearch);
        if(division.research > cost * 2 && division.research > cost + 5000){
          ns.tprint(division.name + " does not currently have " + nextResearch);
          ns.corporation.research(division.name, nextResearch);
        }
        break;
      } else {
        //ns.tprint(division.name + " does currently have " + nextResearch);
      }
    }
  }


  for(let upgrade of upgrades) {

    if(ns.corporation.getUpgradeLevelCost(upgrade) < corp.funds * .25 && ns.corporation.getUpgradeLevel(upgrade) < 20){
      ns.corporation.levelUpgrade(upgrade);
      ns.toast("Upgraded corp " + upgrade);
      corp = ns.corporation.getCorporation();
    }
  }
  corp = ns.corporation.getCorporation();

  for(let division of corp.divisions){
    if(division.type === 'Software'){
      for(let city of division.cities){
        let warehouse = ns.corporation.getWarehouse(division.name, city);
        if(warehouse.sizeUsed/warehouse.size < .75 && warehouse.size - warehouse.sizeUsed > 200){
          ns.corporation.sellMaterial(division.name, city, 'AI Cores', 'PROD-10', 'MP');
        } else {
          ns.corporation.sellMaterial(division.name, city, 'AI Cores', 'PROD', 'MP');
          if(ns.corporation.getUpgradeWarehouseCost(division.name, city) < corp.funds - 5e9){
            //ns.corporation.upgradeWarehouse(division.name, city)
            //ns.tprint("Upgraded warehouse", 'info', 60*1000)
          }
        }
      }
    }

    if(division.type === 'Agriculture'){
      for(let city of division.cities) {
        let warehouse = ns.corporation.getWarehouse(division.name, city);
        //ns.tprint(warehouse.sizeUsed/warehouse.size )
        if(warehouse.sizeUsed/warehouse.size < .75 && warehouse.size - warehouse.sizeUsed > 200){
          ns.corporation.buyMaterial(division.name, city, 'Real Estate', 5);
        } else {
          ns.corporation.buyMaterial(division.name, city, 'Real Estate', 0);
          if(ns.corporation.getUpgradeWarehouseCost(division.name, city) < corp.funds - 5e9){
            //ns.corporation.upgradeWarehouse(division.name, city)
            //ns.tprint("Upgraded warehouse", 'info', 60*1000)
          }
        }
      }
    }
  }
  corp = ns.corporation.getCorporation();


  //Look to improve office for software
  for(let division of corp.divisions){
    if(division.type === 'Agriculture'){
      continue;
    }

    let sectorTwelveOffice = ns.corporation.getOffice(division.name, 'Sector-12');
    let sectorSize = sectorTwelveOffice.size;

    let shouldUpgradeSatellite = false;
    let satelliteCity
    for(let city of division.cities) {
      if(city === 'Sector-12'){
        continue;
      }

      let office = ns.corporation.getOffice(division.name, city);
      if(office.size < sectorSize-60 && office.size < sectorSize/2){
        shouldUpgradeSatellite = true;
        satelliteCity = city;
        break;
      }
    }

    if(shouldUpgradeSatellite && ns.corporation.getOfficeSizeUpgradeCost(division.name, satelliteCity, 15) < corp.funds){
        ns.tprint("Should upgrade: " + satelliteCity)
        ns.corporation.upgradeOfficeSize(division.name, satelliteCity, 15);
    } else {
      if(ns.corporation.getHireAdVertCost(division.name) < corp.funds/10){
        ns.corporation.hireAdVert(division.name)
        ns.tprint("We should advertise");
        ns.toast("Advertising for " + division.name)
      }
      if(ns.corporation.getOfficeSizeUpgradeCost(division.name, 'Sector-12', 15) < corp.funds){
        ns.tprint("Should upgrade Sector-12");
        ns.corporation.upgradeOfficeSize(division.name, 'Sector-12', 15);
      }
    }
    corp = ns.corporation.getCorporation();
  }
}