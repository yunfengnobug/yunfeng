// Nuxt 4 应用配置（纯 JavaScript）
export default defineNuxtConfig({
  // 兼容性日期，控制行为切换时间点
  compatibilityDate: '2025-07-15',
  // 开发工具，生产构建可关闭
  devtools: { enabled: true },
  // 禁用 TypeScript 检查，项目约定纯 JS
  typescript: {
    typeCheck: false,
  },
  modules: ['@pinia/nuxt'],
  css: ['~/assets/styles/base.scss'],
  app: {
    head: {
      htmlAttrs: { lang: 'zh-CN' },
      charset: 'utf-8',
      viewport: 'width=device-width, initial-scale=1',
      // 全站固定标题，个别页面后续再单独覆盖
      title: '王俊杰 ❤️ 李朝新',
      titleTemplate: '%s',
      meta: [{ name: 'description', content: '王俊杰与李朝新的网站：记录生活、技术与爱' }],
    },
  },
  runtimeConfig: {
    // NotifyX 发送密钥（仅服务端）；用环境变量 NUXT_NOTIFYX_KEY 覆盖
    notifyxKey: '',
  },
})
