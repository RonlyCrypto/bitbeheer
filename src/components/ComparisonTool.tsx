import { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, TrendingDown, Calculator, Coins, Target, Plus, Search, X } from 'lucide-react';
import { getCurrentPrice } from '../services/priceService';

interface TokenInfo {
  symbol: string;
  name: string;
  id: string; // Voor API calls
}

interface MarketCapData {
  symbol: string;
  name: string;
  currentPrice: number;
  marketCap: number;
  circulatingSupply: number;
  maxSupply?: number;
  totalSupply?: number;
  athPrice?: number;
  athMarketCap?: number;
  lastUpdated?: Date;
}

interface ComparisonResult {
  coin: string;
  currentPrice: number;
  targetPrice: number;
  priceMultiplier: number;
  marketCap: number;
  potentialGain: number;
  circulatingSupply: number;
  maxSupply?: number;
}

export default function MarketCapComparer() {
  const [tokenA, setTokenA] = useState('BTC');
  const [tokenB, setTokenB] = useState('ETH');
  const [multipleSelection, setMultipleSelection] = useState(false);
  const [compareTokens, setCompareTokens] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<ComparisonResult[]>([]);
  
  // Search functionality
  const [showSearchA, setShowSearchA] = useState(false);
  const [showSearchB, setShowSearchB] = useState(false);
  const [searchQueryA, setSearchQueryA] = useState('');
  const [searchQueryB, setSearchQueryB] = useState('');
  const [searchResultsA, setSearchResultsA] = useState<TokenInfo[]>([]);
  const [searchResultsB, setSearchResultsB] = useState<TokenInfo[]>([]);
  const [customTokens, setCustomTokens] = useState<{ [key: string]: MarketCapData }>({});
  const [tokenData, setTokenData] = useState<{ [key: string]: MarketCapData }>({});
  const [loadingTokens, setLoadingTokens] = useState<{ [key: string]: boolean }>({});
  const [amount, setAmount] = useState(1);
  const [useATH, setUseATH] = useState(false);

  // Uitgebreide token database met alle belangrijke tokens
  const tokenDatabase: TokenInfo[] = [
    // Major Cryptocurrencies
    { symbol: 'BTC', name: 'Bitcoin', id: 'bitcoin' },
    { symbol: 'ETH', name: 'Ethereum', id: 'ethereum' },
    { symbol: 'BNB', name: 'BNB', id: 'binancecoin' },
    { symbol: 'XRP', name: 'XRP', id: 'ripple' },
    { symbol: 'ADA', name: 'Cardano', id: 'cardano' },
    { symbol: 'SOL', name: 'Solana', id: 'solana' },
    { symbol: 'DOGE', name: 'Dogecoin', id: 'dogecoin' },
    { symbol: 'TRX', name: 'TRON', id: 'tron' },
    { symbol: 'DOT', name: 'Polkadot', id: 'polkadot' },
    { symbol: 'MATIC', name: 'Polygon', id: 'matic-network' },
    { symbol: 'AVAX', name: 'Avalanche', id: 'avalanche-2' },
    { symbol: 'SHIB', name: 'Shiba Inu', id: 'shiba-inu' },
    { symbol: 'LTC', name: 'Litecoin', id: 'litecoin' },
    { symbol: 'BCH', name: 'Bitcoin Cash', id: 'bitcoin-cash' },
    { symbol: 'UNI', name: 'Uniswap', id: 'uniswap' },
    { symbol: 'LINK', name: 'Chainlink', id: 'chainlink' },
    { symbol: 'ATOM', name: 'Cosmos', id: 'cosmos' },
    { symbol: 'XLM', name: 'Stellar', id: 'stellar' },
    { symbol: 'ALGO', name: 'Algorand', id: 'algorand' },
    { symbol: 'VET', name: 'VeChain', id: 'vechain' },
    { symbol: 'ICP', name: 'Internet Computer', id: 'internet-computer' },
    { symbol: 'FIL', name: 'Filecoin', id: 'filecoin' },
    { symbol: 'ETC', name: 'Ethereum Classic', id: 'ethereum-classic' },
    { symbol: 'NEAR', name: 'NEAR Protocol', id: 'near' },
    { symbol: 'FTM', name: 'Fantom', id: 'fantom' },
    { symbol: 'EOS', name: 'EOS', id: 'eos' },
    { symbol: 'NEO', name: 'NEO', id: 'neo' },
    { symbol: 'DASH', name: 'Dash', id: 'dash' },
    { symbol: 'ZEC', name: 'Zcash', id: 'zcash' },
    { symbol: 'XMR', name: 'Monero', id: 'monero' },
    
    // DeFi Tokens
    { symbol: 'AAVE', name: 'Aave', id: 'aave' },
    { symbol: 'COMP', name: 'Compound', id: 'compound-governance-token' },
    { symbol: 'MKR', name: 'Maker', id: 'maker' },
    { symbol: 'SNX', name: 'Synthetix', id: 'havven' },
    { symbol: 'YFI', name: 'Yearn Finance', id: 'yearn-finance' },
    { symbol: 'CRV', name: 'Curve DAO Token', id: 'curve-dao-token' },
    { symbol: '1INCH', name: '1inch', id: '1inch' },
    { symbol: 'SUSHI', name: 'SushiSwap', id: 'sushi' },
    { symbol: 'CAKE', name: 'PancakeSwap', id: 'pancakeswap-token' },
    { symbol: 'DYDX', name: 'dYdX', id: 'dydx' },
    { symbol: 'APEX', name: 'ApeX Protocol', id: 'apex-token' },
    { symbol: 'GMX', name: 'GMX', id: 'gmx' },
    { symbol: 'PERP', name: 'Perpetual Protocol', id: 'perpetual-protocol' },
    { symbol: 'GNS', name: 'Gains Network', id: 'gains-network' },
    { symbol: 'JOE', name: 'Trader Joe', id: 'joe' },
    { symbol: 'RAY', name: 'Raydium', id: 'raydium' },
    { symbol: 'SRM', name: 'Serum', id: 'serum' },
    { symbol: 'ORCA', name: 'Orca', id: 'orca' },
    { symbol: 'JUP', name: 'Jupiter', id: 'jupiter-exchange-solana' },
    { symbol: 'MAGIC', name: 'MAGIC', id: 'magic' },
    { symbol: 'ARB', name: 'Arbitrum', id: 'arbitrum' },
    { symbol: 'OP', name: 'Optimism', id: 'optimism' },
    { symbol: 'IMX', name: 'Immutable X', id: 'immutable-x' },
    { symbol: 'LRC', name: 'Loopring', id: 'loopring' },
    { symbol: 'ZKS', name: 'zkSync', id: 'zksync' },
    { symbol: 'STARK', name: 'StarkNet', id: 'starknet-token' },
    
    // Stablecoins
    { symbol: 'USDT', name: 'Tether', id: 'tether' },
    { symbol: 'USDC', name: 'USD Coin', id: 'usd-coin' },
    { symbol: 'BUSD', name: 'Binance USD', id: 'binance-usd' },
    { symbol: 'DAI', name: 'Dai', id: 'dai' },
    { symbol: 'FRAX', name: 'Frax', id: 'frax' },
    { symbol: 'LUSD', name: 'Liquity USD', id: 'liquity-usd' },
    { symbol: 'SUSD', name: 'Synthetix USD', id: 'nusd' },
    { symbol: 'GUSD', name: 'Gemini Dollar', id: 'gemini-dollar' },
    { symbol: 'TUSD', name: 'TrueUSD', id: 'true-usd' },
    { symbol: 'USDP', name: 'Pax Dollar', id: 'paxos-standard' },
    
    // Gaming & NFT Tokens
    { symbol: 'SAND', name: 'The Sandbox', id: 'the-sandbox' },
    { symbol: 'MANA', name: 'Decentraland', id: 'decentraland' },
    { symbol: 'ENJ', name: 'Enjin Coin', id: 'enjincoin' },
    { symbol: 'CHZ', name: 'Chiliz', id: 'chiliz' },
    { symbol: 'AXS', name: 'Axie Infinity', id: 'axie-infinity' },
    { symbol: 'SLP', name: 'Smooth Love Potion', id: 'smooth-love-potion' },
    { symbol: 'GALA', name: 'Gala', id: 'gala' },
    { symbol: 'ILV', name: 'Illuvium', id: 'illuvium' },
    { symbol: 'YGG', name: 'Yield Guild Games', id: 'yield-guild-games' },
    { symbol: 'ALICE', name: 'My Neighbor Alice', id: 'my-neighbor-alice' },
    { symbol: 'TLM', name: 'Alien Worlds', id: 'alien-worlds' },
    { symbol: 'CROWN', name: 'Crown', id: 'crown' },
    { symbol: 'UFO', name: 'UFO Gaming', id: 'ufo-gaming' },
    { symbol: 'VRA', name: 'Verasity', id: 'verasity' },
    { symbol: 'WAXP', name: 'WAX', id: 'wax' },
    { symbol: 'FLOW', name: 'Flow', id: 'flow' },
    { symbol: 'IMX', name: 'Immutable X', id: 'immutable-x' },
    
    // Exchange Tokens
    { symbol: 'FTT', name: 'FTX Token', id: 'ftx-token' },
    { symbol: 'LEO', name: 'LEO Token', id: 'leo-token' },
    { symbol: 'CRO', name: 'Cronos', id: 'crypto-com-chain' },
    { symbol: 'KCS', name: 'KuCoin Token', id: 'kucoin-shares' },
    { symbol: 'HT', name: 'Huobi Token', id: 'huobi-token' },
    { symbol: 'OKB', name: 'OKB', id: 'okb' },
    { symbol: 'GT', name: 'GateToken', id: 'gatetoken' },
    { symbol: 'BGB', name: 'Bitget Token', id: 'bitget-token' },
    { symbol: 'MX', name: 'MX Token', id: 'mx-token' },
    { symbol: 'ZB', name: 'ZB Token', id: 'zb-token' },
    
    // Meme Tokens
    { symbol: 'PEPE', name: 'Pepe', id: 'pepe' },
    { symbol: 'FLOKI', name: 'Floki', id: 'floki' },
    { symbol: 'BONK', name: 'Bonk', id: 'bonk' },
    { symbol: 'WIF', name: 'dogwifhat', id: 'dogwifcoin' },
    { symbol: 'BABYDOGE', name: 'Baby Doge Coin', id: 'baby-doge-coin' },
    { symbol: 'ELON', name: 'Dogelon Mars', id: 'dogelon-mars' },
    { symbol: 'KISHU', name: 'Kishu Inu', id: 'kishu-inu' },
    { symbol: 'AKITA', name: 'Akita Inu', id: 'akita-inu' },
    { symbol: 'SAITAMA', name: 'Saitama Inu', id: 'saitama-inu' },
    { symbol: 'SHIB', name: 'Shiba Inu', id: 'shiba-inu' },
    
    // AI & Big Data Tokens
    { symbol: 'FET', name: 'Fetch.ai', id: 'fetch-ai' },
    { symbol: 'AGIX', name: 'SingularityNET', id: 'singularitynet' },
    { symbol: 'OCEAN', name: 'Ocean Protocol', id: 'ocean-protocol' },
    { symbol: 'GRT', name: 'The Graph', id: 'the-graph' },
    { symbol: 'BAND', name: 'Band Protocol', id: 'band-protocol' },
    { symbol: 'API3', name: 'API3', id: 'api3' },
    { symbol: 'UMA', name: 'UMA', id: 'uma' },
    { symbol: 'TRB', name: 'Tellor', id: 'tellor' },
    { symbol: 'DIA', name: 'DIA', id: 'dia-data' },
    { symbol: 'NMR', name: 'Numeraire', id: 'numeraire' },
    
    // Privacy Coins
    { symbol: 'XMR', name: 'Monero', id: 'monero' },
    { symbol: 'ZEC', name: 'Zcash', id: 'zcash' },
    { symbol: 'DASH', name: 'Dash', id: 'dash' },
    { symbol: 'DCR', name: 'Decred', id: 'decred' },
    { symbol: 'ZEN', name: 'Horizen', id: 'horizen' },
    { symbol: 'BEAM', name: 'Beam', id: 'beam' },
    { symbol: 'GRIN', name: 'Grin', id: 'grin' },
    { symbol: 'SC', name: 'Siacoin', id: 'siacoin' },
    { symbol: 'XVG', name: 'Verge', id: 'verge' },
    { symbol: 'PIVX', name: 'PIVX', id: 'pivx' },
    
    // Storage & Infrastructure
    { symbol: 'FIL', name: 'Filecoin', id: 'filecoin' },
    { symbol: 'SC', name: 'Siacoin', id: 'siacoin' },
    { symbol: 'STORJ', name: 'Storj', id: 'storj' },
    { symbol: 'AR', name: 'Arweave', id: 'arweave' },
    { symbol: 'BTT', name: 'BitTorrent', id: 'bittorrent' },
    { symbol: 'CHIA', name: 'Chia', id: 'chia' },
    { symbol: 'HNT', name: 'Helium', id: 'helium' },
    { symbol: 'IOTX', name: 'IoTeX', id: 'iotex' },
    { symbol: 'ANKR', name: 'Ankr', id: 'ankr' },
    { symbol: 'SKL', name: 'SKALE', id: 'skale' },
    
    // Oracle Tokens
    { symbol: 'LINK', name: 'Chainlink', id: 'chainlink' },
    { symbol: 'BAND', name: 'Band Protocol', id: 'band-protocol' },
    { symbol: 'API3', name: 'API3', id: 'api3' },
    { symbol: 'UMA', name: 'UMA', id: 'uma' },
    { symbol: 'TRB', name: 'Tellor', id: 'tellor' },
    { symbol: 'DIA', name: 'DIA', id: 'dia-data' },
    { symbol: 'NEST', name: 'NEST Protocol', id: 'nest' },
    { symbol: 'REP', name: 'Augur', id: 'augur' },
    { symbol: 'NMR', name: 'Numeraire', id: 'numeraire' },
    { symbol: 'COTI', name: 'COTI', id: 'coti' }
  ];

  // Combine loaded token data with custom tokens
  const allTokens = { ...tokenData, ...customTokens };

  // JSON Storage functions
  const saveTokenDataToJSON = (data: { [key: string]: MarketCapData }) => {
    try {
      const jsonData = JSON.stringify(data, null, 2);
      localStorage.setItem('tokenDataCache', jsonData);
      console.log('Token data saved to localStorage');
    } catch (error) {
      console.error('Error saving token data:', error);
    }
  };

  const loadTokenDataFromJSON = (): { [key: string]: MarketCapData } => {
    try {
      const jsonData = localStorage.getItem('tokenDataCache');
      if (jsonData) {
        const data = JSON.parse(jsonData);
        // Convert date strings back to Date objects
        Object.keys(data).forEach(key => {
          if (data[key].lastUpdated) {
            data[key].lastUpdated = new Date(data[key].lastUpdated);
          }
        });
        console.log('Token data loaded from localStorage:', Object.keys(data));
        return data;
      }
    } catch (error) {
      console.error('Error loading token data:', error);
    }
    return {};
  };


  // Functie om token data op te halen van CoinGecko API
  const fetchTokenData = async (tokenId: string, symbol: string): Promise<MarketCapData | null> => {
    try {
      console.log(`Fetching data for ${symbol} with ID: ${tokenId}`);
      
      // Haal basis prijs en market cap data op
      const priceResponse = await fetch(
        `https://api.coingecko.com/api/v3/simple/price?ids=${tokenId}&vs_currencies=usd&include_market_cap=true&include_24hr_change=true`
      );
      
      if (!priceResponse.ok) {
        console.error(`Price API failed for ${symbol}:`, priceResponse.status, priceResponse.statusText);
        throw new Error(`Failed to fetch price data: ${priceResponse.status}`);
      }
      
      const priceData = await priceResponse.json();
      console.log(`Price data for ${symbol}:`, priceData);
      
      const tokenPriceData = priceData[tokenId];
      
      if (!tokenPriceData) {
        console.error(`No price data found for ${symbol} with ID ${tokenId}`);
        throw new Error(`Token price data not found for ${tokenId}`);
      }
      
      // Haal supply data op
      const supplyResponse = await fetch(
        `https://api.coingecko.com/api/v3/coins/${tokenId}?localization=false&tickers=false&market_data=true&community_data=false&developer_data=false&sparkline=false`
      );
      
      let circulatingSupply = tokenPriceData.usd_market_cap / tokenPriceData.usd;
      let maxSupply: number | undefined;
      let totalSupply: number | undefined;
      let athPrice: number | undefined;
      let athMarketCap: number | undefined;
      
      if (supplyResponse.ok) {
        const supplyData = await supplyResponse.json();
        const marketData = supplyData.market_data;
        
        if (marketData) {
          // Gebruik de echte circulating supply van CoinGecko
          circulatingSupply = marketData.circulating_supply || circulatingSupply;
          maxSupply = marketData.max_supply;
          totalSupply = marketData.total_supply;
          
          // Haal ATH data op
          athPrice = marketData.ath?.usd;
          athMarketCap = athPrice ? athPrice * circulatingSupply : undefined;
          
          // Debug log om te zien wat we krijgen
          console.log(`${symbol} supply data:`, {
            circulating: marketData.circulating_supply,
            max: marketData.max_supply,
            total: marketData.total_supply,
            ath: athPrice,
            athMarketCap: athMarketCap,
            calculated: tokenPriceData.usd_market_cap / tokenPriceData.usd
          });
        }
      }
      
      return {
        symbol: symbol,
        name: tokenDatabase.find(t => t.symbol === symbol)?.name || symbol,
        currentPrice: tokenPriceData.usd,
        marketCap: tokenPriceData.usd_market_cap,
        circulatingSupply: circulatingSupply,
        maxSupply: maxSupply,
        totalSupply: totalSupply,
        athPrice: athPrice,
        athMarketCap: athMarketCap,
        lastUpdated: new Date()
      };
    } catch (error) {
      console.error(`Error fetching data for ${symbol}:`, error);
      return null;
    }
  };

  // Functie om token data te laden
  const loadTokenData = async (symbol: string, forceUpdate: boolean = false) => {
    console.log(`loadTokenData called for ${symbol}${forceUpdate ? ' (forced update)' : ''}`);
    if (allTokens[symbol] || loadingTokens[symbol]) {
      if (!forceUpdate) {
        console.log(`${symbol} already loaded or loading, skipping`);
        return;
      }
    }
    
    // Check if data is recent (less than 5 minutes old) - skip if not forced
    if (!forceUpdate) {
      const existingData = allTokens[symbol];
      if (existingData && existingData.lastUpdated) {
        const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
        if (existingData.lastUpdated > fiveMinutesAgo) {
          console.log(`${symbol} data is recent, skipping refresh`);
          return;
        }
      }
    }
    
    setLoadingTokens(prev => ({ ...prev, [symbol]: true }));
    
    const tokenInfo = tokenDatabase.find(t => t.symbol === symbol);
    if (!tokenInfo) {
      setLoadingTokens(prev => ({ ...prev, [symbol]: false }));
      return;
    }
    
    console.log(`Fetching fresh data for ${symbol}`);
    const data = await fetchTokenData(tokenInfo.id, symbol);
    if (data) {
      setTokenData(prev => {
        const newData = { ...prev, [symbol]: data };
        // Automatisch opslaan in JSON
        saveTokenDataToJSON(newData);
        console.log(`Saved ${symbol} data to JSON cache`);
        return newData;
      });
    }
    
    setLoadingTokens(prev => ({ ...prev, [symbol]: false }));
  };

  // Functie om specifieke token te forceren om te updaten
  const forceUpdateToken = async (symbol: string) => {
    console.log(`Force updating ${symbol}`);
    
    // Clear cached data for this token to force fresh fetch
    if (allTokens[symbol]) {
      setTokenData(prev => {
        const newData = { ...prev };
        delete newData[symbol];
        saveTokenDataToJSON(newData);
        return newData;
      });
    }
    
    await loadTokenData(symbol, true);
  };

  const runComparison = async () => {
    setLoading(true);
    try {
      console.log('runComparison called with:', { tokenA, tokenB, allTokens: Object.keys(allTokens) });
      const tokenBData = allTokens[tokenB];
      console.log('tokenBData:', tokenBData);
      if (!tokenBData) {
        console.log('No tokenBData found, returning early');
        return;
      }

      // Gebruik ATH market cap als useATH true is, anders huidige market cap
      const targetMarketCap = useATH && tokenBData.athMarketCap 
        ? tokenBData.athMarketCap 
        : tokenBData.marketCap;

      const comparisonResults: ComparisonResult[] = [];

      if (multipleSelection && compareTokens.length > 0) {
        // Multiple selection mode
        compareTokens.forEach(coinSymbol => {
          const coinData = allTokens[coinSymbol];
          if (!coinData || coinSymbol === tokenB) return;

          // Bereken wat de prijs zou zijn als deze coin dezelfde market cap heeft als de target coin
          // Formule: Marktkapitalisatie / Voorraad in omloop = Prijs
          const targetPrice = targetMarketCap / coinData.circulatingSupply;
          const priceMultiplier = targetPrice / coinData.currentPrice;
          const potentialGain = ((targetPrice - coinData.currentPrice) / coinData.currentPrice) * 100;
          
          console.log(`${coinSymbol} calculation:`, {
            currentPrice: coinData.currentPrice,
            currentMarketCap: coinData.marketCap,
            circulatingSupply: coinData.circulatingSupply,
            targetMarketCap: targetMarketCap,
            useATH: useATH,
            targetPrice: targetPrice,
            multiplier: priceMultiplier
          });

        comparisonResults.push({
          coin: coinSymbol,
          currentPrice: coinData.currentPrice,
          targetPrice: targetPrice,
          priceMultiplier: priceMultiplier,
          marketCap: coinData.marketCap,
          potentialGain: potentialGain,
          circulatingSupply: coinData.circulatingSupply,
          maxSupply: coinData.maxSupply
        });
        });
      } else {
    // Single comparison mode
    const tokenAData = allTokens[tokenA];
    if (!tokenAData || tokenA === tokenB) return;

    // Bereken wat de prijs zou zijn als deze coin dezelfde market cap heeft als de target coin
    // Formule: Marktkapitalisatie / Voorraad in omloop = Prijs
    const targetPrice = targetMarketCap / tokenAData.circulatingSupply;
        const priceMultiplier = targetPrice / tokenAData.currentPrice;
        const potentialGain = ((targetPrice - tokenAData.currentPrice) / tokenAData.currentPrice) * 100;
        
        console.log(`${tokenA} calculation:`, {
          currentPrice: tokenAData.currentPrice,
          currentMarketCap: tokenAData.marketCap,
          circulatingSupply: tokenAData.circulatingSupply,
          targetMarketCap: targetMarketCap,
          useATH: useATH,
          targetPrice: targetPrice,
          multiplier: priceMultiplier
        });

        comparisonResults.push({
          coin: tokenA,
          currentPrice: tokenAData.currentPrice,
          targetPrice: targetPrice,
          priceMultiplier: priceMultiplier,
          marketCap: tokenAData.marketCap,
          potentialGain: potentialGain,
          circulatingSupply: tokenAData.circulatingSupply,
          maxSupply: tokenAData.maxSupply
        });
      }

      // Sorteer op potential gain (hoogste eerst)
      comparisonResults.sort((a, b) => b.potentialGain - a.potentialGain);

      setResults(comparisonResults);
    } catch (error) {
      console.error('Market cap comparison error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    runComparison();
  }, [tokenA, tokenB, compareTokens, multipleSelection, allTokens, useATH]);

  // Load cached data from localStorage on startup
  useEffect(() => {
    const cachedData = loadTokenDataFromJSON();
    if (Object.keys(cachedData).length > 0) {
      // Remove old APEX data if it exists to force fresh fetch
      if (cachedData['APEX']) {
        delete cachedData['APEX'];
        console.log('Removed old APEX data from cache');
      }
      setTokenData(cachedData);
      console.log('Loaded cached token data:', Object.keys(cachedData));
    }
  }, []);

  // Background update system - check for price changes every 2 minutes
  useEffect(() => {
    const backgroundUpdate = async () => {
      const cachedData = loadTokenDataFromJSON();
      const tokensToUpdate: string[] = [];
      
      // Check which tokens need updating (older than 2 minutes)
      Object.keys(cachedData).forEach(symbol => {
        const tokenData = cachedData[symbol];
        if (tokenData.lastUpdated) {
          const twoMinutesAgo = new Date(Date.now() - 2 * 60 * 1000);
          if (tokenData.lastUpdated < twoMinutesAgo) {
            tokensToUpdate.push(symbol);
          }
        }
      });
      
      // Update tokens in background
      if (tokensToUpdate.length > 0) {
        console.log('Background updating tokens:', tokensToUpdate);
        for (const symbol of tokensToUpdate) {
          const tokenInfo = tokenDatabase.find(t => t.symbol === symbol);
          if (tokenInfo) {
            try {
              const newData = await fetchTokenData(tokenInfo.id, symbol);
              if (newData) {
                setTokenData(prev => {
                  const updatedData = { ...prev, [symbol]: newData };
                  saveTokenDataToJSON(updatedData);
                  return updatedData;
                });
              }
            } catch (error) {
              console.error(`Background update failed for ${symbol}:`, error);
            }
          }
        }
      }
    };

    // Run background update every 2 minutes
    const interval = setInterval(backgroundUpdate, 2 * 60 * 1000);
    
    // Run initial background update after 30 seconds
    const initialTimeout = setTimeout(backgroundUpdate, 30 * 1000);
    
    return () => {
      clearInterval(interval);
      clearTimeout(initialTimeout);
    };
  }, []);

  // Initial data loading
  useEffect(() => {
    loadTokenData(tokenA);
    loadTokenData(tokenB);
    
    // Force update APEX token specifically
    setTimeout(() => {
      forceUpdateToken('APEX');
    }, 2000);
  }, []);

  // Load token data when tokens change (with smart caching)
  useEffect(() => {
    if (tokenA) loadTokenData(tokenA);
    if (tokenB) loadTokenData(tokenB);
    compareTokens.forEach(coin => loadTokenData(coin));
  }, [tokenA, tokenB, compareTokens]);

  // Search functionality for Token A
  useEffect(() => {
    if (searchQueryA.length > 0) {
      const query = searchQueryA.toLowerCase();
      const filtered = tokenDatabase.filter(token => {
        const symbol = token.symbol.toLowerCase();
        const name = token.name.toLowerCase();
        
        // Exact match voor symbol (hoogste prioriteit)
        if (symbol === query) {
          return true;
        }
        
        // Begint met query (hoge prioriteit)
        if (symbol.startsWith(query) || name.startsWith(query)) {
          return true;
        }
        
        // Bevat query (lage prioriteit)
        if (symbol.includes(query) || name.includes(query)) {
          return true;
        }
        
        return false;
      });
      
      // Sorteer resultaten: exact match eerst, dan startsWith, dan contains
      const sorted = filtered.sort((a, b) => {
        const aSymbol = a.symbol.toLowerCase();
        const bSymbol = b.symbol.toLowerCase();
        const aName = a.name.toLowerCase();
        const bName = b.name.toLowerCase();
        
        // Exact match heeft hoogste prioriteit
        if (aSymbol === query) return -1;
        if (bSymbol === query) return 1;
        
        // StartsWith heeft tweede prioriteit
        if (aSymbol.startsWith(query) && !bSymbol.startsWith(query)) return -1;
        if (bSymbol.startsWith(query) && !aSymbol.startsWith(query)) return 1;
        
        // Alphabetische volgorde voor de rest
        return aSymbol.localeCompare(bSymbol);
      });
      
      setSearchResultsA(sorted);
    } else {
      setSearchResultsA([]);
    }
  }, [searchQueryA]);

  // Search functionality for Token B
  useEffect(() => {
    if (searchQueryB.length > 0) {
      const query = searchQueryB.toLowerCase();
      const filtered = tokenDatabase.filter(token => {
        const symbol = token.symbol.toLowerCase();
        const name = token.name.toLowerCase();
        
        // Exact match voor symbol (hoogste prioriteit)
        if (symbol === query) {
          return true;
        }
        
        // Begint met query (hoge prioriteit)
        if (symbol.startsWith(query) || name.startsWith(query)) {
          return true;
        }
        
        // Bevat query (lage prioriteit)
        if (symbol.includes(query) || name.includes(query)) {
          return true;
        }
        
        return false;
      });
      
      // Sorteer resultaten: exact match eerst, dan startsWith, dan contains
      const sorted = filtered.sort((a, b) => {
        const aSymbol = a.symbol.toLowerCase();
        const bSymbol = b.symbol.toLowerCase();
        const aName = a.name.toLowerCase();
        const bName = b.name.toLowerCase();
        
        // Exact match heeft hoogste prioriteit
        if (aSymbol === query) return -1;
        if (bSymbol === query) return 1;
        
        // StartsWith heeft tweede prioriteit
        if (aSymbol.startsWith(query) && !bSymbol.startsWith(query)) return -1;
        if (bSymbol.startsWith(query) && !aSymbol.startsWith(query)) return 1;
        
        // Alphabetische volgorde voor de rest
        return aSymbol.localeCompare(bSymbol);
      });
      
      setSearchResultsB(sorted);
    } else {
      setSearchResultsB([]);
    }
  }, [searchQueryB]);

  const addCustomToken = (symbol: string, name: string, price: number, marketCap: number, supply: number) => {
    const newToken: MarketCapData = {
      symbol: symbol.toUpperCase(),
      name: name,
      currentPrice: price,
      marketCap: marketCap,
      circulatingSupply: supply
    };
    
    setCustomTokens(prev => ({
      ...prev,
      [symbol.toUpperCase()]: newToken
    }));
    
    setSearchQuery('');
    setShowSearch(false);
  };

  const removeCustomToken = (symbol: string) => {
    setCustomTokens(prev => {
      const newTokens = { ...prev };
      delete newTokens[symbol];
      return newTokens;
    });
    
    setCompareCoins(prev => prev.filter(coin => coin !== symbol));
  };

  const addCompareToken = (coinSymbol: string) => {
    console.log('addCompareToken called with:', coinSymbol, 'Current compareTokens:', compareTokens);
    if (coinSymbol === tokenB) {
      console.log('Cannot add Token B to compare list');
      return; // Kan token B niet toevoegen aan vergelijking
    }
    if (compareTokens.includes(coinSymbol)) {
      console.log('Token already in compare list:', coinSymbol);
      return; // Kan token niet dubbel toevoegen
    }
    
    console.log('Adding token to compare list:', coinSymbol);
    // Load token data when adding to comparison
    loadTokenData(coinSymbol);
    setCompareTokens(prev => {
      const newList = [...prev, coinSymbol];
      console.log('New compare tokens list:', newList);
      return newList;
    });
    
    // Automatisch berekenen na toevoegen
    setTimeout(() => {
      runComparison();
    }, 100);
  };

  const removeCompareToken = (coinSymbol: string) => {
    setCompareTokens(prev => prev.filter(coin => coin !== coinSymbol));
    
    // Automatisch herberekenen na verwijderen
    setTimeout(() => {
      runComparison();
    }, 100);
  };

  const getCoinIcon = (coinSymbol: string) => {
    return <Coins className="w-5 h-5" />;
  };

  const getCoinColor = (potentialGain: number) => {
    if (potentialGain > 1000) return 'from-green-500 to-green-600';
    if (potentialGain > 100) return 'from-blue-500 to-blue-600';
    if (potentialGain > 0) return 'from-yellow-500 to-yellow-600';
    return 'from-red-500 to-red-600';
  };

  const formatPrice = (price: number) => {
    if (price < 0.01) return `$${price.toFixed(6)}`;
    if (price < 1) return `$${price.toFixed(4)}`;
    if (price < 100) return `$${price.toFixed(2)}`;
    return `$${price.toLocaleString('nl-NL', { maximumFractionDigits: 0 })}`;
  };

  const formatMarketCap = (marketCap: number) => {
    if (marketCap >= 1e12) return `$${(marketCap / 1e12).toFixed(1)}T`;
    if (marketCap >= 1e9) return `$${(marketCap / 1e9).toFixed(1)}B`;
    if (marketCap >= 1e6) return `$${(marketCap / 1e6).toFixed(1)}M`;
    return `$${marketCap.toLocaleString('nl-NL')}`;
  };

  const formatSupply = (supply: number) => {
    if (supply >= 1e12) return `${(supply / 1e12).toFixed(2)}T`;
    if (supply >= 1e9) return `${(supply / 1e9).toFixed(2)}B`;
    if (supply >= 1e6) return `${(supply / 1e6).toFixed(2)}M`;
    if (supply >= 1e3) return `${(supply / 1e3).toFixed(2)}K`;
    return supply.toLocaleString('nl-NL');
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-8">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Show the price of A with the market cap of B</h2>
        <p className="text-gray-600">Vergelijk cryptocurrency prijzen gebaseerd op market cap</p>
      </div>

      {/* Main Comparison Interface */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Token A Selector */}
        <div className="space-y-4">
          <div className="text-center">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Token A</h3>
            <p className="text-sm text-gray-600">
              {multipleSelection 
                ? "Klik om tokens toe te voegen aan vergelijking" 
                : "De token waarvan je de prijs wilt zien"
              }
            </p>
          </div>
          
          <div className="relative">
            <div 
              className={`w-full p-4 border-2 rounded-xl cursor-pointer transition-all ${
                multipleSelection 
                  ? 'border-green-300 hover:border-green-400 bg-green-50' 
                  : 'border-gray-300 hover:border-blue-400 bg-white'
              }`}
              onClick={() => setShowSearchA(!showSearchA)}
            >
              <div className="flex items-center justify-between">
                <div>
                  {multipleSelection ? (
                    <div>
                      <div className="font-semibold text-lg text-green-700">
                        {compareTokens.length > 0 ? `${compareTokens.length} tokens geselecteerd` : 'Klik om tokens toe te voegen'}
                      </div>
                      <div className="text-sm text-green-600">
                        {compareTokens.length > 0 ? compareTokens.join(', ') : 'Add tokens voor vergelijking'}
                      </div>
                    </div>
                  ) : (
                    <div>
                      <div className="font-semibold text-lg">{tokenA}</div>
                      <div className="text-sm text-gray-600">{tokenDatabase.find(t => t.symbol === tokenA)?.name}</div>
                      {allTokens[tokenA] && (
                        <div className="text-sm text-gray-500 mt-1">
                          {formatPrice(allTokens[tokenA].currentPrice)} • {formatMarketCap(allTokens[tokenA].marketCap)}
                          <div className="text-xs text-gray-400 mt-1">
                            Circulating: {formatSupply(allTokens[tokenA].circulatingSupply)}
                            {allTokens[tokenA].maxSupply && ` • Max: ${formatSupply(allTokens[tokenA].maxSupply!)}`}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
                <Search className={`w-5 h-5 ${multipleSelection ? 'text-green-500' : 'text-gray-400'}`} />
              </div>
            </div>
            
            {/* Inline Search Results - Show token cards here */}
            {!multipleSelection && results.length > 0 && (
              <div className="mt-4">
                {results.map((result, index) => (
                  <div key={index} className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-4 border border-gray-200 shadow-sm">
                    <div className="flex items-center gap-3 mb-4">
                      <div className={`bg-gradient-to-r ${getCoinColor(result.potentialGain)} p-2 rounded-lg text-white`}>
                        {getCoinIcon(result.coin)}
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-900">{allTokens[result.coin]?.name}</h4>
                        <p className="text-sm text-gray-600">({result.coin})</p>
                      </div>
                    </div>
                    
                    {/* Huidige vs Target Data - Links/Rechts Layout */}
                    <div className="grid grid-cols-2 gap-6">
                      {/* Links: Huidige Data */}
                      <div className="space-y-3">
                        <h5 className="font-semibold text-gray-800 text-sm border-b border-gray-300 pb-1">Huidige Data</h5>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Prijs:</span>
                            <span className="font-bold text-gray-900">{formatPrice(result.currentPrice)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Market Cap:</span>
                            <span className="font-bold text-gray-900">{formatMarketCap(result.marketCap)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Circulating Supply:</span>
                            <span className="font-bold text-gray-900">{formatSupply(result.circulatingSupply)}</span>
                          </div>
                          {result.maxSupply && (
                            <div className="flex justify-between">
                              <span className="text-gray-600">Max Supply:</span>
                              <span className="font-bold text-gray-900">{formatSupply(result.maxSupply)}</span>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      {/* Rechts: Target Data */}
                      <div className="space-y-3">
                        <h5 className="font-semibold text-blue-800 text-sm border-b border-blue-300 pb-1">Met {tokenB} Market Cap</h5>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Target Prijs:</span>
                            <span className="font-bold text-blue-600">{formatPrice(result.targetPrice)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Market Cap:</span>
                            <span className="font-bold text-blue-600">{formatMarketCap(allTokens[tokenB]?.marketCap || 0)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Potentiële Winst:</span>
                            <span className={`font-bold ${result.potentialGain >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                              {result.potentialGain >= 0 ? '+' : ''}{result.potentialGain.toFixed(1)}%
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Multiplier:</span>
                            <span className="font-bold text-blue-600">{result.priceMultiplier.toFixed(1)}x</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {showSearchA && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-300 rounded-xl shadow-lg z-10 max-h-80 overflow-y-auto">
                <div className="p-4 border-b">
                  <input
                    type="text"
                    placeholder="Zoek token A..."
                    value={searchQueryA}
                    onChange={(e) => setSearchQueryA(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    autoFocus
                  />
                </div>
                <div className="max-h-60 overflow-y-auto">
                  {searchResultsA.map(token => (
                    <div
                      key={token.symbol}
                      className="p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                      onClick={() => {
                        console.log('Token clicked:', token.symbol, 'Multiple selection:', multipleSelection);
                        if (multipleSelection) {
                          // In multiple selection mode, add to compare list
                          console.log('Adding to compare list:', token.symbol);
                          addCompareToken(token.symbol);
                        } else {
                          // In single mode, set as Token A
                          console.log('Setting Token A:', token.symbol);
                          setTokenA(token.symbol);
                          console.log('Token A set to:', token.symbol);
                        }
                        setShowSearchA(false);
                        setSearchQueryA('');
                      }}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="font-medium">{token.symbol}</div>
                          <div className="text-sm text-gray-600">{token.name}</div>
                          {allTokens[token.symbol] && (
                            <div className="text-xs text-gray-500 mt-1">
                              Market Cap: {formatMarketCap(allTokens[token.symbol].marketCap)}
                            </div>
                          )}
                        </div>
                        <div className="text-right text-sm text-gray-500 ml-4">
                          {allTokens[token.symbol] ? (
                            <>
                              <div className="font-semibold">{formatPrice(allTokens[token.symbol].currentPrice)}</div>
                              <div className="text-xs">
                                Circulating: {formatSupply(allTokens[token.symbol].circulatingSupply)}
                              </div>
                              {allTokens[token.symbol].maxSupply && (
                                <div className="text-xs">
                                  Max: {formatSupply(allTokens[token.symbol].maxSupply)}
                                </div>
                              )}
                              {allTokens[token.symbol].athPrice && (
                                <div className="text-xs text-orange-600">
                                  ATH: {formatPrice(allTokens[token.symbol].athPrice)}
                                </div>
                              )}
                            </>
                          ) : (
                            <div className="text-xs text-gray-400">
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  loadTokenData(token.symbol);
                                }}
                                className="text-blue-500 hover:text-blue-700 px-2 py-1 rounded bg-blue-50 hover:bg-blue-100"
                              >
                                Load Data
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Token B Selector */}
        <div className="space-y-4">
          <div className="text-center">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Token B</h3>
            <p className="text-sm text-gray-600">De token waarvan je de market cap gebruikt</p>
          </div>
          
          <div className="relative">
            <div 
              className="w-full p-4 border-2 border-gray-300 rounded-xl cursor-pointer hover:border-green-400 transition-all bg-white"
              onClick={() => setShowSearchB(!showSearchB)}
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-semibold text-lg">{tokenB}</div>
                  <div className="text-sm text-gray-600">{tokenDatabase.find(t => t.symbol === tokenB)?.name}</div>
                  {allTokens[tokenB] && (
                    <div className="text-sm text-gray-500 mt-1">
                      {formatPrice(allTokens[tokenB].currentPrice)} • {formatMarketCap(allTokens[tokenB].marketCap)}
                      <div className="text-xs text-gray-400 mt-1">
                        Circulating: {formatSupply(allTokens[tokenB].circulatingSupply)}
                        {allTokens[tokenB].maxSupply && ` • Max: ${formatSupply(allTokens[tokenB].maxSupply!)}`}
                      </div>
                    </div>
                  )}
                </div>
                <Search className="w-5 h-5 text-gray-400" />
              </div>
            </div>

            {showSearchB && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-300 rounded-xl shadow-lg z-10 max-h-80 overflow-y-auto">
                <div className="p-4 border-b">
                  <input
                    type="text"
                    placeholder="Zoek token B..."
                    value={searchQueryB}
                    onChange={(e) => setSearchQueryB(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    autoFocus
                  />
                </div>
                <div className="max-h-60 overflow-y-auto">
                  {searchResultsB.map(token => (
                    <div
                      key={token.symbol}
                      className="p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                      onClick={() => {
                        setTokenB(token.symbol);
                        setShowSearchB(false);
                        setSearchQueryB('');
                      }}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium">{token.symbol}</div>
                          <div className="text-sm text-gray-600">{token.name}</div>
                        </div>
                        {allTokens[token.symbol] && (
                          <div className="text-right">
                            <div className="text-sm font-medium">{formatPrice(allTokens[token.symbol].currentPrice)}</div>
                            <div className="text-xs text-gray-500">{formatMarketCap(allTokens[token.symbol].marketCap)}</div>
                            <div className="text-xs text-gray-400">
                              Circulating: {formatSupply(allTokens[token.symbol].circulatingSupply)}
                              {allTokens[token.symbol].maxSupply && ` • Max: ${formatSupply(allTokens[token.symbol].maxSupply!)}`}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Token B Result Card */}
            {allTokens[tokenB] && (
              <div className="mt-4">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 border border-blue-200 shadow-sm">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-2 rounded-lg text-white">
                      {getCoinIcon(tokenB)}
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900">{allTokens[tokenB].name}</h4>
                      <p className="text-sm text-gray-600">({tokenB}) - Target Token</p>
                    </div>
                  </div>
                  
                  {/* Token B Data */}
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Prijs:</span>
                      <span className="font-bold text-gray-900">{formatPrice(allTokens[tokenB].currentPrice)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Market Cap:</span>
                      <span className="font-bold text-blue-600">
                        {useATH && allTokens[tokenB].athMarketCap 
                          ? formatMarketCap(allTokens[tokenB].athMarketCap)
                          : formatMarketCap(allTokens[tokenB].marketCap)
                        }
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Circulating Supply:</span>
                      <span className="font-bold text-gray-900">{formatSupply(allTokens[tokenB].circulatingSupply)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Max Supply:</span>
                      <span className="font-bold text-gray-900">
                        {allTokens[tokenB].maxSupply ? formatSupply(allTokens[tokenB].maxSupply) : 'N/A'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Now/ATH Toggle */}
      <div className="flex items-center justify-center mb-6">
        <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium text-gray-700">Vergelijk met:</span>
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setUseATH(false)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                  !useATH 
                    ? 'bg-white text-gray-900 shadow-sm' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Now
              </button>
              <button
                onClick={() => setUseATH(true)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                  useATH 
                    ? 'bg-white text-gray-900 shadow-sm' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                ATH
              </button>
            </div>
            <span className="text-xs text-gray-500">
              {useATH ? 'All Time High Market Cap' : 'Current Market Cap'}
            </span>
          </div>
        </div>
      </div>

      {/* Multiple Selection Toggle */}
      <div className="flex items-center justify-center mb-6">
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={multipleSelection}
            onChange={(e) => setMultipleSelection(e.target.checked)}
            className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          />
          <span className="text-sm font-medium text-gray-700">Multiple Selection</span>
        </label>
      </div>

      {/* Multiple Selection Interface */}
      {multipleSelection && (
        <div className="mb-6 p-4 bg-gray-50 rounded-xl">
          <h4 className="font-semibold text-gray-900 mb-3">Selecteer tokens om te vergelijken met {tokenB}:</h4>
          
          {/* Selected Tokens */}
          {compareTokens.length > 0 && (
            <div className="mb-4">
              <div className="flex flex-wrap gap-2 mb-3">
                {compareTokens.map(symbol => (
                  <button
                    key={symbol}
                    onClick={() => removeCompareToken(symbol)}
                    className="px-3 py-2 bg-blue-500 text-white rounded-lg text-sm font-medium hover:bg-blue-600 transition-all flex items-center gap-2"
                  >
                    {symbol}
                    <X className="w-3 h-3" />
                  </button>
                ))}
              </div>
              
            </div>
          )}
          
          {/* Add Token Button */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowSearchA(true)}
              className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg text-sm font-medium hover:bg-green-600 transition-all"
            >
              <Plus className="w-4 h-4" />
              Add Token
            </button>
            {compareTokens.length > 0 && (
              <span className="text-sm text-gray-600">
                {compareTokens.length} token{compareTokens.length !== 1 ? 's' : ''} geselecteerd
              </span>
            )}
          </div>
          
          <p className="text-xs text-gray-500 text-center mt-2">
            💡 Klik op "Token A" hierboven om tokens toe te voegen
          </p>
          
          {/* Show token cards for multiple selection */}
          {results.length > 0 && (
            <div className="mt-6 space-y-4">
              <h4 className="font-semibold text-gray-900 text-center">Vergelijkingsresultaten</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {results.map((result, index) => (
                  <div key={index} className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-4 border border-gray-200 shadow-sm relative">
                    {/* Remove Button */}
                    <button
                      onClick={() => removeCompareToken(result.coin)}
                      className="absolute top-2 right-2 w-5 h-5 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center transition-all shadow-sm"
                      title={`Verwijder ${result.coin}`}
                    >
                      <X className="w-3 h-3" />
                    </button>
                    
                    <div className="flex items-center gap-3 mb-4">
                      <div className={`bg-gradient-to-r ${getCoinColor(result.potentialGain)} p-2 rounded-lg text-white`}>
                        {getCoinIcon(result.coin)}
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-900">{allTokens[result.coin]?.name}</h4>
                        <p className="text-sm text-gray-600">({result.coin})</p>
                      </div>
                    </div>
                    
                    {/* Huidige vs Target Data - Links/Rechts Layout */}
                    <div className="grid grid-cols-2 gap-4">
                      {/* Links: Huidige Data */}
                      <div className="space-y-2">
                        <h5 className="font-semibold text-gray-800 text-xs border-b border-gray-300 pb-1">Huidige Data</h5>
                        <div className="space-y-1 text-xs">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Prijs:</span>
                            <span className="font-bold text-gray-900">{formatPrice(result.currentPrice)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Market Cap:</span>
                            <span className="font-bold text-gray-900">{formatMarketCap(result.marketCap)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Circulating:</span>
                            <span className="font-bold text-gray-900">{formatSupply(result.circulatingSupply)}</span>
                          </div>
                          {result.maxSupply && (
                            <div className="flex justify-between">
                              <span className="text-gray-600">Max Supply:</span>
                              <span className="font-bold text-gray-900">{formatSupply(result.maxSupply)}</span>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      {/* Rechts: Target Data */}
                      <div className="space-y-2">
                        <h5 className="font-semibold text-blue-800 text-xs border-b border-blue-300 pb-1">Met {tokenB} Market Cap</h5>
                        <div className="space-y-1 text-xs">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Target Prijs:</span>
                            <span className="font-bold text-blue-600">{formatPrice(result.targetPrice)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Market Cap:</span>
                            <span className="font-bold text-blue-600">{formatMarketCap(allTokens[tokenB]?.marketCap || 0)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Potentiële Winst:</span>
                            <span className={`font-bold ${result.potentialGain >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                              {result.potentialGain >= 0 ? '+' : ''}{result.potentialGain.toFixed(1)}%
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Multiplier:</span>
                            <span className="font-bold text-blue-600">{result.priceMultiplier.toFixed(1)}x</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      )}


      {/* Amount Calculator - Only show in single selection mode */}
      {!multipleSelection && results.length > 0 && (
        <div className="mt-8 p-4 bg-gradient-to-r from-blue-50 to-green-50 rounded-xl border border-blue-200">
          <h4 className="font-semibold text-gray-900 mb-3 text-center">Amount Calculator</h4>
          <div className="flex items-center justify-center gap-4">
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-700">Amount:</label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                min="0.00000001"
                step="0.00000001"
                className="w-24 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-center"
              />
            </div>
            <div className="text-center">
              <div className="text-sm text-gray-600">Current Value</div>
              <div className="font-bold text-lg text-gray-900">
                {formatPrice(results[0].currentPrice * amount)}
              </div>
            </div>
            <div className="text-center">
              <div className="text-sm text-gray-600">Target Value</div>
              <div className="font-bold text-lg text-green-600">
                {formatPrice(results[0].targetPrice * amount)}
              </div>
            </div>
          </div>
        </div>
      )}

          
    </div>
  );
}
