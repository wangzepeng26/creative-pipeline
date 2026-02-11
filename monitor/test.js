const AgentMonitor = require('./index').getInstance();

async function runTests() {
    try {
        console.log('Starting monitor system tests...');

        // 测试1: 启动监控系统
        console.log('\nTest 1: Starting monitor system');
        await AgentMonitor.start();
        console.log('Monitor system started successfully');

        // 测试2: 检查系统状态
        console.log('\nTest 2: Checking system status');
        const status = AgentMonitor.getStatus();
        console.log('System status:', JSON.stringify(status, null, 2));

        // 测试3: 等待一段时间观察监控
        console.log('\nTest 3: Monitoring for 30 seconds...');
        await new Promise(resolve => setTimeout(resolve, 30000));

        // 测试4: 停止监控系统
        console.log('\nTest 4: Stopping monitor system');
        await AgentMonitor.stop();
        console.log('Monitor system stopped successfully');

        console.log('\nAll tests completed successfully!');
    } catch (error) {
        console.error('Test failed:', error);
        process.exit(1);
    }
}

// 运行测试
runTests();