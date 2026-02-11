const monitoringConfig = {
  // 性能指标收集配置
  metrics: {
    // CPU使用率监控
    cpu: {
      enabled: true,
      interval: 60000, // 每60秒收集一次
      threshold: 80 // CPU使用率超过80%报警
    },
    // 内存使用监控
    memory: {
      enabled: true,
      interval: 60000,
      threshold: 85 // 内存使用率超过85%报警
    },
    // API响应时间监控
    apiLatency: {
      enabled: true,
      interval: 30000, // 每30秒检查一次
      threshold: 1000 // 响应时间超过1000ms报警
    }
  },

  // 错误跟踪配置
  errorTracking: {
    enabled: true,
    // 错误等级定义
    levels: {
      error: 0,
      warn: 1,
      info: 2
    },
    // 错误存储配置
    storage: {
      type: 'file',
      path: './logs/errors.log',
      maxSize: '100m',
      maxFiles: 10
    }
  },

  // 数据可视化配置
  visualization: {
    // 数据聚合间隔
    aggregationInterval: 300000, // 5分钟
    // 数据保留时间
    retention: {
      raw: '7d',  // 原始数据保留7天
      aggregated: '30d' // 聚合数据保留30天
    },
    // 图表配置
    charts: {
      timeRange: '24h', // 默认显示24小时数据
      refreshInterval: 60000 // 每分钟刷新一次
    }
  }
};

module.exports = monitoringConfig;