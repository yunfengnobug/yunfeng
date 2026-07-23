/**
 * 婚纱照 URL 内存缓存：页面已加载过的图，预览直接复用，避免再次打 CDN
 */

/** @type {Map<string, string>} 原 URL → blob: 或原 URL */
const srcCache = new Map()

/** @type {Set<string>} 已确认加载完成的原 URL */
const loadedSet = new Set()

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
 * 该图是否已在页面加载过
 * @param {string} url
 */
export function isPhotoLoaded(url) {
  const key = normalizeKey(url)
  if (!key) {
    return false
  }
  if (loadedSet.has(key) || srcCache.has(key)) {
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
        loadedSet.add(key)
        return true
      }
    }
  } catch {
    // ignore
  }
  return false
}

/**
 * 登记已加载完成的图；尽量生成 blob，预览可完全不走 CDN
 * @param {string} url
 * @param {HTMLImageElement} [img]
 */
export function registerPhotoLoaded(url, img) {
  const key = normalizeKey(url)
  if (!key) {
    return
  }
  loadedSet.add(key)
  if (!srcCache.has(key)) {
    srcCache.set(key, key)
  }
  if (!import.meta.client || !img?.naturalWidth) {
    return
  }
  // 已有 blob 则不再重复生成
  const existing = srcCache.get(key)
  if (existing && existing.startsWith('blob:')) {
    return
  }
  try {
    const canvas = document.createElement('canvas')
    canvas.width = img.naturalWidth
    canvas.height = img.naturalHeight
    const ctx = canvas.getContext('2d')
    if (!ctx) {
      return
    }
    ctx.drawImage(img, 0, 0)
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          return
        }
        const prev = srcCache.get(key)
        if (prev && prev.startsWith('blob:')) {
          URL.revokeObjectURL(prev)
        }
        srcCache.set(key, URL.createObjectURL(blob))
      },
      'image/jpeg',
      0.92,
    )
  } catch {
    // 跨域无法读像素时，仍标记 loaded，预览用原 URL 走浏览器磁盘缓存
  }
}

/**
 * 预览用 src：优先 blob，其次原 URL
 * @param {string} url
 */
export function resolvePhotoSrc(url) {
  const key = normalizeKey(url)
  if (!key) {
    return ''
  }
  return srcCache.get(key) || key
}
