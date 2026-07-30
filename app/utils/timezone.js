/**
 * 业务固定时区：Asia/Shanghai（UTC+8，无夏令时）
 * SSR / CSR 日期展示与日历计算统一走此模块，避免依赖进程本地时区
 */

/** IANA 时区名 */
export const APP_TIMEZONE = 'Asia/Shanghai'

/**
 * 格式化为上海时区日历日 YYYY-MM-DD
 * @param {Date|number|string} [input]
 * @returns {string}
 */
export function formatShanghaiDateKey(input = Date.now()) {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: APP_TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date(input))
}

/**
 * 取上海时区年月日时（24 小时制）
 * @param {Date|number|string} [input]
 * @returns {{ year: number, month: number, day: number, hour: number }}
 */
export function getShanghaiParts(input = Date.now()) {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: APP_TIMEZONE,
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    hour: 'numeric',
    hourCycle: 'h23',
  }).formatToParts(new Date(input))
  const map = Object.fromEntries(
    parts.filter((part) => part.type !== 'literal').map((part) => [part.type, part.value]),
  )
  return {
    year: Number(map.year),
    month: Number(map.month),
    day: Number(map.day),
    // hourCycle h23 下午夜为 "24" 的少数环境，归一成 0
    hour: Number(map.hour) % 24,
  }
}

/**
 * 上海时区当前公历年
 * @param {Date|number|string} [input]
 * @returns {number}
 */
export function getShanghaiYear(input = Date.now()) {
  return getShanghaiParts(input).year
}

/**
 * 上海日历日天数差（按当地 0 点取整；startDateKey 为 YYYY-MM-DD）
 * @param {string} startDateKey 起始日，如 2025-06-20
 * @param {Date|number|string} [now]
 * @returns {number}
 */
export function calendarDaysSinceShanghai(startDateKey, now = Date.now()) {
  const todayKey = formatShanghaiDateKey(now)
  const startMs = Date.parse(`${startDateKey}T00:00:00+08:00`)
  const todayMs = Date.parse(`${todayKey}T00:00:00+08:00`)
  if (!Number.isFinite(startMs) || !Number.isFinite(todayMs)) {
    return 0
  }
  return Math.max(0, Math.round((todayMs - startMs) / 86_400_000))
}
