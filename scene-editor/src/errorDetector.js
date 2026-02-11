class ErrorDetector {
  constructor() {
    this.errorPatterns = new Map();
    this.errorHistory = [];
    this.maxHistorySize = 1000;
    this.handlers = new Map();
  }

  // 注册错误模式
  registerPattern(id, pattern) {
    this.errorPatterns.set(id, {
      pattern: pattern.pattern,
      severity: pattern.severity || 'error',
      category: pattern.category || 'general',
      description: pattern.description || ''
    });
  }

  // 注册错误处理器
  registerHandler(category, handler) {
    this.handlers.set(category, handler);
  }

  // 检测错误
  detect(context) {
    const detectedErrors = [];

    for (const [id, pattern] of this.errorPatterns) {
      try {
        let matches;
        if (pattern.pattern instanceof RegExp) {
          matches = pattern.pattern.test(context.toString());
        } else if (typeof pattern.pattern === 'function') {
          matches = pattern.pattern(context);
        }

        if (matches) {
          const error = {
            id,
            timestamp: Date.now(),
            severity: pattern.severity,
            category: pattern.category,
            description: pattern.description,
            context: context
          };

          detectedErrors.push(error);
          this.addToHistory(error);

          // 触发对应的处理器
          this.handleError(error);
        }
      } catch (e) {
        console.error(`Error in pattern detection ${id}:`, e);
      }
    }

    return detectedErrors;
  }

  // 添加到错误历史
  addToHistory(error) {
    this.errorHistory.push(error);
    if (this.errorHistory.length > this.maxHistorySize) {
      this.errorHistory.shift();
    }
  }

  // 处理错误
  async handleError(error) {
    const handler = this.handlers.get(error.category);
    if (handler) {
      try {
        await handler(error);
      } catch (e) {
        console.error(`Error in handler for category ${error.category}:`, e);
      }
    }
  }

  // 获取错误历史
  getHistory(filter = {}) {
    return this.errorHistory.filter(error => {
      for (const [key, value] of Object.entries(filter)) {
        if (error[key] !== value) return false;
      }
      return true;
    });
  }

  // 清除历史
  clearHistory() {
    this.errorHistory = [];
  }
}

module.exports = ErrorDetector;