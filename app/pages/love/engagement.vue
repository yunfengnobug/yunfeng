<!-- 订婚视频页：七牛 URL + 本地缓存后循环播放 -->
<script setup>
import { stopWelcomeBgm } from '~/utils/welcomeBgm.js'
import {
  resolveEngagementVideoSrc,
  revokeEngagementVideoSrc,
} from '~/utils/engagementVideoCache.js'

definePageMeta({
  // 关闭默认顶栏/页脚，页面上只留视频
  layout: false,
})

useSeoMeta({
  title: '订婚视频',
  description: '王俊杰与李朝新的订婚视频',
})

const videoRef = ref(null)
// 播放地址在客户端填入（blob 或 CDN），首屏留空避免水合分叉
const playbackSrc = ref('')

const { data: videoMeta } = await useAsyncData('engagement-video', async () => {
  try {
    const res = await $fetch('/api/engagement-video')
    return res?.data || { url: '', qiniu_key: '' }
  } catch {
    return { url: '', qiniu_key: '' }
  }
})

const hasRemoteVideo = computed(() => Boolean(videoMeta.value?.url))

/** 锁定页面滚动，避免移动端橡皮筋露出白边 */
function lockScroll(lock) {
  if (!import.meta.client) return
  document.documentElement.style.overflow = lock ? 'hidden' : ''
  document.body.style.overflow = lock ? 'hidden' : ''
}

onMounted(async () => {
  stopWelcomeBgm()
  lockScroll(true)
  const url = videoMeta.value?.url
  const qiniuKey = videoMeta.value?.qiniu_key
  if (!url) return
  playbackSrc.value = await resolveEngagementVideoSrc({ url, qiniuKey })
  await nextTick()
  const el = videoRef.value
  if (el) el.play().catch(() => {})
})

onBeforeUnmount(() => {
  const el = videoRef.value
  if (el) el.pause()
  revokeEngagementVideoSrc(playbackSrc.value)
  lockScroll(false)
})
</script>

<template>
  <div class="engagement">
    <video
      v-if="playbackSrc"
      ref="videoRef"
      class="engagement__video"
      :src="playbackSrc"
      autoplay
      loop
      muted
      playsinline
      preload="auto"
      controls
    />
    <p v-else-if="!hasRemoteVideo" class="engagement__empty">暂无视频</p>
  </div>
</template>

<style lang="scss" scoped>
.engagement {
  width: 100%;
  height: 100vh;
  height: 100dvh;
  background: #000;
}

.engagement__video {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: contain;
  background: #000;
}

.engagement__empty {
  margin: 0;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: rgba(255, 245, 242, 0.55);
  font-size: 0.95rem;
  letter-spacing: 0.12em;
}
</style>
