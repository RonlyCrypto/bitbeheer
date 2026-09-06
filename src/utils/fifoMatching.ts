// FIFO cost-basis matching for a wallet's buy/sell transactions.
//
// Walks the transaction history chronologically and, for every sell,
// draws BTC from the oldest still-open buy lot(s) first (first in, first
// out). This is computed once for the whole transaction list so multiple
// sells never double-claim the same buy lot, and buys that are only
// partially sold end up with an accurate "sold" vs "still held" split.
import { BitcoinTransaction } from '../services/bitcoinApiService';

export interface MatchedSellPortion {
  sellTx: BitcoinTransaction;
  btc: number;
  value: number; // btc * sell price
}

export interface MatchedBuyPortion {
  buyTx: BitcoinTransaction;
  btc: number;
  buyPrice: number;
}

export interface BuyFifoSummary {
  totalBtc: number;
  soldBtc: number;
  remainingBtc: number;
  soldValue: number; // what the sold portion actually sold for
  costBasisOfSold: number; // what the sold portion originally cost
  realizedProfit: number;
  realizedProfitPercent: number;
  matchedSells: MatchedSellPortion[];
  isFullySold: boolean;
}

export interface SellFifoSummary {
  soldBtc: number;
  proceeds: number;
  costBasis: number;
  profit: number;
  profitPercent: number;
  averageBuyPrice: number;
  matchedBuys: MatchedBuyPortion[];
}

export interface FifoResult {
  buys: Map<string, BuyFifoSummary>;
  sells: Map<string, SellFifoSummary>;
}

export function txKey(tx: BitcoinTransaction): string {
  return `${tx.hash || ''}-${tx.time || 0}`;
}

export function computeFifoMatches(transactions: BitcoinTransaction[]): FifoResult {
  const sorted = [...transactions].sort((a, b) => {
    if (a.time !== b.time) return a.time - b.time;
    return (a.hash || '').localeCompare(b.hash || '');
  });

  const openLots: { tx: BitcoinTransaction; remainingBtc: number }[] = [];
  const buys = new Map<string, BuyFifoSummary>();
  const sells = new Map<string, SellFifoSummary>();

  for (const tx of sorted) {
    if (tx.value > 0) {
      const btc = tx.value / 100000000;
      openLots.push({ tx, remainingBtc: btc });
      buys.set(txKey(tx), {
        totalBtc: btc,
        soldBtc: 0,
        remainingBtc: btc,
        soldValue: 0,
        costBasisOfSold: 0,
        realizedProfit: 0,
        realizedProfitPercent: 0,
        matchedSells: [],
        isFullySold: false,
      });
    } else if (tx.value < 0) {
      let sellRemaining = Math.abs(tx.value) / 100000000;
      const sellPrice = tx.price;
      let costBasis = 0;
      let matchedBtc = 0;
      const matchedBuys: MatchedBuyPortion[] = [];

      while (sellRemaining > 1e-12 && openLots.length > 0) {
        const lot = openLots[0];
        const take = Math.min(lot.remainingBtc, sellRemaining);
        if (take <= 1e-12) {
          openLots.shift();
          continue;
        }

        costBasis += take * lot.tx.price;
        matchedBtc += take;

        const buySummary = buys.get(txKey(lot.tx))!;
        const sellValueForLot = take * sellPrice;
        buySummary.soldBtc += take;
        buySummary.remainingBtc -= take;
        buySummary.soldValue += sellValueForLot;
        buySummary.costBasisOfSold += take * lot.tx.price;
        buySummary.matchedSells.push({ sellTx: tx, btc: take, value: sellValueForLot });

        matchedBuys.push({ buyTx: lot.tx, btc: take, buyPrice: lot.tx.price });

        lot.remainingBtc -= take;
        sellRemaining -= take;
        if (lot.remainingBtc <= 1e-12) openLots.shift();
      }

      for (const mb of matchedBuys) {
        const buySummary = buys.get(txKey(mb.buyTx))!;
        buySummary.isFullySold = buySummary.remainingBtc <= 1e-8;
        buySummary.realizedProfit = buySummary.soldValue - buySummary.costBasisOfSold;
        buySummary.realizedProfitPercent = buySummary.costBasisOfSold > 0
          ? (buySummary.realizedProfit / buySummary.costBasisOfSold) * 100
          : 0;
      }

      const proceeds = matchedBtc * sellPrice;
      const averageBuyPrice = matchedBtc > 0 ? costBasis / matchedBtc : 0;
      sells.set(txKey(tx), {
        soldBtc: matchedBtc,
        proceeds,
        costBasis,
        profit: proceeds - costBasis,
        profitPercent: averageBuyPrice > 0 ? ((sellPrice - averageBuyPrice) / averageBuyPrice) * 100 : 0,
        averageBuyPrice,
        matchedBuys,
      });
    }
  }

  return { buys, sells };
}
