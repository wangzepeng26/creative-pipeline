const os = require('os');
const fs = require('fs');
const path = require('path');
const config = require('../config/config').core;

class CoreMonitor {
    constructor() {
        this.healthCheckTimer = null;
        this.resourceCheckTimer = null;
        this.restartAttempts = 0;
        this.lastRestartTime = 0;
    }

    // 启动核心监控
    async start() {
        try {
            this.startHealthCheck();
            this.startResourceMonitor();
            console.log('Core monitor started successfully');
        } catch (error) {
            console.error('Failed to start core monitor:', error);
            throw error;
        }
    }

    // 健康检查
    async checkHealth() {
        try {
            // 检查主代理进程
            const agentStatus = await this.checkAgentProcess();
            if (!agentStatus.healthy) {
                console.warn(`Agent health check failed: ${agentStatus.reason}`);
                await this.handleUnhealthyAgent(agentStatus);
            }
        } catch (error) {
            console.error('Health check failed:', error);
        }
    }

    // 检查代理进程状态
    async checkAgentProcess() {
        // TODO: 实现具体的进程检查逻辑
        return {
            healthy: true,
            pid: process.pid,
            reason: null
        };
    }

    // 资源使用监控
    async checkResources() {
        const resources = {
            cpu: await this.getCpuUsage(),
            memory: this.getMemoryUsage(),
            disk: await this.getDiskUsage()
        };

        this.checkResourceLimits(resources);
        return resources;
    }

    // 获取CPU使用率
    async getCpuUsage() {
        const cpus = os.cpus();
        const totalCpu = cpus.reduce((acc, cpu) => {
            acc.total += Object.values(cpu.times).reduce((a, b) => a + b);
            acc.idle += cpu.times.idle;
            return acc;
        }, { total: 0, idle: 0 });

        return ((1 - totalCpu.idle / totalCpu.total) * 100).toFixed(2);
    }

    // 获取内存使用率
    getMemoryUsage() {
        const total = os.totalmem();
        const free = os.freemem();
        return ((1 - free / total) * 100).toFixed(2);
    }

    // 获取磁盘使用率
    async getDiskUsage() {
        // TODO: 实现磁盘使用率检查
        return 0;
    }

    // 检查资源使用是否超限
    checkResourceLimits(resources) {
        const { limits } = config.resources;
        
        if (resources.cpu > limits.cpu) {
            console.warn(`High CPU usage: ${resources.cpu}%`);
        }
        if (resources.memory > limits.memory) {
            console.warn(`High memory usage: ${resources.memory}%`);
        }
        if (resources.disk > limits.disk) {
            console.warn(`High disk usage: ${resources.disk}%`);
        }
    }

    // 处理不健康的代理
    async handleUnhealthyAgent(status) {
        if (!config.recovery.autoRestart) {
            console.log('Auto restart is disabled');
            return;
        }

        const now = Date.now();
        if (now - this.lastRestartTime < config.recovery.cooldownPeriod) {
            console.log('In cooldown period, skipping restart');
            return;
        }

        if (this.restartAttempts >= config.recovery.maxRestartAttempts) {
            console.error('Max restart attempts reached');
            return;
        }

        try {
            await this.restartAgent();
            this.restartAttempts++;
            this.lastRestartTime = now;
        } catch (error) {
            console.error('Failed to restart agent:', error);
        }
    }

    // 重启代理
    async restartAgent() {
        // TODO: 实现代理重启逻辑
        console.log('Restarting agent...');
    }

    // 启动健康检查定时器
    startHealthCheck() {
        this.healthCheckTimer = setInterval(
            () => this.checkHealth(),
            config.healthCheck.interval
        );
    }

    // 启动资源监控定时器
    startResourceMonitor() {
        this.resourceCheckTimer = setInterval(
            () => this.checkResources(),
            config.resources.checkInterval
        );
    }

    // 停止监控
    stop() {
        if (this.healthCheckTimer) {
            clearInterval(this.healthCheckTimer);
        }
        if (this.resourceCheckTimer) {
            clearInterval(this.resourceCheckTimer);
        }
        console.log('Core monitor stopped');
    }
}

module.exports = CoreMonitor;