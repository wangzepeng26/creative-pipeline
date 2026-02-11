class AutoRecovery {
  constructor() {
    this.strategies = new Map();
    this.recoveryHistory = [];
    this.maxRetries = 3;
    this.backoffMultiplier = 1.5;
    this.initialDelay = 1000; // 1 second
  }

  // 注册恢复策略
  registerStrategy(errorType, strategy) {
    this.strategies.set(errorType, {
      check: strategy.check, // 检查是否适用该策略
      recover: strategy.recover, // 恢复函数
      cleanup: strategy.cleanup || (() => {}), // 可选的清理函数
      maxRetries: strategy.maxRetries || this.maxRetries
    });
  }

  // 尝试恢复
  async attemptRecovery(error, context) {
    const strategy = this.findStrategy(error);
    if (!strategy) {
      console.warn('No recovery strategy found for error:', error);
      return false;
    }

    let attempts = 0;
    let delay = this.initialDelay;

    while (attempts < strategy.maxRetries) {
      try {
        // 记录恢复尝试
        const recoveryAttempt = {
          timestamp: Date.now(),
          error: error,
          attempt: attempts + 1,
          strategy: strategy
        };

        // 执行恢复
        await this.sleep(delay);
        await strategy.recover(error, context);

        // 验证恢复是否成功
        if (await this.verifyRecovery(error, context)) {
          recoveryAttempt.success = true;
          this.recoveryHistory.push(recoveryAttempt);
          await strategy.cleanup(context);
          return true;
        }

        // 记录失败的恢复尝试
        recoveryAttempt.success = false;
        this.recoveryHistory.push(recoveryAttempt);

        // 增加延迟时间
        delay *= this.backoffMultiplier;
        attempts++;

      } catch (recoveryError) {
        console.error('Recovery attempt failed:', recoveryError);
        attempts++;
        delay *= this.backoffMultiplier;
      }
    }

    return false;
  }

  // 查找适用的恢复策略
  findStrategy(error) {
    for (const [_, strategy] of this.strategies) {
      if (strategy.check(error)) {
        return strategy;
      }
    }
    return null;
  }

  // 验证恢复是否成功
  async verifyRecovery(error, context) {
    try {
      // 检查错误是否仍然存在
      const strategy = this.findStrategy(error);
      return !strategy.check(error);
    } catch (e) {
      console.error('Recovery verification failed:', e);
      return false;
    }
  }

  // 获取恢复历史
  getRecoveryHistory(filter = {}) {
    return this.recoveryHistory.filter(record => {
      for (const [key, value] of Object.entries(filter)) {
        if (record[key] !== value) return false;
      }
      return true;
    });
  }

  // 清除恢复历史
  clearHistory() {
    this.recoveryHistory = [];
  }

  // 工具函数：睡眠
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

module.exports = AutoRecovery;