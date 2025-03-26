// Script to fetch trading volume for Stellar blockchain
const axios = require('axios');

/**
 * Fetches total trading volume data for Stellar blockchain from DeFiLlama API
 * @param {number} days Number of days to look back for volume data (default: 1)
 */
async function fetchStellarVolume(days = 1) {
  try {
    // Fetch DEX volume data from DeFiLlama
    const response = await axios.get('https://api.llama.fi/overview/dexs');
    
    // Filter for protocols on Stellar chain
    const stellarDexes = response.data.protocols.filter(protocol => 
      protocol.chains.includes('Stellar')
    );
    
    // Calculate total volume for specified days
    const totalVolume = stellarDexes.reduce((sum, dex) => {
      // Get volume for the specified time period
      return sum + (dex.volumeChange.dailyVolume || 0);
    }, 0);
    
    console.log('Stellar DEXes:', stellarDexes.map(dex => ({
      name: dex.name,
      dailyVolume: `$${(dex.volumeChange.dailyVolume || 0).toLocaleString()}`
    })));
    
    console.log(`\nTotal ${days}-day volume on Stellar: $${totalVolume.toLocaleString()}`);
    
    // For historical volume data, we'd need to query each DEX individually
    if (stellarDexes.length > 0) {
      console.log('\nFetching historical data for the largest DEX...');
      const largestDex = stellarDexes.reduce((max, dex) => 
        (dex.volumeChange.dailyVolume > max.volumeChange.dailyVolume) ? dex : max, 
        stellarDexes[0]
      );
      
      // Get historical data for largest DEX
      const historicalData = await axios.get(`https://api.llama.fi/summary/dexs/${largestDex.slug}?dataType=dailyVolume`);
      console.log(`${largestDex.name} 7-day volume trend:`, historicalData.data.totalDataChart.slice(-7));
    }
    
    return {
      totalVolume,
      dexes: stellarDexes
    };
  } catch (error) {
    console.error('Error fetching Stellar volume:', error.message);
    throw error;
  }
}

// Execute the function when this script is run directly
if (require.main === module) {
  fetchStellarVolume();
}

module.exports = { fetchStellarVolume }; 