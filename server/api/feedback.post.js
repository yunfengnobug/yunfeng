// 接收站点建议反馈，经 NotifyX 发送消息 API 转发（密钥仅服务端）
export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig(event)
  // 优先 runtimeConfig；兼容 PM2 注入的进程环境变量
  const notifyxKey =
    config.notifyxKey || process.env.NUXT_NOTIFYX_KEY || process.env.NOTIFYX_KEY || ''

  if (!notifyxKey) {
    return { code: 1, message: '反馈服务未配置，请稍后再试', data: null }
  }

  const body = await readBody(event)
  const title = String(body?.title || '').trim()
  const content = String(body?.content || '').trim()
  const contact = String(body?.contact || '').trim()

  if (!title) {
    return { code: 1, message: '请填写标题', data: null }
  }
  if (!content) {
    return { code: 1, message: '请填写反馈内容', data: null }
  }
  if (title.length > 100) {
    return { code: 1, message: '标题不能超过 100 字', data: null }
  }
  if (content.length > 2000) {
    return { code: 1, message: '内容不能超过 2000 字', data: null }
  }
  if (contact.length > 100) {
    return { code: 1, message: '联系方式不能超过 100 字', data: null }
  }

  const payload = { title, content }
  // 有联系方式时写入 NotifyX 的 description（简介）字段
  if (contact) {
    payload.description = `联系方式：${contact}`.slice(0, 500)
  }

  try {
    // NotifyX 发送消息：POST /api/v1/send/:key
    const result = await $fetch(`https://www.notifyx.cn/api/v1/send/${notifyxKey}`, {
      method: 'POST',
      body: payload,
    })
    return { code: 0, message: '提交成功，感谢你的反馈', data: result ?? null }
  } catch (error) {
    console.error('notifyx send failed', error)
    return { code: 1, message: '提交失败，请稍后再试', data: null }
  }
})
