/**
 * PM2 进程配置（CommonJS，避免与 package.json type:module 冲突）
 * 端口固定 3001；监听 0.0.0.0 便于 Nginx 反代
 */
module.exports = {
  apps: [
    {
      // 进程名，pm2 list 中显示
      name: 'yunfeng',
      // Nitro 生产入口（CI 将 .output 内容展开到 /server/yunfeng，故无 .output 前缀）
      script: './server/index.mjs',
      // 解释器
      interpreter: 'node',
      // 单实例 fork（SSR 站点够用；多核可改 cluster）
      instances: 1,
      exec_mode: 'fork',
      // 监听文件变化（生产关闭）
      watch: false,
      // 内存超限自动重启
      max_memory_restart: '512M',
      env: {
        NODE_ENV: 'production',
        // Nuxt/Nitro 端口（固定）
        PORT: 3001,
        NITRO_PORT: 3001,
        HOST: '0.0.0.0',
        NITRO_HOST: '0.0.0.0',
      },
      error_file: './logs/err.log',
      out_file: './logs/out.log',
      merge_logs: true,
      time: true,
    },
  ],
}
