const assert = require('assert');
const ParameterControl = require('../src/parameterControl');
const LivePreview = require('../src/livePreview');
const DataFlow = require('../src/dataFlow');

describe('Scene Editor Integration Tests', () => {
  describe('Parameter Control System', () => {
    let paramControl;

    beforeEach(() => {
      paramControl = new ParameterControl();
    });

    it('should register and update parameters', () => {
      paramControl.registerParameter('scale', {
        defaultValue: 1,
        min: 0.1,
        max: 10,
        step: 0.1,
        type: 'number'
      });

      paramControl.updateParameter('scale', 2);
      assert.strictEqual(paramControl.parameters.get('scale').value, 2);
    });

    it('should notify listeners of parameter changes', (done) => {
      paramControl.registerParameter('rotation', {
        defaultValue: 0,
        min: -180,
        max: 180,
        step: 1,
        type: 'number'
      });

      paramControl.addListener('rotation', (value) => {
        assert.strictEqual(value, 90);
        done();
      });

      paramControl.updateParameter('rotation', 90);
    });
  });

  describe('Live Preview System', () => {
    let canvas;
    let preview;

    beforeEach(() => {
      canvas = {
        getContext: () => ({
          clearRect: () => {},
          fillRect: () => {}
        }),
        width: 800,
        height: 600
      };
      preview = new LivePreview(canvas);
    });

    it('should manage render queue', (done) => {
      let renderCount = 0;
      
      preview.addToRenderQueue((ctx) => {
        renderCount++;
        if (renderCount === 1) {
          done();
        }
      });
    });

    it('should control FPS', () => {
      preview.setFPS(30);
      assert.strictEqual(preview.fps, 30);

      // Test upper limit
      preview.setFPS(200);
      assert.strictEqual(preview.fps, 144);

      // Test lower limit
      preview.setFPS(0);
      assert.strictEqual(preview.fps, 1);
    });
  });

  describe('Data Flow System', () => {
    let dataFlow;

    beforeEach(() => {
      dataFlow = new DataFlow();
    });

    it('should process data through connected nodes', async () => {
      // 注册节点
      dataFlow.registerNode('input', {
        outputs: ['value'],
        process: () => ({ value: 5 })
      });

      dataFlow.registerNode('multiply', {
        inputs: ['a'],
        outputs: ['result'],
        process: (inputs) => ({ result: inputs.a * 2 })
      });

      // 连接节点
      dataFlow.connect('input', 'value', 'multiply', 'a');

      // 处理数据
      const results = await dataFlow.process('multiply');
      assert.strictEqual(results.get('multiply').result, 10);
    });

    it('should handle cached nodes', async () => {
      dataFlow.registerNode('cached', {
        outputs: ['timestamp'],
        process: () => ({ timestamp: Date.now() }),
        cache: true
      });

      const result1 = await dataFlow.process('cached');
      const result2 = await dataFlow.process('cached');

      assert.strictEqual(
        result1.get('cached').timestamp,
        result2.get('cached').timestamp
      );
    });
  });
});
