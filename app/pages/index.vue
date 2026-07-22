<template>
  <section class="home">
    <blockquote class="quote-container">
      <p class="hitokoto">{{ hitokotoText }}</p>
      <footer class="author">{{ authorText }}</footer>
    </blockquote>
  </section>
</template>

<script setup>
// 首页：浏览器端请求一言（按用户 IP 计限流，避免服务端同 IP QPS）

useSeoMeta({
  description: SITE_DESCRIPTION,
})

const hitokotoText = ref('Loading...')
const authorText = ref('')

// 将一言接口数据写入展示文案
function applyHitokoto(payload) {
  if (!payload) {
    hitokotoText.value = '获取速率过快，请稍后再试或切换网络重试。'
    authorText.value = ''
    return
  }
  hitokotoText.value = `『${payload.hitokoto}』`
  const who = payload.from_who ? ` (${payload.from_who})` : ''
  authorText.value = `—— ${payload.from || ''}${who}`
}

// 仅客户端请求第三方接口，SSR 首屏保持 Loading，避免水合不一致
const { data, error, pending, refresh } = await useFetch('https://v1.hitokoto.cn/', {
  server: false,
  lazy: true,
})

watch(
  [data, pending, error],
  () => {
    // 加载中且尚无数据：显示 Loading，勿把 null 当成限流失败
    if (pending.value) {
      if (!data.value) {
        hitokotoText.value = 'Loading...'
        authorText.value = ''
      }
      return
    }
    if (error.value || !data.value) {
      applyHitokoto(null)
      return
    }
    applyHitokoto(data.value)
  },
  { immediate: true },
)

let hitokotoTimer = null

onMounted(() => {
  // 定时刷新仅在客户端执行，避免 SSR 定时器泄漏
  hitokotoTimer = window.setInterval(() => {
    refresh()
  }, 4500)
})

onUnmounted(() => {
  if (hitokotoTimer !== null) {
    window.clearInterval(hitokotoTimer)
  }
})
</script>

<style lang="scss" scoped>
.home {
  display: flex;
  justify-content: flex-start;
  align-items: center;
  flex-direction: column;
  padding-top: 15vh;

  .quote-container {
    text-align: center;
    max-width: 1200px;
    width: 90%;
    margin: 0 0 1rem 0;
    padding: 0;
    border: none;

    .hitokoto {
      font-size: 1.4rem;
      color: #333;
      line-height: 1.6;
    }

    .author {
      font-size: 1rem;
      color: #666;
      margin-top: 2rem;
      text-align: right;
      width: 100%;
      padding-right: 1rem;
    }
  }
}

@media (max-width: 768px) {
  .home {
    padding-top: 10vh;

    .quote-container {
      width: 100%;

      .hitokoto {
        font-size: 1.15rem;
      }

      .author {
        font-size: 0.9rem;
      }
    }
  }
}
</style>
