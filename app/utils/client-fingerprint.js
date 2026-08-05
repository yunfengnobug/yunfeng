/**
 * 采集浏览器指纹与访客特征（仅客户端；失败时返回尽量多的可用字段）
 */

/** localStorage 中的稳定访客编号键（同浏览器多次反馈可对照） */
const VISITOR_ID_KEY = 'yunfeng-visitor-id'

/**
 * 简易字符串哈希（djb2），用于 canvas / WebGL 摘要
 * @param {string} input
 * @returns {string}
 */
function djb2Hex(input) {
  let hash = 5381
  for (let i = 0; i < input.length; i += 1) {
    hash = (hash * 33) ^ input.charCodeAt(i)
  }
  return (hash >>> 0).toString(16).padStart(8, '0')
}

/**
 * Canvas 指纹片段
 * @returns {string}
 */
function getCanvasFingerprint() {
  try {
    const canvas = document.createElement('canvas')
    canvas.width = 240
    canvas.height = 60
    const ctx = canvas.getContext('2d')
    if (!ctx) return ''
    ctx.textBaseline = 'top'
    ctx.font = '14px Arial'
    ctx.fillStyle = '#f60'
    ctx.fillRect(10, 8, 120, 30)
    ctx.fillStyle = '#069'
    ctx.fillText('yunfeng-fp', 12, 12)
    ctx.strokeStyle = 'rgba(0,120,80,.7)'
    ctx.beginPath()
    ctx.arc(80, 30, 18, 0, Math.PI * 2)
    ctx.stroke()
    return djb2Hex(canvas.toDataURL())
  } catch {
    return ''
  }
}

/**
 * WebGL 渲染器信息
 * @returns {{ vendor: string, renderer: string }}
 */
function getWebglInfo() {
  try {
    const canvas = document.createElement('canvas')
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl')
    if (!gl) return { vendor: '', renderer: '' }
    const debugInfo = gl.getExtension('WEBGL_debug_renderer_info')
    if (!debugInfo) return { vendor: '', renderer: '' }
    return {
      vendor: String(gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL) || ''),
      renderer: String(gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) || ''),
    }
  } catch {
    return { vendor: '', renderer: '' }
  }
}

/**
 * 用 SubtleCrypto 对特征串做 SHA-256；不可用时回退 djb2
 * @param {string} input
 * @returns {Promise<string>}
 */
async function hashFingerprint(input) {
  try {
    if (globalThis.crypto?.subtle) {
      const data = new TextEncoder().encode(input)
      const buf = await crypto.subtle.digest('SHA-256', data)
      return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('')
    }
  } catch {
    // 回退下方 djb2
  }
  return djb2Hex(input)
}

/**
 * 读取或生成本机持久访客编号（同浏览器跨次反馈不变）
 * @returns {string}
 */
function getOrCreateVisitorId() {
  try {
    const existing = String(localStorage.getItem(VISITOR_ID_KEY) || '').trim()
    if (/^[a-zA-Z0-9_-]{8,64}$/.test(existing)) {
      return existing
    }
    const next =
      globalThis.crypto?.randomUUID?.() ||
      `v-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`
    localStorage.setItem(VISITOR_ID_KEY, next)
    return next
  } catch {
    return `v-ephemeral-${Date.now().toString(36)}`
  }
}

/**
 * 是否为常见私网 / 链路本地 IPv4
 * @param {string} ip
 * @returns {boolean}
 */
function isPrivateOrLinkLocalIpv4(ip) {
  if (!/^\d{1,3}(?:\.\d{1,3}){3}$/.test(ip)) return false
  const parts = ip.split('.').map((n) => Number(n))
  if (parts.some((n) => Number.isNaN(n) || n < 0 || n > 255)) return false
  const [a, b] = parts
  if (a === 10) return true
  if (a === 172 && b >= 16 && b <= 31) return true
  if (a === 192 && b === 168) return true
  if (a === 169 && b === 254) return true
  return false
}

/**
 * WebRTC 试探局域网 IP 与 mDNS 主机名（无权限弹窗；失败返回空）
 * @param {number} [timeoutMs=1600]
 * @returns {Promise<{ lanIps: string[], mdnsHosts: string[] }>}
 */
function probeLanViaWebRtc(timeoutMs = 1600) {
  return new Promise((resolve) => {
    const RTCPeerConnection =
      window.RTCPeerConnection || window.webkitRTCPeerConnection || window.mozRTCPeerConnection
    if (!RTCPeerConnection) {
      resolve({ lanIps: [], mdnsHosts: [] })
      return
    }

    /** @type {Set<string>} */
    const lanIps = new Set()
    /** @type {Set<string>} */
    const mdnsHosts = new Set()
    let settled = false
    /** @type {RTCPeerConnection | null} */
    let pc = null

    // 结束探测并清理连接
    function finish() {
      if (settled) return
      settled = true
      window.clearTimeout(timer)
      try {
        if (pc) {
          pc.onicecandidate = null
          pc.close()
        }
      } catch {
        // ignore
      }
      resolve({ lanIps: [...lanIps], mdnsHosts: [...mdnsHosts] })
    }

    const timer = window.setTimeout(finish, timeoutMs)

    // 从 ICE candidate 提取私网 IP / mDNS 主机名
    function ingestCandidate(candidateObj) {
      if (!candidateObj) return
      const raw = String(candidateObj.candidate || '')
      const address = String(candidateObj.address || '')
      const typ = String(candidateObj.type || '')

      const addresses = new Set()
      if (address) addresses.add(address)
      for (const ip of raw.match(/\b(?:\d{1,3}\.){3}\d{1,3}\b/g) || []) {
        addresses.add(ip)
      }
      for (const host of raw.match(/\b[a-zA-Z0-9][a-zA-Z0-9-]{0,62}\.local\b/gi) || []) {
        mdnsHosts.add(host.toLowerCase())
      }
      if (address.endsWith('.local')) {
        mdnsHosts.add(address.toLowerCase())
      }

      for (const item of addresses) {
        if (isPrivateOrLinkLocalIpv4(item)) {
          lanIps.add(item)
        }
      }

      // host 类型且已有可用线索时可提前结束
      if (typ === 'host' && (lanIps.size > 0 || mdnsHosts.size > 0)) {
        // 稍等其它 candidate，避免只收到一条就关
        window.setTimeout(finish, 280)
      }
    }

    try {
      pc = new RTCPeerConnection({
        iceServers: [{ urls: 'stun:stun.l.google.com:19302' }],
      })
      pc.createDataChannel('yunfeng-lan-probe')
      pc.onicecandidate = (event) => {
        if (event.candidate) {
          ingestCandidate(event.candidate)
          return
        }
        // null candidate：ICE 收集结束
        finish()
      }
      pc.createOffer()
        .then((offer) => pc.setLocalDescription(offer))
        .catch(() => finish())
    } catch {
      finish()
    }
  })
}

/**
 * 采集当前访客浏览器特征与指纹（须在浏览器环境调用）
 * @returns {Promise<{
 *   visitorId: string
 *   fingerprint: string
 *   traits: Record<string, unknown>
 * } | null>}
 */
export async function collectClientVisitorMeta() {
  if (!import.meta.client || typeof window === 'undefined' || typeof navigator === 'undefined') {
    return null
  }

  const nav = navigator
  const scr = window.screen
  const webgl = getWebglInfo()
  const canvasFp = getCanvasFingerprint()
  const connection = nav.connection || nav.mozConnection || nav.webkitConnection
  const visitorId = getOrCreateVisitorId()
  const lanProbe = await probeLanViaWebRtc()

  // 尽量覆盖可稳定采集的设备 / 环境特征（UA 只保留完整字符串，不拆 Client Hints）
  const traits = {
    visitorId,
    userAgent: String(nav.userAgent || ''),
    language: String(nav.language || ''),
    languages: Array.isArray(nav.languages) ? [...nav.languages].join(', ') : '',
    platform: String(nav.platform || ''),
    vendor: String(nav.vendor || ''),
    hardwareConcurrency: Number(nav.hardwareConcurrency) || 0,
    deviceMemory: Number(nav.deviceMemory) || 0,
    maxTouchPoints: Number(nav.maxTouchPoints) || 0,
    cookieEnabled: Boolean(nav.cookieEnabled),
    doNotTrack: nav.doNotTrack == null ? '' : String(nav.doNotTrack),
    screen: `${Number(scr?.width) || 0}×${Number(scr?.height) || 0}`,
    screenAvail: `${Number(scr?.availWidth) || 0}×${Number(scr?.availHeight) || 0}`,
    colorDepth: Number(scr?.colorDepth) || 0,
    pixelRatio: Number(window.devicePixelRatio) || 1,
    timezone: (() => {
      try {
        return Intl.DateTimeFormat().resolvedOptions().timeZone || ''
      } catch {
        return ''
      }
    })(),
    timezoneOffsetMin: new Date().getTimezoneOffset(),
    colorScheme: window.matchMedia?.('(prefers-color-scheme: dark)')?.matches ? 'dark' : 'light',
    reducedMotion: Boolean(window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches),
    online: Boolean(nav.onLine),
    connectionType: connection?.effectiveType ? String(connection.effectiveType) : '',
    downlink: connection?.downlink != null ? Number(connection.downlink) : null,
    canvasFingerprint: canvasFp,
    webglVendor: webgl.vendor,
    webglRenderer: webgl.renderer,
    locationHref: String(window.location?.href || ''),
    referrer: String(document.referrer || ''),
    lanIps: lanProbe.lanIps,
    mdnsHosts: lanProbe.mdnsHosts,
  }

  const fingerprintSource = [
    visitorId,
    traits.userAgent,
    traits.language,
    traits.platform,
    traits.hardwareConcurrency,
    traits.deviceMemory,
    traits.maxTouchPoints,
    traits.screen,
    traits.colorDepth,
    traits.pixelRatio,
    traits.timezone,
    traits.canvasFingerprint,
    traits.webglVendor,
    traits.webglRenderer,
  ].join('|')

  const fingerprint = await hashFingerprint(fingerprintSource)
  return { visitorId, fingerprint, traits }
}

/**
 * 生成反馈关联编号（两条 NotifyX 共用）
 * @returns {string}
 */
export function createFeedbackCorrelationId() {
  if (import.meta.client && globalThis.crypto?.randomUUID) {
    return crypto.randomUUID()
  }
  return `yf-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`
}
