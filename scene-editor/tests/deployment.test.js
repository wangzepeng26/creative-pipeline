const assert = require('assert');
const AutoDeployment = require('../src/autoDeployment');

describe('Auto Deployment Tests', () => {
  let deployment;

  beforeEach(() => {
    deployment = new AutoDeployment({
      testCommand: 'echo "Running tests"',
      buildCommand: 'echo "Building project"',
      deployCommand: 'echo "Deploying"'
    });
  });

  describe('Deployment Process', () => {
    it('should execute full deployment cycle', async () => {
      const result = await deployment.deploy();
      
      assert.strictEqual(result.status, 'success');
      assert.strictEqual(result.steps.length, 4); // tests, build, deploy, validation
      
      // 验证每个步骤都成功完成
      result.steps.forEach(step => {
        assert.strictEqual(step.status, 'success');
      });
    });

    it('should handle test failures', async () => {
      deployment = new AutoDeployment({
        testCommand: 'exit 1', // 使测试失败
        buildCommand: 'echo "Building"',
        deployCommand: 'echo "Deploying"'
      });

      const result = await deployment.deploy();
      
      assert.strictEqual(result.status, 'failed');
      assert.strictEqual(result.steps[0].status, 'failed');
      assert(result.steps.some(step => step.name === 'rollback'));
    });

    it('should maintain deployment history', async () => {
      await deployment.deploy();
      await deployment.deploy();
      
      const history = deployment.getDeploymentHistory();
      assert.strictEqual(history.length, 2);
    });
  });

  describe('Validation and Rollback', () => {
    it('should validate deployment', async () => {
      const validationResult = await deployment.validateDeployment();
      assert.strictEqual(validationResult.success, true);
    });

    it('should handle rollback process', async () => {
      deployment = new AutoDeployment({
        testCommand: 'echo "Tests"',
        buildCommand: 'exit 1', // 使构建失败触发回滚
        deployCommand: 'echo "Deploy"'
      });

      const result = await deployment.deploy();
      
      // 验证回滚步骤被添加
      const rollbackStep = result.steps.find(step => step.name === 'rollback');
      assert(rollbackStep);
      assert.strictEqual(rollbackStep.status, 'success');
    });
  });

  describe('Configuration', () => {
    it('should use default configuration when not provided', () => {
      const defaultDeployment = new AutoDeployment({});
      
      assert(defaultDeployment.config.testCommand);
      assert(defaultDeployment.config.buildCommand);
      assert(defaultDeployment.config.deployCommand);
    });

    it('should override default configuration', () => {
      const customDeployment = new AutoDeployment({
        testCommand: 'custom-test',
        buildCommand: 'custom-build',
        deployCommand: 'custom-deploy'
      });

      assert.strictEqual(customDeployment.config.testCommand, 'custom-test');
      assert.strictEqual(customDeployment.config.buildCommand, 'custom-build');
      assert.strictEqual(customDeployment.config.deployCommand, 'custom-deploy');
    });
  });
});
