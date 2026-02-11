class ParameterControl {
  constructor() {
    this.parameters = new Map();
    this.listeners = new Map();
  }

  // 注册参数
  registerParameter(id, config) {
    this.parameters.set(id, {
      value: config.defaultValue,
      min: config.min,
      max: config.max,
      step: config.step,
      type: config.type
    });
  }

  // 更新参数值
  updateParameter(id, value) {
    if (!this.parameters.has(id)) {
      throw new Error(`Parameter ${id} not found`);
    }
    const param = this.parameters.get(id);
    if (param.type === 'number') {
      value = Math.max(param.min, Math.min(param.max, value));
    }
    param.value = value;
    this.notifyListeners(id, value);
  }

  // 添加监听器
  addListener(id, callback) {
    if (!this.listeners.has(id)) {
      this.listeners.set(id, new Set());
    }
    this.listeners.get(id).add(callback);
  }

  // 通知监听器
  notifyListeners(id, value) {
    if (this.listeners.has(id)) {
      this.listeners.get(id).forEach(callback => callback(value));
    }
  }
}

module.exports = ParameterControl;