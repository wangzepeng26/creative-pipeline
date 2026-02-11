const os = require('os');
const fs = require('fs');
const path = require('path');
const config = require('./config');

class MetricsCollector {
  constructor() {
    this.metrics = {
      cpu: [],
      memory: [],
      apiLatency: []
    };
    
    this.setupCollectors();
  }

  setupCollectors() {
    // CPU 监控
    if (config.metrics.cpu.enabled) {
      setInterval(() => this.collectCPUMetrics(), config.metrics.cpu.interval);
    }

    // 内存监控
    if (config.metrics.memory.enabled) {
      setInterval(() => this.collectMemoryMetrics(), config.metrics.memory.interval);
    }

    // API延迟监控
    if (config.metrics.apiLatency.enabled) {
      setInterval(() => this.collectApiLatencyMetrics(), config.metrics.apiLatency.interval);
    }
  }

  async collectCPUMetrics() {
    const cpus = os.cpus();
    const totalIdle = cpus.reduce((acc, cpu) => acc + cpu.times.idle, 0);
    const totalTick = cpus.reduce((acc, cpu) => 
      acc + Object.values(cpu.times).reduce((a, b) => a + b), 0
    );
    const usage = ((totalTick - totalIdle) / totalTick) * 100;

    this.metrics.cpu.push({
      timestamp: Date.now(),
      usage
    });

    // 检查是否超过阈值
    if (usage > config.metrics.cpu.threshold) {
      this.triggerAlert('cpu', usage);
    }
  }

  collectMemoryMetrics() {
    const totalMem = os.totalmem();
    const freeMem = os.freemem();
    const usage = ((totalMem - freeMem) / totalMem) * 100;

    this.metrics.memory.push({
      timestamp: Date.now(),
      usage,
      total: totalMem,
      free: freeMem
    });

    if (usage > config.metrics.memory.threshold) {
      this.triggerAlert('memory', usage);
    }
  }

  collectApiLatencyMetrics() {
    // 这里添加API延迟检测逻辑
    // 可以通过发送请求到关键API端点来测量响应时间
  }

  triggerAlert(type, value) {
    const alert = {
      type,
      value,
      timestamp: Date.now(),
      message: `${type} usage exceeded threshold: ${value}%`
    };

    // 写入告警日志
    const alertsPath = path.join(__dirname, 'logs', 'alerts.log');
    fs.appendFileSync(alertsPath, JSON.stringify(alert) + '\n');

    // 这里可以添加告警通知逻辑，如发送邮件或消息
    console.error(`[ALERT] ${alert.message}`);
  }

  // 获取最新指标数据
  getLatestMetrics() {
    return {
      cpu: this.metrics.cpu.slice(-1)[0],
      memory: this.metrics.memory.slice(-1)[0],
      apiLatency: this.metrics.apiLatency.slice(-1)[0]
    };
  }

  // 获取历史数据用于绘图
  getHistoricalMetrics(type, duration) {
    const now = Date.now();
    const cutoff = now - duration;
    return this.metrics[type].filter(m => m.timestamp >= cutoff);
  }
}

module.exports = new MetricsCollector();