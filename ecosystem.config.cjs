/**
 * PM2 进程配置（CommonJS，避免与 package.json type:module 冲突）
 * 端口固定 3001；监听 0.0.0.0 便于 Nginx 反代
 */
const fs = require('fs')
const path = require('path')

/**
 * 读取部署时写入的运行时密钥文件（勿提交仓库）
 * @returns {Record<string, string>}
 */
function loadRuntimeEnv() {
  const envPath = path.join(__dirname, '.runtime.env')
  const result = {}
  if (!fs.existsSync(envPath)) {
    return result
  }
  const text = fs.readFileSync(envPath, 'utf8')
  for (const line of text.split(/\r?\n/)) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) {
      continue
    }
    const idx = trimmed.indexOf('=')
    if (idx <= 0) {
      continue
    }
    const key = trimmed.slice(0, idx).trim()
    const value = trimmed.slice(idx + 1).trim()
    result[key] = value
  }
  return result
}

const runtimeEnv = loadRuntimeEnv()

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
        // 运行时密钥：NotifyX / DB_* 等，由 Actions 写入 .runtime.env 后整表注入
        ...runtimeEnv,
      },
      error_file: './logs/err.log',
      out_file: './logs/out.log',
      merge_logs: true,
      time: true,
    },
  ],
}
