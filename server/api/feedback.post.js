// 接收站点建议反馈，经 NotifyX 发送消息 API 转发（密钥仅服务端）
// 同一次提交会另发一条「访客特征」通知，用关联编号与用户反馈对应
import {
  buildVisitorMetaContent,
  normalizeCorrelationId,
  sanitizeClientMeta,
  sendNotifyxMessage,
} from '../utils/feedback-notify.js'
import { assertFeedbackNotRateLimited, getClientIp } from '../utils/rate-limit.js'

export default defineEventHandler(async (event) => {
  // 同 IP：10 秒最多 3 次；1 分钟超 15 封 2 小时；每天超 30 封 1 天
  assertFeedbackNotRateLimited(event)

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
  // 两条 NotifyX 共用，便于对照是哪一条用户反馈
  const correlationId =
    normalizeCorrelationId(body?.correlationId) ||
    (globalThis.crypto?.randomUUID ? crypto.randomUUID() : `yf-${Date.now()}`)
  const clientMeta = sanitizeClientMeta(body?.clientMeta)
  // 通知标题前缀，用于区分来源项目
  const titlePrefix = '[云枫]'
  const maxTitleLen = 100 - titlePrefix.length

  if (!title) {
    return { code: 1, message: '请填写标题', data: null }
  }
  if (!content) {
    return { code: 1, message: '请填写反馈内容', data: null }
  }
  if (title.length > maxTitleLen) {
    return { code: 1, message: `标题不能超过 ${maxTitleLen} 字`, data: null }
  }
  // 预留关联编号后缀空间（总长仍 ≤ 2000）
  if (content.length > 1900) {
    return { code: 1, message: '内容不能超过 1900 字', data: null }
  }
  if (contact.length > 100) {
    return { code: 1, message: '联系方式不能超过 100 字', data: null }
  }

  // 正文末尾带关联编号；超长时截断，保证 NotifyX 侧不超过 2000
  const contentWithId = `${content}\n\n——\n关联编号：${correlationId}`.slice(0, 2000)
  const payload = {
    title: `${titlePrefix}${title}`,
    content: contentWithId,
  }
  // description：联系方式 + 关联编号（便于在列表里扫一眼）
  const descParts = []
  if (contact) {
    descParts.push(`联系方式：${contact}`)
  }
  descParts.push(`关联编号：${correlationId}`)
  payload.description = descParts.join('｜').slice(0, 500)

  try {
    // 1) 用户可见的建议反馈
    const result = await sendNotifyxMessage(notifyxKey, payload)

    // 2) 隐式环境信息（失败不影响用户侧成功提示）
    try {
      const ip = getClientIp(event)
      const metaTitleBase = `[访客特征] 关联:${correlationId.slice(0, 13)}`
      const metaTitle = `${titlePrefix}${metaTitleBase}`.slice(0, 100)
      await sendNotifyxMessage(notifyxKey, {
        title: metaTitle,
        description: `对应反馈关联编号：${correlationId}`.slice(0, 500),
        content: buildVisitorMetaContent({
          correlationId,
          ip,
          fingerprint: clientMeta.fingerprint,
          traits: clientMeta.traits,
          requestUserAgent: getRequestHeader(event, 'user-agent') || '',
          requestAcceptLanguage: getRequestHeader(event, 'accept-language') || '',
        }),
      })
    } catch (metaError) {
      console.error('notifyx visitor meta send failed', metaError)
    }

    return {
      code: 0,
      message: '提交成功，感谢你的反馈',
      data: { ...(result ?? null), correlationId },
    }
  } catch (error) {
    console.error('notifyx send failed', error)
    return { code: 1, message: '提交失败，请稍后再试', data: null }
  }
})
