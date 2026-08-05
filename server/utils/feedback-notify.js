/**
 * 反馈相关：向 NotifyX 发送用户建议与关联的访客环境信息
 */

/**
 * 规范化关联编号 / 访客编号
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
 * @returns {{ visitorId: string, fingerprint: string, traits: Record<string, unknown> }}
 */
export function sanitizeClientMeta(raw) {
  const empty = { visitorId: '', fingerprint: '', traits: {} }
  if (!raw || typeof raw !== 'object') {
    return empty
  }
  const fingerprint = String(raw.fingerprint || '')
    .trim()
    .slice(0, 128)
  const visitorId =
    normalizeCorrelationId(raw.visitorId) ||
    normalizeCorrelationId(raw.traits && typeof raw.traits === 'object' ? raw.traits.visitorId : '')
  const src = raw.traits && typeof raw.traits === 'object' ? raw.traits : {}
  /** @type {Record<string, unknown>} */
  const traits = {}
  for (const [key, value] of Object.entries(src)) {
    if (Object.keys(traits).length >= 56) break
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
  if (visitorId && !traits.visitorId) {
    traits.visitorId = visitorId
  }
  return { visitorId, fingerprint, traits }
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
 * 取值展示；空则用占位
 * @param {unknown} value
 * @param {string} [fallback='(无)']
 */
function display(value, fallback = '(无)') {
  if (value == null || value === '') return fallback
  if (Array.isArray(value)) {
    return value.length ? value.join(', ') : fallback
  }
  return String(value)
}

/**
 * 追加一节标题 + 若干「标签：值」行（跳过空值可选）
 * @param {string[]} lines
 * @param {string} heading
 * @param {Array<[string, unknown]>} rows
 * @param {{ skipEmpty?: boolean }} [opts]
 */
function pushSection(lines, heading, rows, opts = {}) {
  const body = []
  for (const [label, value] of rows) {
    if (
      opts.skipEmpty &&
      (value == null || value === '' || (Array.isArray(value) && !value.length))
    ) {
      continue
    }
    body.push(`${label}：${display(value)}`)
  }
  if (!body.length) return
  if (lines.length) lines.push('')
  lines.push(`【${heading}】`)
  lines.push(...body)
}

/**
 * 组装访客环境信息正文（分段排版，避免一整坨 JSON）
 * @param {{
 *   correlationId: string
 *   ip: string
 *   visitorId: string
 *   fingerprint: string
 *   traits: Record<string, unknown>
 *   requestUserAgent: string
 *   requestAcceptLanguage: string
 * }} info
 * @returns {string}
 */
export function buildVisitorMetaContent(info) {
  const t = info.traits || {}
  const lanIps = Array.isArray(t.lanIps) ? t.lanIps : []
  const mdnsHosts = Array.isArray(t.mdnsHosts) ? t.mdnsHosts : []
  const visitorId = info.visitorId || t.visitorId || ''
  const fp = info.fingerprint || ''
  const fpShort = fp ? `${fp.slice(0, 16)}…` : '(未采集)'

  /** @type {string[]} */
  const lines = []

  pushSection(lines, '对照', [
    ['关联编号', info.correlationId],
    // 同浏览器多次反馈不变，出口 IP 相同时也靠它区分人
    ['访客编号', visitorId || '(未生成)'],
    ['设备指纹', fpShort],
    ['指纹全文', fp || '(未采集)'],
  ])

  pushSection(lines, '网络', [
    ['公网 IP', info.ip || 'unknown'],
    ['局域网 IP', lanIps.length ? lanIps.join(', ') : '(未获取)'],
    ['本机主机名', mdnsHosts.length ? mdnsHosts.join(', ') : '(未获取)'],
    ['网络类型', t.connectionType],
    ['下行估算 Mbps', t.downlink],
    ['请求 Accept-Language', info.requestAcceptLanguage],
  ])

  pushSection(lines, '设备', [
    ['平台', t.platform],
    ['UA 平台', t.uaPlatform],
    ['UA 平台版本', t.uaPlatformVersion],
    ['架构', t.uaArch],
    ['位数', t.uaBitness],
    ['机型', t.uaModel],
    ['是否移动端', t.uaMobile],
    ['逻辑 CPU', t.hardwareConcurrency],
    ['内存 GB', t.deviceMemory],
    ['触摸点', t.maxTouchPoints],
    ['屏幕', t.screen],
    ['可用屏幕', t.screenAvail],
    ['色深', t.colorDepth],
    ['像素比', t.pixelRatio],
    ['时区', t.timezone],
    ['时区偏移(分)', t.timezoneOffsetMin],
    ['色彩偏好', t.colorScheme],
    ['WebGL 厂商', t.webglVendor],
    ['WebGL 渲染', t.webglRenderer],
    ['Canvas 指纹', t.canvasFingerprint],
  ])

  pushSection(lines, '浏览器', [
    ['语言', t.language],
    ['语言列表', t.languages],
    ['品牌', t.uaBrands],
    ['完整版本', t.uaFullVersions],
    ['User-Agent', t.userAgent || info.requestUserAgent],
    ['Vendor', t.vendor],
    ['Cookie', t.cookieEnabled === true ? '开' : t.cookieEnabled === false ? '关' : ''],
    ['DNT', t.doNotTrack],
    ['在线', t.online === true ? '是' : t.online === false ? '否' : ''],
    ['减少动效', t.reducedMotion === true ? '是' : t.reducedMotion === false ? '否' : ''],
  ])

  pushSection(lines, '页面', [
    ['当前地址', t.locationHref],
    ['来源页', t.referrer],
  ])

  // NotifyX content 控制在 2000 字内
  return lines.join('\n').slice(0, 2000)
}
