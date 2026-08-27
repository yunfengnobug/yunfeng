/**
 * 订婚视频配置读取（app_settings.love.engagement_video）
 */
import { query, resolveDatabaseUrl } from './db.js'

/** 与 admin 相同的配置键 */
export const ENGAGEMENT_VIDEO_SETTING_KEY = 'love.engagement_video'

/**
 * 解析库内 JSON
 * @param {string} [raw]
 * @returns {{ url: string, qiniu_key: string }}
 */
export function parseEngagementVideoValue(raw) {
  const text = String(raw || '').trim()
  if (!text) {
    return { url: '', qiniu_key: '' }
  }
  try {
    const data = JSON.parse(text)
    return {
      url: String(data?.url || '').trim(),
      qiniu_key: String(data?.qiniu_key || '')
        .trim()
        .replace(/^\/+/, ''),
    }
  } catch {
    return { url: '', qiniu_key: '' }
  }
}

/**
 * 读取当前订婚视频；库未配置或失败时返回空
 * @returns {Promise<{ url: string, qiniu_key: string }>}
 */
export async function getEngagementVideoMeta() {
  if (!resolveDatabaseUrl()) {
    return { url: '', qiniu_key: '' }
  }
  try {
    const rows = await query('SELECT `value` FROM app_settings WHERE `key` = ? LIMIT 1', [
      ENGAGEMENT_VIDEO_SETTING_KEY,
    ])
    return parseEngagementVideoValue(rows?.[0]?.value)
  } catch (error) {
    console.error('[engagement-video]', error?.message || error)
    return { url: '', qiniu_key: '' }
  }
}
