const assert = require('assert');
const PerformanceMonitor = require('../src/performanceMonitor');
const ErrorDetector = require('../src/errorDetector');
const AutoRecovery = require('../src/autoRecovery');

describe('Monitoring System Tests', () => {
  describe('Performance Monitor', () => {
    beforeEach(() => {
      PerformanceMonitor.clear();
    });

    it('should track performance metrics', () => {
      PerformanceMonitor.initMetric('fps', {
        sampleSize: 10,
        threshold: 30
      });

      for (let i = 0; i < 15; i++) {
        PerformanceMonitor.update('fps', 60 - i);
      }

      const stats = PerformanceMonitor.getStats('fps');
      assert(stats.average > 45);
      assert(stats.samples.length === 10);
    });

    it('should trigger threshold notifications', (done) => {
      PerformanceMonitor.initMetric('memory', {
        threshold: 1000
      });

      PerformanceMonitor.addListener((event) => {
        assert.strictEqual(event.type, 'threshold_exceeded');
        assert.strictEqual(event.metric, 'memory');
        done();
      });

      PerformanceMonitor.update('memory', 1200);
    });
  });

  describe('Error Detector', () => {
    let errorDetector;

    beforeEach(() => {
      errorDetector = new ErrorDetector();
    });

    it('should detect errors using patterns', () => {
      errorDetector.registerPattern('outOfMemory', {
        pattern: /out of memory/i,
        severity: 'critical',
        category: 'system'
      });

      const errors = errorDetector.detect('Application crashed: out of memory');
      assert.strictEqual(errors.length, 1);
      assert.strictEqual(errors[0].severity, 'critical');
    });

    it('should handle error handlers', async () => {
      let handlerCalled = false;

      errorDetector.registerPattern('timeout', {
        pattern: /timeout/i,
        category: 'network'
      });

      errorDetector.registerHandler('network', () => {
        handlerCalled = true;
      });

      await errorDetector.detect('Request timeout after 30s');
      assert(handlerCalled);
    });
  });

  describe('Auto Recovery', () => {
    let autoRecovery;

    beforeEach(() => {
      autoRecovery = new AutoRecovery();
    });

    it('should attempt recovery with backoff', async () => {
      let attempts = 0;
      const error = new Error('test error');

      autoRecovery.registerStrategy('test', {
        check: (err) => err.message === 'test error',
        recover: async () => {
          attempts++;
          if (attempts < 2) throw new Error('Recovery failed');
        },
        maxRetries: 3
      });

      const success = await autoRecovery.attemptRecovery(error, {});
      assert(success);
      assert.strictEqual(attempts, 2);
    });

    it('should respect max retries', async () => {
      const error = new Error('test error');

      autoRecovery.registerStrategy('test', {
        check: (err) => err.message === 'test error',
        recover: async () => {
          throw new Error('Always fails');
        },
        maxRetries: 2
      });

      const success = await autoRecovery.attemptRecovery(error, {});
      assert(!success);

      const history = autoRecovery.getRecoveryHistory();
      assert.strictEqual(history.length, 2);
    });
  });
});
