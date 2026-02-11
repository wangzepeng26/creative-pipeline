const express = require('express');
const path = require('path');
const metricsCollector = require('./metrics');
const errorTracker = require('./error-tracker');
const config = require('./config');

class DashboardServer {
  constructor() {
    this.app = express();
    this.setupRoutes();
  }

  setupRoutes() {
    // 静态文件服务
    this.app.use(express.static(path.join(__dirname, 'public')));

    // API路由
    this.app.get('/api/metrics/current', (req, res) => {
      res.json(metricsCollector.getLatestMetrics());
    });

    this.app.get('/api/metrics/historical/:type', (req, res) => {
      const { type } = req.params;
      const { duration = 24 * 60 * 60 * 1000 } = req.query; // 默认24小时
      res.json(metricsCollector.getHistoricalMetrics(type, duration));
    });

    this.app.get('/api/errors/analysis', async (req, res) => {
      const { timeRange = '24h' } = req.query;
      const analysis = await errorTracker.analyzeErrors(timeRange);
      res.json(analysis);
    });

    // 主页
    this.app.get('/', (req, res) => {
      res.sendFile(path.join(__dirname, 'public', 'index.html'));
    });
  }

  start(port = 3000) {
    this.app.listen(port, () => {
      console.log(`Dashboard server running on port ${port}`);
    });
  }
}

module.exports = new DashboardServer();