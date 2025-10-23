// Bitcoin API service voor echte wallet data
export interface BitcoinTransaction {
  hash: string;
  time: number;
  value: number; // in satoshis
  price: number; // EUR price at time of transaction
  currentValue: number; // Current EUR value
  profit: number; // Profit/loss in EUR
  profitPercent: number; // Profit/loss percentage
}

export interface BitcoinWallet {
  address: string;
  balance: number; // in BTC
  totalReceived: number; // in BTC
  totalSent: number; // in BTC
  transactionCount: number;
  firstSeen: number;
  lastSeen: number;
  transactions: BitcoinTransaction[];
}

export interface BitcoinPriceData {
  price: number;
  change24h: number;
  changePercent24h: number;
  marketCap: number;
  volume24h: number;
}

class BitcoinApiService {
  private baseUrl = 'https://blockstream.info/api';
  private priceUrl = 'https://api.coingecko.com/api/v3';

  // Haal wallet data op van Blockstream API
  async getWalletData(address: string): Promise<BitcoinWallet> {
    try {
      // Haal wallet info op
      const walletResponse = await fetch(`${this.baseUrl}/address/${address}`);
      const walletData = await walletResponse.json();

      // Haal transacties op
      const transactionsResponse = await fetch(`${this.baseUrl}/address/${address}/txs`);
      const transactions = await transactionsResponse.json();

      // Verwerk transacties
      const processedTransactions: BitcoinTransaction[] = [];
      
      for (const tx of transactions.slice(0, 10)) { // Laatste 10 transacties
        const txResponse = await fetch(`${this.baseUrl}/tx/${tx.txid}`);
        const txData = await txResponse.json();
        
        // Zoek de relevante output voor dit adres
        const relevantOutput = txData.vout.find((vout: any) => 
          vout.scriptpubkey_address === address
        );

        if (relevantOutput) {
          const valueInBTC = relevantOutput.value / 100000000; // Convert satoshis to BTC
          const priceAtTime = await this.getHistoricalPrice(tx.status.block_time);
          const currentPrice = await this.getCurrentPrice();
          
          processedTransactions.push({
            hash: tx.txid,
            time: tx.status.block_time,
            value: relevantOutput.value,
            price: priceAtTime,
            currentValue: valueInBTC * currentPrice,
            profit: (valueInBTC * currentPrice) - (valueInBTC * priceAtTime),
            profitPercent: ((currentPrice - priceAtTime) / priceAtTime) * 100
          });
        }
      }

      return {
        address,
        balance: walletData.chain_stats.funded_txo_sum / 100000000 - walletData.chain_stats.spent_txo_sum / 100000000,
        totalReceived: walletData.chain_stats.funded_txo_sum / 100000000,
        totalSent: walletData.chain_stats.spent_txo_sum / 100000000,
        transactionCount: walletData.chain_stats.tx_count,
        firstSeen: walletData.chain_stats.funded_txo_count > 0 ? Date.now() : 0,
        lastSeen: Date.now(),
        transactions: processedTransactions
      };
    } catch (error) {
      console.error('Error fetching wallet data:', error);
      throw new Error('Kon wallet data niet ophalen');
    }
  }

  // Haal historische Bitcoin prijs op
  private async getHistoricalPrice(timestamp: number): Promise<number> {
    try {
      const date = new Date(timestamp * 1000);
      const dateStr = date.toISOString().split('T')[0];
      
      // Gebruik lokale CSV data als beschikbaar
      const response = await fetch(`/eur/bitcoin-eur-complete-history.csv`);
      const csvText = await response.text();
      const lines = csvText.split('\n');
      
      // Zoek de dichtstbijzijnde datum
      for (let i = lines.length - 1; i >= 0; i--) {
        const line = lines[i];
        if (line.includes(dateStr)) {
          const price = parseFloat(line.split(';')[1].replace(',', '.'));
          return price;
        }
      }
      
      // Fallback naar CoinGecko
      const coinGeckoResponse = await fetch(
        `https://api.coingecko.com/api/v3/coins/bitcoin/history?date=${dateStr}`
      );
      const data = await coinGeckoResponse.json();
      return data.market_data?.current_price?.eur || 50000;
    } catch (error) {
      console.error('Error fetching historical price:', error);
      return 50000; // Fallback prijs
    }
  }

  // Haal huidige Bitcoin prijs op
  async getCurrentPrice(): Promise<number> {
    try {
      const response = await fetch(`${this.priceUrl}/simple/price?ids=bitcoin&vs_currencies=eur`);
      const data = await response.json();
      return data.bitcoin.eur;
    } catch (error) {
      console.error('Error fetching current price:', error);
      return 96640; // Fallback prijs
    }
  }

  // Haal live prijs data op voor chart
  async getPriceData(): Promise<BitcoinPriceData> {
    try {
      const response = await fetch(`${this.priceUrl}/simple/price?ids=bitcoin&vs_currencies=eur&include_24hr_change=true&include_market_cap=true&include_24hr_vol=true`);
      const data = await response.json();
      
      return {
        price: data.bitcoin.eur,
        change24h: data.bitcoin.eur_24h_change,
        changePercent24h: data.bitcoin.eur_24h_change,
        marketCap: data.bitcoin.eur_market_cap,
        volume24h: data.bitcoin.eur_24h_vol
      };
    } catch (error) {
      console.error('Error fetching price data:', error);
      return {
        price: 96640,
        change24h: 0,
        changePercent24h: 0,
        marketCap: 0,
        volume24h: 0
      };
    }
  }

  // Valideer Bitcoin adres
  validateBitcoinAddress(address: string): boolean {
    // Basis Bitcoin adres validatie
    const bitcoinRegex = /^[13][a-km-zA-HJ-NP-Z1-9]{25,34}$|^bc1[a-z0-9]{39,59}$/;
    return bitcoinRegex.test(address);
  }
}

export const bitcoinApiService = new BitcoinApiService();
