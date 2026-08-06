/**
 * MySQL 连接工具：按 DATABASE_URL（URI）创建连接池（只读查询婚纱照等）
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

  pool = mysql.createPool({
    // mysql://user:pass@host:port/database
    uri,
    waitForConnections: true,
    connectionLimit: 5,
  })

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
