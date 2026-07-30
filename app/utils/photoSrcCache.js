/**
 * 婚纱照 CDN 地址处理：七牛 imageView2 压缩 + 已加载标记（无 blob 内存缓存）
 * 文档：https://developer.qiniu.com/dora/1279/basic-processing-images-imageview2
 * 图片复用依赖浏览器 / CDN HTTP 缓存，避免 createObjectURL 长期占内存
 */

/** 已加载标记 LRU 上限（仅存 URL 字符串，体积很小） */
const LOADED_MAX = 120

/** @type {Map<string, true>} 展示 URL → 已加载（Map 保序便于 LRU） */
const loadedMap = new Map()

/**
 * 规范化缓存 key
 * @param {string} url
 */
function normalizeKey(url) {
  return String(url || '')
    .trim()
    .replace(/#.*$/, '')
}

/**
 * LRU：写入已加载标记，超出上限淘汰最旧项
 * @param {string} key
 */
function touchLoaded(key) {
  if (loadedMap.has(key)) {
    loadedMap.delete(key)
  }
  loadedMap.set(key, true)
  while (loadedMap.size > LOADED_MAX) {
    const oldest = loadedMap.keys().next().value
    loadedMap.delete(oldest)
  }
}

/**
 * 清空已加载标记（离开婚纱照页时调用）
 */
export function clearPhotoSrcCache() {
  loadedMap.clear()
}

/**
 * 去掉已有的七牛图片处理参数，得到原图地址
 * @param {string} url
 */
export function getPhotoOriginUrl(url) {
  const raw = String(url || '').trim()
  if (!raw) {
    return ''
  }
  const hashIndex = raw.indexOf('#')
  const withoutHash = hashIndex >= 0 ? raw.slice(0, hashIndex) : raw
  const qIndex = withoutHash.indexOf('?')
  if (qIndex < 0) {
    return withoutHash
  }
  const base = withoutHash.slice(0, qIndex)
  const query = withoutHash.slice(qIndex + 1)
  // 剔除 imageView2 / imageslim，保留其它业务参数
  const kept = query
    .split('&')
    .filter((part) => part && !part.startsWith('imageView2') && part !== 'imageslim')
    .join('&')
  return kept ? `${base}?${kept}` : base
}

/**
 * 拼接七牛 imageView2 处理参数（mode=2：限定宽高内等比缩放，不裁切）
 * @param {string} url 原图或任意 CDN 地址
 * @param {{ width?: number, quality?: number, format?: string }} [options]
 */
export function buildQiniuImageUrl(url, options = {}) {
  const origin = getPhotoOriginUrl(url)
  if (!origin) {
    return ''
  }
  // 列表/预览宽度上限（不会放大原图）
  const width = Number(options.width) > 0 ? Math.round(Number(options.width)) : 800
  // 画质 1–100
  const quality = Number(options.quality) > 0 ? Math.round(Number(options.quality)) : 75
  // 输出格式，webp 体积更小
  const format = String(options.format || 'webp').toLowerCase()

  const base = origin.split('#')[0].replace(/\?$/, '')
  const sep = base.includes('?') ? '&' : '?'
  // strip 去掉 EXIF 等元数据，进一步减小体积
  return `${base}${sep}imageView2/2/w/${width}/q/${quality}/format/${format}/ignore-error/1`
}

/**
 * 列表缩略图：瀑布流栏宽约 300–500 CSS 像素，2x 屏约需 600–1000 物理像素
 * 原图 4k–6k / 10–20MB，此档已足够，再高只会浪费 CDN
 * @param {string} url
 */
export function buildPhotoThumbUrl(url) {
  return buildQiniuImageUrl(url, { width: 640, quality: 62, format: 'webp' })
}

/**
 * 全屏预览图：手机全屏与多数桌面窗口够用；仍远小于 4000+ 原图
 * @param {string} url
 */
export function buildPhotoPreviewUrl(url) {
  return buildQiniuImageUrl(url, { width: 1600, quality: 75, format: 'webp' })
}

/**
 * 后台管理缩略图：等高卡片，更小更省
 * @param {string} url
 */
export function buildPhotoAdminThumbUrl(url) {
  return buildQiniuImageUrl(url, { width: 400, quality: 60, format: 'webp' })
}

/**
 * 该展示地址是否已加载过（用于灯箱跳过 loading）
 * @param {string} url 一般为处理后的 preview/thumb URL
 */
export function isPhotoLoaded(url) {
  const key = normalizeKey(url)
  if (!key) {
    return false
  }
  if (loadedMap.has(key)) {
    // 命中则挪到最新，保持 LRU 新鲜度
    touchLoaded(key)
    return true
  }
  if (!import.meta.client) {
    return false
  }
  try {
    const nodes = document.querySelectorAll('img[data-photo-src]')
    for (const node of nodes) {
      if (normalizeKey(node.getAttribute('data-photo-src')) !== key) {
        continue
      }
      if (node.complete && node.naturalWidth > 0) {
        touchLoaded(key)
        return true
      }
    }
  } catch {
    // ignore
  }
  return false
}

/**
 * 登记已加载完成的展示图（只记标记，不复制为 blob）
 * @param {string} url
 * @param {HTMLImageElement} [_img] 保留参数兼容旧调用
 */
export function registerPhotoLoaded(url, _img) {
  const key = normalizeKey(url)
  if (!key) {
    return
  }
  touchLoaded(key)
}

/**
 * 解析展示 src：直接返回 CDN 处理地址（依赖 HTTP 缓存）
 * @param {string} url
 */
export function resolvePhotoSrc(url) {
  return normalizeKey(url)
}
