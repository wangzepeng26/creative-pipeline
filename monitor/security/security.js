const config = require('../config/config').security;
const os = require('os');
const path = require('path');

class SecurityManager {
    constructor() {
        this.activeTasks = new Map();
    }

    // 初始化安全管理器
    async initialize() {
        try {
            await this.setupIsolation();
            console.log('Security manager initialized');
        } catch (error) {
            console.error('Failed to initialize security manager:', error);
            throw error;
        }
    }

    // 设置任务隔离环境
    async setupIsolation() {
        if (!config.isolation.enabled) {
            return;
        }

        // TODO: 实现沙箱环境设置
        console.log('Task isolation enabled');
    }

    // 检查资源限制
    async checkResourceLimits(taskId, resources) {
        const limits = config.resourceLimits;

        if (resources.cpu > limits.maxCpuPercent) {
            throw new Error(`Task ${taskId} exceeded CPU limit`);
        }

        if (resources.memory > limits.maxMemoryMB * 1024 * 1024) {
            throw new Error(`Task ${taskId} exceeded memory limit`);
        }

        if (resources.disk > limits.maxDiskGB * 1024 * 1024 * 1024) {
            throw new Error(`Task ${taskId} exceeded disk limit`);
        }

        return true;
    }

    // 分配任务优先级
    assignPriority(task) {
        // 根据任务类型和配置分配优先级
        if (task.type === 'system') {
            return config.priorities.critical;
        }
        if (task.type === 'user') {
            return config.priorities.medium;
        }
        return config.priorities.low;
    }

    // 注册新任务
    registerTask(taskId, taskInfo) {
        const priority = this.assignPriority(taskInfo);
        this.activeTasks.set(taskId, {
            ...taskInfo,
            priority,
            startTime: Date.now()
        });
    }

    // 移除任务
    unregisterTask(taskId) {
        this.activeTasks.delete(taskId);
    }

    // 获取任务优先级
    getTaskPriority(taskId) {
        const task = this.activeTasks.get(taskId);
        return task ? task.priority : config.priorities.low;
    }

    // 检查任务是否可以运行
    async canTaskRun(taskId, resources) {
        try {
            // 检查资源限制
            await this.checkResourceLimits(taskId, resources);

            // 检查优先级和当前负载
            const priority = this.getTaskPriority(taskId);
            const systemLoad = await this.getSystemLoad();

            // 如果系统负载高，只允许高优先级任务运行
            if (systemLoad.high && priority < config.priorities.high) {
                return false;
            }

            return true;
        } catch (error) {
            console.error(`Task ${taskId} permission check failed:`, error);
            return false;
        }
    }

    // 获取系统负载状态
    async getSystemLoad() {
        const cpuLoad = os.loadavg()[0];
        const memoryUsed = (os.totalmem() - os.freemem()) / os.totalmem();

        return {
            high: cpuLoad > 0.8 || memoryUsed > 0.85,
            cpuLoad,
            memoryUsed
        };
    }

    // 隔离任务运行环境
    async isolateTask(taskId) {
        if (!config.isolation.enabled) {
            return null;
        }

        const sandboxPath = path.join(config.isolation.sandboxPath, taskId);
        // TODO: 实现任务隔离逻辑
        return sandboxPath;
    }

    // 清理隔离环境
    async cleanupIsolation(taskId) {
        if (!config.isolation.enabled) {
            return;
        }

        // TODO: 实现清理隔离环境的逻辑
        console.log(`Cleaning up isolation for task ${taskId}`);
    }

    // 停止安全管理器
    async stop() {
        // 清理所有活动任务
        for (const [taskId] of this.activeTasks) {
            await this.cleanupIsolation(taskId);
            this.unregisterTask(taskId);
        }

        console.log('Security manager stopped');
    }
}

module.exports = SecurityManager;