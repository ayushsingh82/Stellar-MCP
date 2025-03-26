// Script to fetch token prices for Stellar ecosystem
const axios = require('axios');

/**
 * Fetches prices for Stellar tokens using CoinGecko API
 * @param {Array} tokenIds Optional array of specific CoinGecko token IDs to fetch
 */
async function fetchStellarTokenPrices(tokenIds = []) {
  try {
    // If no specific tokens provided, use default list of common Stellar tokens
    const defaultTokens = [
      'stellar', // XLM (native Stellar token)
      'centre-usdc', // USDC on Stellar
      'ultrastellar-aqua', // AQUA token
      'stellar-classic', // XLMC
      'lumenswap' // LSP
    ];
    
    const tokensToFetch = tokenIds.length > 0 ? tokenIds : defaultTokens;
    
    // Form API request with tokens list
    const tokenIdParam = tokensToFetch.join(',');
    console.log(`Fetching prices for: ${tokenIdParam}`);
    
    // Fetch token prices from CoinGecko (with USD, EUR and BTC conversion)
    const response = await axios.get(`https://api.coingecko.com/api/v3/simple/price`, {
      params: {
        ids: tokenIdParam,
        vs_currencies: 'usd,eur,btc',
        include_24hr_change: true,
        include_market_cap: true
      }
    });
    
    // Format the results for display
    console.log('\nStellar Ecosystem Token Prices:');
    console.log('================================');
    
    for (const [tokenId, priceData] of Object.entries(response.data)) {
      console.log(`\n${tokenId.toUpperCase()}:`);
      console.log(`  USD: $${priceData.usd.toLocaleString()} (24h: ${priceData.usd_24h_change.toFixed(2)}%)`);
      console.log(`  EUR: €${priceData.eur.toLocaleString()} (24h: ${priceData.eur_24h_change.toFixed(2)}%)`);
      console.log(`  BTC: ₿${priceData.btc.toFixed(8)}`);
      console.log(`  Market Cap: $${priceData.usd_market_cap.toLocaleString()}`);
    }
    
    // For a specific token lookup by symbol, we'd need to use the /coins/list endpoint first
    
    return response.data;
  } catch (error) {
    console.error('Error fetching Stellar token prices:', error.message);
    if (error.response && error.response.status === 429) {
      console.error('API rate limit exceeded. Please try again later.');
    }
    throw error;
  }
}

/**
 * Searches for tokens by name or symbol to get their CoinGecko IDs
 * @param {string} query Search term (name or symbol)
 */
async function searchTokens(query) {
  try {
    const response = await axios.get('https://api.coingecko.com/api/v3/coins/list');
    
    // Filter tokens that match the search term in name or symbol
    const matchingTokens = response.data.filter(token => 
      token.name.toLowerCase().includes(query.toLowerCase()) || 
      token.symbol.toLowerCase().includes(query.toLowerCase())
    );
    
    console.log(`\nFound ${matchingTokens.length} tokens matching "${query}":`);
    matchingTokens.forEach(token => {
      console.log(`ID: ${token.id}, Symbol: ${token.symbol.toUpperCase()}, Name: ${token.name}`);
    });
    
    return matchingTokens;
  } catch (error) {
    console.error('Error searching tokens:', error.message);
    throw error;
  }
}

// Execute the function when this script is run directly
if (require.main === module) {
  // Get command line arguments (if any)
  const args = process.argv.slice(2);
  
  if (args.length > 0 && args[0] === '--search') {
    // Search for tokens by name/symbol
    if (args.length > 1) {
      searchTokens(args[1]);
    } else {
      console.error('Please provide a search term. Example: node fetch-stellar-prices.js --search stellar');
    }
  } else if (args.length > 0) {
    // Fetch specific token prices
    fetchStellarTokenPrices(args);
  } else {
    // Use default tokens
    fetchStellarTokenPrices();
  }
}

module.exports = { fetchStellarTokenPrices, searchTokens }; 