const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const winston = require('winston');
const promClient = require('prom-client');

const ParameterControl = require('./src/parameterControl');
const LivePreview = require('./src/livePreview');
const DataFlow = require('./src/dataFlow');
const PerformanceMonitor = require('./src/performanceMonitor');
const ErrorDetector = require('./src/errorDetector');
const AutoRecovery = require('./src/autoRecovery');

// 创建Express应用
const app = express();
const server = http.createServer(app);
const io = socketIO(server);

// 设置日志记录器
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});

// 设置Prometheus指标
const registry = new promClient.Registry();
promClient.collectDefaultMetrics({ register: registry });

// 自定义指标
const sceneOperationsCounter = new promClient.Counter({
  name: 'scene_operations_total',
  help: 'Total number of scene operations',
  labelNames: ['operation_type']
});

const renderDurationHistogram = new promClient.Histogram({
  name: 'scene_render_duration_seconds',
  help: 'Scene rendering duration in seconds',
  buckets: [0.1, 0.5, 1, 2, 5]
});

registry.registerMetric(sceneOperationsCounter);
registry.registerMetric(renderDurationHistogram);

// 初始化系统组件
const parameterControl = new ParameterControl();
const dataFlow = new DataFlow();
const errorDetector = new ErrorDetector();
const autoRecovery = new AutoRecovery();

// 注册错误模式和恢复策略
errorDetector.registerPattern('renderError', {
  pattern: /render failed/i,
  severity: 'error',
  category: 'rendering'
});

autoRecovery.registerStrategy('renderError', {
  check: (error) => error.category === 'rendering',
  recover: async (error, context) => {
    logger.info('Attempting to recover from render error');
    // 实现渲染错误恢复逻辑
  }
});

// 设置性能监控
PerformanceMonitor.initMetric('fps', {
  sampleSize: 60,
  threshold: 30
});

PerformanceMonitor.initMetric('memoryUsage', {
  sampleSize: 30,
  threshold: 90
});

PerformanceMonitor.addListener((event) => {
  logger.warn('Performance threshold exceeded', event);
});

// WebSocket连接处理
io.on('connection', (socket) => {
  logger.info('New client connected');

  // 参数更新处理
  socket.on('updateParameter', (data) => {
    try {
      parameterControl.updateParameter(data.id, data.value);
      sceneOperationsCounter.inc({ operation_type: 'parameter_update' });
    } catch (error) {
      logger.error('Parameter update failed', error);
    }
  });

  // 场景渲染请求处理
  socket.on('renderScene', async (data) => {
    const startTime = process.hrtime();

    try {
      // 处理场景渲染
      const result = await dataFlow.process('renderNode', data);
      
      const [seconds, nanoseconds] = process.hrtime(startTime);
      const duration = seconds + nanoseconds / 1e9;
      renderDurationHistogram.observe(duration);

      socket.emit('renderComplete', result);
    } catch (error) {
      logger.error('Scene rendering failed', error);
      
      // 检测错误并尝试恢复
      const detectedErrors = errorDetector.detect(error);
      if (detectedErrors.length > 0) {
        await autoRecovery.attemptRecovery(detectedErrors[0], { socket, data });
      }
    }
  });

  socket.on('disconnect', () => {
    logger.info('Client disconnected');
  });
});

// Prometheus指标端点
app.get('/metrics', async (req, res) => {
  try {
    res.set('Content-Type', registry.contentType);
    res.end(await registry.metrics());
  } catch (error) {
    logger.error('Metrics collection failed', error);
    res.status(500).end();
  }
});

// 健康检查端点
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: Date.now(),
    metrics: {
      fps: PerformanceMonitor.getStats('fps'),
      memory: PerformanceMonitor.getStats('memoryUsage')
    }
  });
});

// 启动服务器
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
});

// 优雅关闭处理
process.on('SIGTERM', () => {
  logger.info('SIGTERM received. Shutting down gracefully...');
  server.close(() => {
    logger.info('Server closed');
    process.exit(0);
  });
});
