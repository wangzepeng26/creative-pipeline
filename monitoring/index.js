const metricsCollector = require('./metrics');
const errorTracker = require('./error-tracker');
const dashboard = require('./dashboard');

// 启动监控系统
function startMonitoring() {
  try {
    // 启动仪表板服务器
    dashboard.start(3000);

    // 设置定时清理任务
    setInterval(() => {
      errorTracker.cleanOldLogs()
        .catch(err => console.error('Error cleaning old logs:', err));
    }, 24 * 60 * 60 * 1000); // 每24小时执行一次

    console.log('Monitoring system started successfully');
    console.log('Dashboard available at http://localhost:3000');
  } catch (error) {
    console.error('Failed to start monitoring system:', error);
    process.exit(1);
  }
}

startMonitoring();