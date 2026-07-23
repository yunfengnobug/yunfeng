/**
 * MySQL 连接工具：按 runtimeConfig 创建连接池（只读查询婚纱照等）
 */
import mysql from 'mysql2/promise'

/** 进程内复用的连接池 */
let pool = null

/**
 * 获取（或创建）MySQL 连接池
 * @returns {import('mysql2/promise').Pool}
 */
export function getDbPool() {
  if (pool) {
    return pool
  }

  const config = useRuntimeConfig()

  pool = mysql.createPool({
    host: config.dbHost,
    port: Number(config.dbPort),
    user: config.dbUser,
    password: config.dbPassword,
    database: config.dbName,
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
