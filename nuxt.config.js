// Nuxt 4 应用配置（纯 JavaScript）
import { SITE_DESCRIPTION, SITE_NAME } from './app/utils/site.js'

export default defineNuxtConfig({
  // 兼容性日期，控制行为切换时间点
  compatibilityDate: '2025-07-15',
  // 开发工具，生产构建可关闭
  // 仅开发环境启用 DevTools，避免生产暴露调试信息与多余资源
  devtools: { enabled: process.env.NODE_ENV !== 'production' },
  // 禁用 TypeScript 检查，项目约定纯 JS
  typescript: {
    typeCheck: false,
  },
  css: ['~/assets/styles/base.scss'],
  app: {
    head: {
      htmlAttrs: { lang: 'zh-CN' },
      charset: 'utf-8',
      viewport: 'width=device-width, initial-scale=1',
      // 默认文档标题为站点品牌；内页由 app.vue 的 titleTemplate 拼「页面 · 云枫」
      title: SITE_NAME,
      titleTemplate: '%s',
      meta: [
        { name: 'description', content: SITE_DESCRIPTION },
        // 安装到主屏幕 / 浏览器应用名
        { name: 'application-name', content: SITE_NAME },
        { name: 'apple-mobile-web-app-title', content: SITE_NAME },
        { property: 'og:site_name', content: SITE_NAME },
        { property: 'og:title', content: SITE_NAME },
        { property: 'og:description', content: SITE_DESCRIPTION },
        { name: 'twitter:title', content: SITE_NAME },
        { name: 'twitter:description', content: SITE_DESCRIPTION },
      ],
    },
  },
  // 敏感项只写空默认值，勿在此读 process.env，否则会在 pnpm build 时编进 .output。
  // 运行时由 NUXT_*（PM2 / .runtime.env）覆盖：NUXT_NOTIFYX_KEY、NUXT_DATABASE_URL 等。
  runtimeConfig: {
    // NotifyX 发送密钥（仅服务端）
    notifyxKey: '',
    // MySQL 连接 URI，形如 mysql://user:pass@host:port/database（密码含特殊字符须 URL 编码）
    databaseUrl: '',
  },
})
