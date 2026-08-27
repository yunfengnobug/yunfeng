/**
 * 公开：当前订婚视频 CDN 地址（不含文件本体）
 * GET /api/engagement-video
 */
export default defineEventHandler(async () => {
  const data = await getEngagementVideoMeta()
  return {
    code: 0,
    message: 'ok',
    data,
  }
})
