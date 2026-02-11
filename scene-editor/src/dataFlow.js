class DataFlow {
  constructor() {
    this.nodes = new Map();
    this.connections = new Map();
    this.dataCache = new Map();
  }

  // 注册数据节点
  registerNode(nodeId, config) {
    this.nodes.set(nodeId, {
      inputs: config.inputs || [],
      outputs: config.outputs || [],
      process: config.process || ((inputs) => inputs),
      cache: config.cache || false
    });
  }

  // 连接节点
  connect(fromNode, fromOutput, toNode, toInput) {
    const connectionId = `${fromNode}:${fromOutput}-${toNode}:${toInput}`;
    this.connections.set(connectionId, {
      from: { node: fromNode, output: fromOutput },
      to: { node: toNode, input: toInput }
    });
  }

  // 处理数据流
  async process(startNode, inputs = {}) {
    const visited = new Set();
    const results = new Map();

    const processNode = async (nodeId) => {
      if (visited.has(nodeId)) {
        return this.dataCache.get(nodeId);
      }

      visited.add(nodeId);
      const node = this.nodes.get(nodeId);
      
      // 收集输入数据
      const nodeInputs = {};
      for (const input of node.inputs) {
        // 查找连接到此输入的输出
        for (const [connId, conn] of this.connections) {
          if (conn.to.node === nodeId && conn.to.input === input) {
            const sourceData = await processNode(conn.from.node);
            nodeInputs[input] = sourceData[conn.from.output];
          }
        }
        // 如果没有连接，使用提供的输入
        if (!(input in nodeInputs)) {
          nodeInputs[input] = inputs[input];
        }
      }

      // 处理节点
      const result = await node.process(nodeInputs);
      
      // 缓存结果
      if (node.cache) {
        this.dataCache.set(nodeId, result);
      }
      
      results.set(nodeId, result);
      return result;
    };

    await processNode(startNode);
    return results;
  }

  // 清除缓存
  clearCache() {
    this.dataCache.clear();
  }
}

module.exports = DataFlow;