/**
 * MySQL 连接工具：用 DATABASE_URL（URI）建池，只读婚纱照 / 订婚视频等
 */
import mysql from 'mysql2/promise'

/** 进程内复用的连接池 */
let pool = null

/**
 * 解析 MySQL 连接 URI
 * 优先 runtimeConfig，再回退进程环境（兼容本地 .env / PM2 .runtime.env）
 * @returns {string}
 */
export function resolveDatabaseUrl() {
  const config = useRuntimeConfig()
  return String(
    config.databaseUrl || process.env.NUXT_DATABASE_URL || process.env.DATABASE_URL || '',
  ).trim()
}

/**
 * 是否按 URI 查询参数开启 TLS（Aiven 为 ssl-mode=REQUIRED）
 * mysql2 不认 ssl-mode，须转成 ssl 选项
 * @param {URLSearchParams} searchParams
 * @returns {boolean}
 */
function isSslEnabled(searchParams) {
  const sslMode = (searchParams.get('ssl-mode') || searchParams.get('sslMode') || '').toLowerCase()
  if (['required', 'verify_ca', 'verify_identity', 'preferred', 'true', '1'].includes(sslMode)) {
    return true
  }
  const ssl = (searchParams.get('ssl') || '').toLowerCase()
  return ssl === 'true' || ssl === '1' || ssl === 'required' || ssl === 'yes'
}

/**
 * 由 URI 生成 mysql2 连接池配置（凭证仍走 uri，不拆 host/password 环境变量）
 * @param {string} rawUri
 * @returns {import('mysql2/promise').PoolOptions}
 */
function buildPoolOptionsFromUri(rawUri) {
  let url
  try {
    url = new URL(rawUri)
  } catch {
    throw new Error('DATABASE_URL 格式无效（应为 mysql://user:pass@host:port/dbname）')
  }
  if (url.protocol !== 'mysql:' && url.protocol !== 'mysql2:') {
    throw new Error('DATABASE_URL 协议须为 mysql:// 或 mysql2://')
  }

  const needSsl = isSslEnabled(url.searchParams)
  // 去掉 mysql2 无法识别的查询参数，避免告警
  url.searchParams.delete('ssl-mode')
  url.searchParams.delete('sslMode')
  url.searchParams.delete('ssl')

  return {
    uri: url.toString(),
    ...(needSsl ? { ssl: { rejectUnauthorized: false } } : {}),
    waitForConnections: true,
    connectionLimit: 5,
    // 与 admin 一致：Aiven 服务器时区为 UTC，按 +08:00 解释 DATETIME
    timezone: '+08:00',
  }
}

/**
 * 获取（或创建）MySQL 连接池
 * @returns {import('mysql2/promise').Pool}
 */
export function getDbPool() {
  if (pool) {
    return pool
  }

  const uri = resolveDatabaseUrl()
  if (!uri) {
    throw new Error('数据库未配置（缺少 DATABASE_URL）')
  }

  pool = mysql.createPool(buildPoolOptionsFromUri(uri))

  return pool
}

/**
 * 执行 SQL 查询
 * @param {string} sql SQL 语句
 * @param {any[]} [params] 绑定参数
 * @returns {Promise<any>}
 */
export async function query(sql, params = []) {
  const db = getDbPool()
  const [rows] = await db.execute(sql, params)
  return rows
}
