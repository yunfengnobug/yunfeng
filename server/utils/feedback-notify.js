/**
 * 反馈相关：向 NotifyX 发送用户建议与关联的访客环境信息
 */

/**
 * 规范化关联编号
 * @param {unknown} raw
 * @returns {string}
 */
export function normalizeCorrelationId(raw) {
  const id = String(raw || '')
    .trim()
    .slice(0, 64)
  if (/^[a-zA-Z0-9_-]{8,64}$/.test(id)) {
    return id
  }
  return ''
}

/**
 * 清洗客户端上报的特征对象，限制体积与类型
 * @param {unknown} raw
 * @returns {{ fingerprint: string, traits: Record<string, unknown> }}
 */
export function sanitizeClientMeta(raw) {
  const empty = { fingerprint: '', traits: {} }
  if (!raw || typeof raw !== 'object') {
    return empty
  }
  const fingerprint = String(raw.fingerprint || '')
    .trim()
    .slice(0, 128)
  const src = raw.traits && typeof raw.traits === 'object' ? raw.traits : {}
  /** @type {Record<string, unknown>} */
  const traits = {}
  for (const [key, value] of Object.entries(src)) {
    if (traits && Object.keys(traits).length >= 48) break
    const safeKey = String(key).slice(0, 48)
    if (typeof value === 'string') {
      traits[safeKey] = value.slice(0, 500)
    } else if (typeof value === 'number' || typeof value === 'boolean' || value == null) {
      traits[safeKey] = value
    } else if (Array.isArray(value)) {
      traits[safeKey] = value
        .slice(0, 20)
        .map((item) => (typeof item === 'string' ? item.slice(0, 80) : item))
    } else {
      traits[safeKey] = String(value).slice(0, 200)
    }
  }
  return { fingerprint, traits }
}

/**
 * 调用 NotifyX 发送一条消息
 * @param {string} notifyxKey
 * @param {{ title: string, content: string, description?: string }} payload
 */
export async function sendNotifyxMessage(notifyxKey, payload) {
  return $fetch(`https://www.notifyx.cn/api/v1/send/${notifyxKey}`, {
    method: 'POST',
    body: payload,
  })
}

/**
 * 组装访客环境信息正文
 * @param {{
 *   correlationId: string
 *   ip: string
 *   fingerprint: string
 *   traits: Record<string, unknown>
 *   requestUserAgent: string
 *   requestAcceptLanguage: string
 * }} info
 * @returns {string}
 */
export function buildVisitorMetaContent(info) {
  const lanIps = Array.isArray(info.traits?.lanIps)
    ? info.traits.lanIps.filter((item) => typeof item === 'string' && item)
    : []
  const lines = [
    `关联编号：${info.correlationId}`,
    `说明：本条为建议反馈的隐式环境信息，与同编号用户反馈对应。`,
    '',
    `公网 IP：${info.ip || 'unknown'}`,
    // WebRTC 试探结果；多数浏览器拿不到时显示未获取
    `局域网 IP：${lanIps.length ? lanIps.join(', ') : '(未获取)'}`,
    `指纹：${info.fingerprint || '(未采集)'}`,
    `请求 User-Agent：${info.requestUserAgent || '(空)'}`,
    `请求 Accept-Language：${info.requestAcceptLanguage || '(空)'}`,
    '',
    '访客特征：',
    JSON.stringify(info.traits || {}, null, 2),
  ]
  // NotifyX content 与用户反馈一致，控制在 2000 字内
  return lines.join('\n').slice(0, 2000)
}
