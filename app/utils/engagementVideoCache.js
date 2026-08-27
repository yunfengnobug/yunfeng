/**
 * 订婚视频浏览器缓存：按七牛 key 写入 Cache Storage，命中后以 blob 播放，不再请求 CDN
 */

const CACHE_NAME = 'yunfeng-engagement-video-v1'

/**
 * Cache Storage 内部请求地址（与七牛 URL 分离，便于按 key 淘汰）
 * @param {string} qiniuKey
 * @returns {string}
 */
function cacheRequestUrl(qiniuKey) {
  return `https://yunfeng.cache/engagement-video/${encodeURIComponent(qiniuKey)}`
}

/**
 * 只保留当前 key，删掉已替换的旧片
 * @param {Cache} cache
 * @param {string} qiniuKey
 */
async function pruneOtherKeys(cache, qiniuKey) {
  const keep = cacheRequestUrl(qiniuKey)
  const requests = await cache.keys()
  await Promise.all(
    requests.map((request) => {
      if (request.url === keep) return Promise.resolve()
      return cache.delete(request)
    }),
  )
}

/**
 * 下载视频：优先直连七牛；CORS 失败再走同源代理（仅缓存未命中时）
 * @param {string} cdnUrl
 * @param {string} qiniuKey
 * @returns {Promise<Response>}
 */
async function downloadVideo(cdnUrl, qiniuKey) {
  try {
    const res = await fetch(cdnUrl, { mode: 'cors', credentials: 'omit' })
    if (res.ok) return res
  } catch {
    // 七牛未配置 CORS 时改走本站代理
  }
  return fetch(`/api/engagement-video/file?v=${encodeURIComponent(qiniuKey)}`)
}

/**
 * 解析可给 <video> 使用的地址：缓存命中为 blob URL，否则先下载再缓存
 * @param {{ url: string, qiniuKey: string }} payload
 * @returns {Promise<string>}
 */
export async function resolveEngagementVideoSrc(payload) {
  const url = String(payload?.url || '').trim()
  const qiniuKey = String(payload?.qiniuKey || '').trim()
  if (!url) return ''
  if (!import.meta.client || !qiniuKey || typeof caches === 'undefined') {
    return url
  }

  try {
    const cache = await caches.open(CACHE_NAME)
    await pruneOtherKeys(cache, qiniuKey)

    const cached = await cache.match(cacheRequestUrl(qiniuKey))
    if (cached?.ok) {
      const blob = await cached.blob()
      if (blob.size > 0) {
        return URL.createObjectURL(blob)
      }
    }

    const response = await downloadVideo(url, qiniuKey)
    if (!response?.ok) {
      return url
    }
    await cache.put(cacheRequestUrl(qiniuKey), response.clone())
    const blob = await response.blob()
    if (!blob.size) return url
    return URL.createObjectURL(blob)
  } catch {
    return url
  }
}

/**
 * 释放 blob URL（不清理 Cache Storage）
 * @param {string} src
 */
export function revokeEngagementVideoSrc(src) {
  if (typeof src === 'string' && src.startsWith('blob:')) {
    URL.revokeObjectURL(src)
  }
}
