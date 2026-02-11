const PerformanceMonitor = {
  metrics: new Map(),
  thresholds: new Map(),
  listeners: new Set(),

  // 初始化监控指标
  initMetric(name, config) {
    this.metrics.set(name, {
      value: 0,
      samples: [],
      sampleSize: config.sampleSize || 100,
      timestamp: Date.now()
    });

    if (config.threshold) {
      this.thresholds.set(name, config.threshold);
    }
  },

  // 更新指标值
  update(name, value) {
    const metric = this.metrics.get(name);
    if (!metric) return;

    metric.value = value;
    metric.samples.push(value);
    if (metric.samples.length > metric.sampleSize) {
      metric.samples.shift();
    }
    metric.timestamp = Date.now();

    // 检查阈值
    this.checkThreshold(name);
  },

  // 获取指标统计信息
  getStats(name) {
    const metric = this.metrics.get(name);
    if (!metric) return null;

    const samples = metric.samples;
    return {
      current: metric.value,
      average: samples.reduce((a, b) => a + b, 0) / samples.length,
      min: Math.min(...samples),
      max: Math.max(...samples),
      timestamp: metric.timestamp
    };
  },

  // 检查阈值并通知
  checkThreshold(name) {
    const metric = this.metrics.get(name);
    const threshold = this.thresholds.get(name);
    if (!metric || !threshold) return;

    const stats = this.getStats(name);
    if (stats.current > threshold) {
      this.notifyListeners({
        type: 'threshold_exceeded',
        metric: name,
        value: stats.current,
        threshold: threshold,
        timestamp: Date.now()
      });
    }
  },

  // 添加监听器
  addListener(callback) {
    this.listeners.add(callback);
  },

  // 移除监听器
  removeListener(callback) {
    this.listeners.delete(callback);
  },

  // 通知所有监听器
  notifyListeners(event) {
    this.listeners.forEach(listener => {
      try {
        listener(event);
      } catch (error) {
        console.error('Error in performance monitor listener:', error);
      }
    });
  },

  // 清除所有数据
  clear() {
    this.metrics.clear();
    this.thresholds.clear();
    this.listeners.clear();
  }
};

module.exports = PerformanceMonitor;