/**
 * 采集浏览器指纹与访客特征（仅客户端；失败时返回尽量多的可用字段）
 */

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
 * 是否为常见私网 / 链路本地 IPv4
 * @param {string} ip
 * @returns {boolean}
 */
function isPrivateOrLinkLocalIpv4(ip) {
  if (!/^\d{1,3}(?:\.\d{1,3}){3}$/.test(ip)) return false
  const parts = ip.split('.').map((n) => Number(n))
  if (parts.some((n) => Number.isNaN(n) || n < 0 || n > 255)) return false
  const [a, b] = parts
  // 10.0.0.0/8、172.16.0.0/12、192.168.0.0/16、169.254.0.0/16
  if (a === 10) return true
  if (a === 172 && b >= 16 && b <= 31) return true
  if (a === 192 && b === 168) return true
  if (a === 169 && b === 254) return true
  return false
}

/**
 * WebRTC 试探局域网 IP（无权限弹窗；失败/超时返回空数组）
 * @param {number} [timeoutMs=1200]
 * @returns {Promise<string[]>}
 */
function probeLanIpsViaWebRtc(timeoutMs = 1200) {
  return new Promise((resolve) => {
    const RTCPeerConnection =
      window.RTCPeerConnection || window.webkitRTCPeerConnection || window.mozRTCPeerConnection
    if (!RTCPeerConnection) {
      resolve([])
      return
    }

    /** @type {Set<string>} */
    const found = new Set()
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
      resolve([...found])
    }

    const timer = window.setTimeout(finish, timeoutMs)

    try {
      // 不配公网 STUN 也能出 host candidate；再加一个常见 STUN 提高出候选概率
      pc = new RTCPeerConnection({
        iceServers: [{ urls: 'stun:stun.l.google.com:19302' }],
      })

      pc.createDataChannel('yunfeng-lan-probe')

      pc.onicecandidate = (event) => {
        const candidate = event.candidate?.candidate
        if (!candidate) {
          // null candidate 表示 ICE 收集结束
          if (event.candidate === null) finish()
          return
        }
        // candidate 形如：... typ host ... 或含 IP
        const ipv4Matches = candidate.match(/\b(?:\d{1,3}\.){3}\d{1,3}\b/g) || []
        for (const ip of ipv4Matches) {
          if (isPrivateOrLinkLocalIpv4(ip)) {
            found.add(ip)
          }
        }
        // 已拿到至少一个局域网 IP 可提前结束，避免拖慢提交
        if (found.size > 0 && candidate.includes('typ host')) {
          finish()
        }
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
 * @returns {Promise<{ fingerprint: string, traits: Record<string, unknown> } | null>}
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
  // 试探局域网 IP；拿不到则为 []，不影响其余字段
  const lanIps = await probeLanIpsViaWebRtc()

  // 尽量覆盖可稳定采集的设备 / 环境特征
  const traits = {
    userAgent: String(nav.userAgent || ''),
    language: String(nav.language || ''),
    languages: Array.isArray(nav.languages) ? [...nav.languages] : [],
    platform: String(nav.platform || ''),
    vendor: String(nav.vendor || ''),
    hardwareConcurrency: Number(nav.hardwareConcurrency) || 0,
    deviceMemory: Number(nav.deviceMemory) || 0,
    maxTouchPoints: Number(nav.maxTouchPoints) || 0,
    cookieEnabled: Boolean(nav.cookieEnabled),
    doNotTrack: nav.doNotTrack == null ? '' : String(nav.doNotTrack),
    screenWidth: Number(scr?.width) || 0,
    screenHeight: Number(scr?.height) || 0,
    screenAvailWidth: Number(scr?.availWidth) || 0,
    screenAvailHeight: Number(scr?.availHeight) || 0,
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
    // 仅在 WebRTC 暴露出私网地址时有值
    lanIps,
  }

  const fingerprintSource = [
    traits.userAgent,
    traits.language,
    traits.platform,
    traits.hardwareConcurrency,
    traits.deviceMemory,
    traits.maxTouchPoints,
    traits.screenWidth,
    traits.screenHeight,
    traits.colorDepth,
    traits.pixelRatio,
    traits.timezone,
    traits.canvasFingerprint,
    traits.webglVendor,
    traits.webglRenderer,
  ].join('|')

  const fingerprint = await hashFingerprint(fingerprintSource)
  return { fingerprint, traits }
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
