/** @param {NS} ns **/
import {loadCycleState} from "/helpers";

export async function main(ns) {
  if(ns.getPlayer().hasWseAccount) {
    if (ns.getPlayer().hasTixApiAccess) {
      if (ns.getPlayer().has4SDataTixApi) {
        let cycleState = loadCycleState(ns);
        if(cycleState.currentPhase === 'FINALIZE'){
          let stockSymbols = ns.stock.getSymbols();
          for(let stockSymbol of stockSymbols) {
            let position = ns.stock.getPosition(stockSymbol)
            if(position[0] > 0){
              ns.stock.sell(stockSymbol, position[0]);
            }
          }

          return;
        }

        let stockSymbols = ns.stock.getSymbols();
        let stockDetails = [];
        for(let stockSymbol of stockSymbols) {
          let stockDetail = {
            symbol: stockSymbol,
            price: ns.stock.getPrice(stockSymbol),
            volatility: ns.stock.getVolatility(stockSymbol),
            forecast: ns.stock.getForecast(stockSymbol),
            position: ns.stock.getPosition(stockSymbol)
          }
          stockDetails.push(stockDetail)
        }

        await ns.write('/temp/stock-data.txt', JSON.stringify(stockDetails), 'w');

        for(let stonk of stockDetails){
          let position = ns.stock.getPosition(stonk.symbol);
          if(position[0] > 0 && stonk.forecast <= .5){
            let gain = ns.stock.getSaleGain(stonk.symbol, position[0], "Long")
            ns.stock.sell(stonk.symbol, position[0]);
            ns.toast("Sold " + stonk.symbol + " for " + position[1] + " across " + position[0] + " shares", 'info', null);
            ns.toast("GAIN: " + gain, 'info', null);
          }
        }

        if(ns.getPlayer().money > 10e9){

          let positiveForecasts = stockDetails.filter( stock => stock.forecast > .6 );
          let nonVolatileStocks = positiveForecasts.filter( stock => stock.volatility < .006);
          let orderedStock = nonVolatileStocks.sort( (a, b) => b.forecast - a.forecast)
          if(orderedStock.length > 0) {
            for (let stonk of orderedStock) {
              let position = ns.stock.getPosition(stonk.symbol)

              let maxPossible = ns.stock.getMaxShares(stonk.symbol) - position[0];
              let toPurchase = (ns.getPlayer().money-5e9)/stonk.price;
              toPurchase = Math.min(toPurchase, maxPossible)
              if(toPurchase > 0) {
                ns.stock.buy(stonk.symbol, toPurchase)
                ns.toast("Bought " + stonk.symbol + " at price " + stonk.price + " forecast: " + orderedStock[0].forecast)
              }
            }
          }
        }
      } else {
        if(ns.getPlayer().money > 30e9){
          ns.stock.purchase4SMarketDataTixApi();
        } else {
          // Track stocks here
        }
      }
    } else {
      //ns.tprint("INFO: We don't have TIX access");
      if (ns.getPlayer().money > 10e9) {
        ns.stock.purchaseTixApi()
      }
    }
  } else {
    //ns.tprint("INFO: We need to purchase a stock account");
  }
}