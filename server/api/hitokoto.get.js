// 代理一言开放接口，统一响应格式并便于 SSR
export default defineEventHandler(async () => {
  try {
    const data = await $fetch('https://v1.hitokoto.cn/')
    return { code: 0, message: 'ok', data }
  } catch (error) {
    console.error('hitokoto fetch failed', error)
    return {
      code: 1,
      message: '获取一言失败',
      data: null,
    }
  }
})
