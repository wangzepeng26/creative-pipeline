const fs = require('fs');
const path = require('path');
const config = require('./config');

class ErrorTracker {
  constructor() {
    this.logDir = path.join(__dirname, 'logs');
    this.errorLogPath = path.join(this.logDir, 'errors.log');
    this.ensureLogDirectory();
  }

  ensureLogDirectory() {
    if (!fs.existsSync(this.logDir)) {
      fs.mkdirSync(this.logDir, { recursive: true });
    }
  }

  log(level, message, details = {}) {
    if (!config.errorTracking.enabled) return;

    const timestamp = new Date().toISOString();
    const errorEntry = {
      timestamp,
      level,
      message,
      details,
      stack: new Error().stack
    };

    // 写入错误日志
    fs.appendFileSync(
      this.errorLogPath,
      JSON.stringify(errorEntry) + '\n'
    );

    // 根据错误级别处理
    if (level === 'error') {
      console.error(`[ERROR] ${message}`);
      // 这里可以添加严重错误的通知逻辑
    }
  }

  // 错误日志分析
  async analyzeErrors(timeRange = '24h') {
    const logs = await this.readErrorLogs();
    const cutoff = new Date();
    cutoff.setHours(cutoff.getHours() - parseInt(timeRange));

    const filteredLogs = logs.filter(log => 
      new Date(log.timestamp) >= cutoff
    );

    return {
      total: filteredLogs.length,
      byLevel: this.groupByLevel(filteredLogs),
      topErrors: this.getTopErrors(filteredLogs)
    };
  }

  // 读取错误日志文件
  async readErrorLogs() {
    try {
      const content = await fs.promises.readFile(this.errorLogPath, 'utf8');
      return content
        .split('\n')
        .filter(line => line.trim())
        .map(line => JSON.parse(line));
    } catch (err) {
      console.error('Error reading error logs:', err);
      return [];
    }
  }

  // 按错误级别分组
  groupByLevel(logs) {
    return logs.reduce((acc, log) => {
      acc[log.level] = (acc[log.level] || 0) + 1;
      return acc;
    }, {});
  }

  // 获取最常见的错误
  getTopErrors(logs, limit = 10) {
    const errorCount = {};
    
    logs.forEach(log => {
      const key = `${log.level}:${log.message}`;
      errorCount[key] = (errorCount[key] || 0) + 1;
    });

    return Object.entries(errorCount)
      .sort(([,a], [,b]) => b - a)
      .slice(0, limit)
      .map(([error, count]) => ({
        error: error.split(':'),
        count
      }));
  }

  // 清理旧日志
  async cleanOldLogs() {
    const logs = await this.readErrorLogs();
    const maxAge = 7 * 24 * 60 * 60 * 1000; // 7天
    const cutoff = Date.now() - maxAge;

    const recentLogs = logs.filter(log => 
      new Date(log.timestamp).getTime() >= cutoff
    );

    await fs.promises.writeFile(
      this.errorLogPath,
      recentLogs.map(log => JSON.stringify(log)).join('\n')
    );
  }
}

module.exports = new ErrorTracker();