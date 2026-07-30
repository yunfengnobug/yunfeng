/**
 * IP 限流（内存桶；单进程 PM2 足够）
 * - 通用写接口：同 IP 每 10 秒最多 3 次
 * - /api/feedback：每 10 秒最多 3 次；1 分钟内超过 15 次封禁 2 小时；每天超过 30 次封禁 1 天
 */

/** 短窗：10 秒 */
const SHORT_MS = 10 * 1000
/** 短窗上限 */
const SHORT_MAX = 3
/** 分钟窗 */
const MINUTE_MS = 60 * 1000
/** 分钟窗触发封禁阈值（超过即封） */
const MINUTE_BAN_OVER = 15
/** 分钟超限封禁时长：2 小时 */
const BAN_2H_MS = 2 * 60 * 60 * 1000
/** 天窗：24 小时滚动 */
const DAY_MS = 24 * 60 * 60 * 1000
/** 天窗触发封禁阈值（超过即封） */
const DAY_BAN_OVER = 30
/** 天超限封禁时长：1 天 */
const BAN_1D_MS = 24 * 60 * 60 * 1000

/** @type {Map<string, { count: number, resetAt: number }>} */
const shortBuckets = new Map()
/** @type {Map<string, { count: number, resetAt: number }>} */
const minuteBuckets = new Map()
/** @type {Map<string, { count: number, resetAt: number }>} */
const dayBuckets = new Map()
/** @type {Map<string, { until: number }>} */
const bans = new Map()

/**
 * @param {Map<string, { count: number, resetAt: number }>} store
 * @param {string} key
 * @param {number} windowMs
 */
function getBucket(store, key, windowMs) {
  const now = Date.now()
  const cur = store.get(key)
  if (!cur || now >= cur.resetAt) {
    const next = { count: 0, resetAt: now + windowMs }
    store.set(key, next)
    return next
  }
  return cur
}

/**
 * 从请求解析客户端 IP（优先内层 nginx 透传的 X-Real-IP）
 * @param {import('h3').H3Event} event
 */
export function getClientIp(event) {
  const realIp = getRequestHeader(event, 'x-real-ip')
  if (realIp && String(realIp).trim()) {
    return String(realIp).split(',')[0].trim() || 'unknown'
  }
  return getRequestIP(event, { xForwardedFor: true }) || 'unknown'
}

/**
 * @param {string} ip
 * @returns {{ ok: true } | { ok: false, retryAfterSec: number, banned: boolean }}
 */
function checkBan(ip) {
  const now = Date.now()
  const ban = bans.get(ip)
  if (!ban) return { ok: true }
  if (now < ban.until) {
    return {
      ok: false,
      banned: true,
      retryAfterSec: Math.max(1, Math.ceil((ban.until - now) / 1000)),
    }
  }
  bans.delete(ip)
  return { ok: true }
}

/**
 * 通用写接口：同 IP 每 10 秒最多 3 次（超限仅拒绝，不长封）
 * @param {string} ip
 */
export function checkWriteRateLimit(ip) {
  const safeIp = String(ip || 'unknown').trim() || 'unknown'
  const banned = checkBan(safeIp)
  if (!banned.ok) return banned

  const bucket = getBucket(shortBuckets, `w:${safeIp}`, SHORT_MS)
  bucket.count += 1
  if (bucket.count > SHORT_MAX) {
    return {
      ok: false,
      banned: false,
      retryAfterSec: Math.max(1, Math.ceil((bucket.resetAt - Date.now()) / 1000)),
    }
  }
  return { ok: true }
}

/**
 * 反馈接口分层限流
 * @param {string} ip
 */
export function checkFeedbackRateLimit(ip) {
  const safeIp = String(ip || 'unknown').trim() || 'unknown'
  const banned = checkBan(safeIp)
  if (!banned.ok) return banned

  const short = getBucket(shortBuckets, `f:s:${safeIp}`, SHORT_MS)
  const minute = getBucket(minuteBuckets, `f:m:${safeIp}`, MINUTE_MS)
  const day = getBucket(dayBuckets, `f:d:${safeIp}`, DAY_MS)

  short.count += 1
  minute.count += 1
  day.count += 1

  // 天 / 分钟超限：长封（取更长的到期时间）
  if (day.count > DAY_BAN_OVER) {
    const until = Date.now() + BAN_1D_MS
    bans.set(safeIp, { until })
    return { ok: false, banned: true, retryAfterSec: Math.ceil(BAN_1D_MS / 1000) }
  }
  if (minute.count > MINUTE_BAN_OVER) {
    const until = Date.now() + BAN_2H_MS
    const prev = bans.get(safeIp)
    if (!prev || prev.until < until) {
      bans.set(safeIp, { until })
    }
    const finalUntil = bans.get(safeIp).until
    return {
      ok: false,
      banned: true,
      retryAfterSec: Math.max(1, Math.ceil((finalUntil - Date.now()) / 1000)),
    }
  }
  if (short.count > SHORT_MAX) {
    return {
      ok: false,
      banned: false,
      retryAfterSec: Math.max(1, Math.ceil((short.resetAt - Date.now()) / 1000)),
    }
  }
  return { ok: true }
}

/**
 * 反馈接口入口：超限抛 429
 * @param {import('h3').H3Event} event
 */
export function assertFeedbackNotRateLimited(event) {
  const result = checkFeedbackRateLimit(getClientIp(event))
  if (result.ok) return
  setHeader(event, 'Retry-After', String(result.retryAfterSec))
  throw createError({
    statusCode: 429,
    statusMessage: result.banned
      ? `提交过于频繁，请 ${result.retryAfterSec} 秒后再试`
      : `请稍慢一些，每 10 秒最多提交 ${SHORT_MAX} 次`,
  })
}
