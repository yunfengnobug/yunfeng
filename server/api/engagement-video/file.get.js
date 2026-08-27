/**
 * 公开：同源代理订婚视频文件（七牛未开 CORS 时供浏览器写入 Cache Storage）
 * GET /api/engagement-video/file?v={qiniu_key}
 */
export default defineEventHandler(async (event) => {
  const video = await getEngagementVideoMeta()
  if (!video.url) {
    throw createError({
      statusCode: 404,
      statusMessage: '暂无订婚视频',
    })
  }

  // v 必须与当前 key 一致，避免旧链接继续打到已替换的对象
  const version = String(getQuery(event).v || '').trim()
  if (version && version !== video.qiniu_key) {
    throw createError({
      statusCode: 404,
      statusMessage: '视频已更新',
    })
  }

  const upstream = await fetch(video.url)
  if (!upstream.ok || !upstream.body) {
    throw createError({
      statusCode: 502,
      statusMessage: '拉取视频失败',
    })
  }

  const headers = new Headers()
  headers.set('Content-Type', upstream.headers.get('content-type') || 'video/mp4')
  headers.set('Cache-Control', 'public, max-age=31536000, immutable')
  const length = upstream.headers.get('content-length')
  if (length) {
    headers.set('Content-Length', length)
  }

  return new Response(upstream.body, { headers })
})
