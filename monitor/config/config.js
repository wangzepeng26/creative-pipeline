module.exports = {
    // 核心配置
    core: {
        healthCheck: {
            interval: 30000,  // 健康检查间隔(ms)
            timeout: 5000,    // 健康检查超时时间
            retryAttempts: 3, // 重试次数
        },
        resources: {
            checkInterval: 60000,  // 资源监控间隔
            limits: {
                cpu: 80,     // CPU使用率警告阈值(%)
                memory: 85,  // 内存使用率警告阈值(%)
                disk: 90,    // 磁盘使用率警告阈值(%)
            }
        },
        recovery: {
            autoRestart: true,     // 是否自动重启
            maxRestartAttempts: 3, // 最大重启尝试次数
            cooldownPeriod: 300000 // 重启冷却时间(ms)
        }
    },

    // 安全配置
    security: {
        resourceLimits: {
            maxCpuPercent: 90,    // 最大CPU使用率
            maxMemoryMB: 1024,    // 最大内存使用(MB)
            maxDiskGB: 10         // 最大磁盘使用(GB)
        },
        priorities: {
            low: 1,
            medium: 2,
            high: 3,
            critical: 4
        },
        isolation: {
            enabled: true,
            sandboxPath: './sandbox'
        }
    },

    // 自动化配置
    automation: {
        startup: {
            enabled: true,
            order: ['monitor', 'security', 'tasks']
        },
        scheduling: {
            enabled: true,
            taskCheckInterval: 60000
        },
        logging: {
            level: 'info',         // 日志级别
            maxFiles: 10,          // 最大日志文件数
            maxSize: '10m',        // 单个日志文件大小限制
            path: './logs'         // 日志存储路径
        }
    }
};