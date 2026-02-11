const CoreMonitor = require('./core/monitor');
const SecurityManager = require('./security/security');
const AutomationManager = require('./automation/automation');
const config = require('./config/config');

class AgentMonitor {
    constructor() {
        this.coreMonitor = new CoreMonitor();
        this.securityManager = new SecurityManager();
        this.automationManager = new AutomationManager();
        this.isRunning = false;
    }

    // 启动监控系统
    async start() {
        if (this.isRunning) {
            console.log('Agent monitor is already running');
            return;
        }

        try {
            console.log('Starting agent monitor...');

            // 初始化各个组件
            await this.securityManager.initialize();
            await this.automationManager.initialize();
            await this.coreMonitor.start();

            this.isRunning = true;
            console.log('Agent monitor started successfully');
        } catch (error) {
            console.error('Failed to start agent monitor:', error);
            await this.stop();
            throw error;
        }
    }

    // 停止监控系统
    async stop() {
        if (!this.isRunning) {
            return;
        }

        try {
            console.log('Stopping agent monitor...');

            // 按顺序停止各个组件
            await this.coreMonitor.stop();
            await this.automationManager.stop();
            await this.securityManager.stop();

            this.isRunning = false;
            console.log('Agent monitor stopped successfully');
        } catch (error) {
            console.error('Error during shutdown:', error);
            throw error;
        }
    }

    // 获取监控状态
    getStatus() {
        return {
            isRunning: this.isRunning,
            components: {
                core: {
                    status: this.isRunning ? 'running' : 'stopped',
                    // 添加更多核心监控状态信息
                },
                security: {
                    status: this.isRunning ? 'running' : 'stopped',
                    activeTasks: this.securityManager.activeTasks.size
                },
                automation: {
                    status: this.isRunning ? 'running' : 'stopped',
                    scheduledTasks: this.automationManager.tasks.size
                }
            }
        };
    }
}

// 创建单例实例
let instance = null;

function getInstance() {
    if (!instance) {
        instance = new AgentMonitor();
    }
    return instance;
}

module.exports = {
    getInstance
};