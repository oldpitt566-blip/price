const express = require('express');
const axios = require('axios');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.static(path.join(__dirname, 'public')));

// Root route to serve index.html explicitly if needed
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/api/stock/:id', async (req, res) => {
  try {
    const stockId = req.params.id;
    const symbol = `${stockId}.TW`;
    // Yahoo Finance Chart API
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=1m&range=1d`;
    
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36'
      }
    });

    if (!response.data.chart.result) {
      return res.status(404).json({ error: 'Stock not found' });
    }

    const result = response.data.chart.result[0];
    const meta = result.meta;
    
    const currentPrice = meta.regularMarketPrice;
    const previousClose = meta.chartPreviousClose;
    const change = currentPrice - previousClose;
    const changePercent = (change / previousClose) * 100;

    res.json({
      id: stockId,
      symbol: meta.symbol,
      price: currentPrice.toFixed(2),
      change: change.toFixed(2),
      changePercent: changePercent.toFixed(2),
      currency: meta.currency,
      timestamp: new Date(meta.regularMarketTime * 1000).toISOString()
    });
  } catch (error) {
    console.error(`Error fetching stock data for ${req.params.id}:`, error.message);
    res.status(500).json({ error: 'Failed to fetch stock data' });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running at port ${PORT}`);
});
