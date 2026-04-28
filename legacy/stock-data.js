/**
 * Stock Data Module
 * Handles fetching stock data, caching, and display utilities
 * Uses client-side localStorage for efficient caching
 */

const StockDataModule = (() => {
  const CACHE_KEY_PREFIX = 'stock_data_';
  const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours
  const DATA_DIR = './data';

  /**
   * Get cached data or fetch from file
   */
  const getCachedData = async (dataFile) => {
    const cacheKey = CACHE_KEY_PREFIX + dataFile;
    const cached = localStorage.getItem(cacheKey);
    
    if (cached) {
      const data = JSON.parse(cached);
      if (Date.now() - data.timestamp < CACHE_DURATION) {
        return data.content;
      }
    }

    // Fetch fresh data
    try {
      const response = await fetch(`${DATA_DIR}/${dataFile}.json`);
      if (!response.ok) throw new Error(`Failed to fetch ${dataFile}`);
      
      const content = await response.json();
      
      // Cache it
      localStorage.setItem(cacheKey, JSON.stringify({
        content,
        timestamp: Date.now()
      }));
      
      return content;
    } catch (error) {
      console.warn(`Error fetching ${dataFile}:`, error);
      // Return cached data even if expired
      if (cached) {
        return JSON.parse(cached).content;
      }
      return null;
    }
  };

  /**
   * Extract price from Alpha Vantage response
   */
  const extractPrice = (stockData) => {
    if (!stockData) return null;
    
    const quote = stockData['Global Quote'];
    if (!quote || !quote['05. price']) return null;
    
    return {
      symbol: quote['01. symbol'] || 'N/A',
      price: parseFloat(quote['05. price']),
      change: parseFloat(quote['09. change']),
      changePercent: parseFloat(quote['10. change percent']) || 0,
      timestamp: quote['07. latest trading day']
    };
  };

  /**
   * Get JSE stocks
   */
  const getJSEStocks = async () => {
    try {
      const data = await getCachedData('jse-stocks');
      if (!data || !data.stocks) return [];
      
      return data.stocks
        .map(extractPrice)
        .filter(s => s !== null);
    } catch (error) {
      console.error('Error getting JSE stocks:', error);
      return [];
    }
  };

  /**
   * Get S&P 500 index
   */
  const getSP500 = async () => {
    try {
      const data = await getCachedData('sp500');
      return extractPrice(data);
    } catch (error) {
      console.error('Error getting S&P 500:', error);
      return null;
    }
  };

  /**
   * Get NASDAQ index
   */
  const getNASDAQ = async () => {
    try {
      const data = await getCachedData('nasdaq');
      return extractPrice(data);
    } catch (error) {
      console.error('Error getting NASDAQ:', error);
      return null;
    }
  };

  /**
   * Get commodities (oil, copper)
   */
  const getCommodities = async () => {
    try {
      const [oil, copper] = await Promise.all([
        getCachedData('wti-oil'),
        getCachedData('copper')
      ]);

      return {
        oil: oil?.data ? parseFloat(oil.data[0]?.value) : null,
        copper: copper?.data ? parseFloat(copper.data[0]?.value) : null
      };
    } catch (error) {
      console.error('Error getting commodities:', error);
      return { oil: null, copper: null };
    }
  };

  /**
   * Format price for display
   */
  const formatPrice = (price) => {
    if (!price) return 'N/A';
    return `R${price.toFixed(2)}`;
  };

  /**
   * Format change percentage with color
   */
  const formatChange = (change) => {
    if (change === 0) return '0%';
    const sign = change > 0 ? '+' : '';
    const color = change > 0 ? '#22c55e' : '#ef4444';
    return `<span style="color:${color}">${sign}${change.toFixed(2)}%</span>`;
  };

  /**
   * Create stock card HTML
   */
  const createStockCard = (stock) => {
    const changeClass = stock.change > 0 ? 'positive' : stock.change < 0 ? 'negative' : 'neutral';
    
    return `
      <div class="stock-card ${changeClass}">
        <div class="stock-header">
          <span class="stock-symbol">${stock.symbol}</span>
          <span class="stock-price">${formatPrice(stock.price)}</span>
        </div>
        <div class="stock-change">
          ${formatChange(stock.changePercent)}
        </div>
      </div>
    `;
  };

  /**
   * Create mini portfolio display
   */
  const createPortfolioDisplay = (allocation) => {
    // allocation: { stocks: 60, bonds: 30, cash: 10 }
    const total = allocation.stocks + allocation.bonds + allocation.cash;
    
    return `
      <div class="portfolio-allocation">
        <div class="allocation-item">
          <div class="allocation-bar" style="flex: ${allocation.stocks}; background: linear-gradient(135deg, var(--accent), var(--accent-600));">
            <span class="allocation-label">Stocks ${allocation.stocks}%</span>
          </div>
        </div>
        <div class="allocation-item">
          <div class="allocation-bar" style="flex: ${allocation.bonds}; background: #8b5cf6;">
            <span class="allocation-label">Bonds ${allocation.bonds}%</span>
          </div>
        </div>
        <div class="allocation-item">
          <div class="allocation-bar" style="flex: ${allocation.cash}; background: #6b7280;">
            <span class="allocation-label">Cash ${allocation.cash}%</span>
          </div>
        </div>
      </div>
    `;
  };

  /**
   * Clear cache
   */
  const clearCache = () => {
    const keys = Object.keys(localStorage).filter(k => k.startsWith(CACHE_KEY_PREFIX));
    keys.forEach(key => localStorage.removeItem(key));
  };

  /**
   * Get cache status
   */
  const getCacheStatus = () => {
    const keys = Object.keys(localStorage).filter(k => k.startsWith(CACHE_KEY_PREFIX));
    return {
      cached: keys.length,
      lastUpdate: localStorage.getItem(CACHE_KEY_PREFIX + 'last_update')
    };
  };

  return {
    getJSEStocks,
    getSP500,
    getNASDAQ,
    getCommodities,
    formatPrice,
    formatChange,
    createStockCard,
    createPortfolioDisplay,
    clearCache,
    getCacheStatus
  };
})();
