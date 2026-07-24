<!-- 进入「我们」页的欢迎遮罩：艺术字 → 点击后照片放大淡出 → 全屏视频 → 播完关闭 -->
<template>
  <Teleport to="body">
    <div
      v-if="alive"
      class="welcome"
      :class="[
        `welcome--${phase}`,
        {
          'welcome--fade': fading,
          'welcome--ready': clickReady && phase === 'intro',
        },
      ]"
      role="dialog"
      aria-modal="true"
      aria-label="我们结婚吧"
      @pointerdown.prevent="onOverlayPointerDown"
      @pointerup.prevent="onOverlayPointerUp"
    >
      <div v-show="phase !== 'video'" class="welcome__veil" />

      <div v-show="phase === 'intro'" class="welcome__copy">
        <p class="welcome__title">我们结婚吧！</p>
        <p class="welcome__hint">{{ clickReady ? '点击屏幕继续' : '' }}</p>
      </div>

      <img
        v-show="phase === 'burst'"
        class="welcome__photo"
        :class="{
          'welcome__photo--show': phase === 'burst',
          'welcome__photo--grow': photoGrowing,
        }"
        :src="PHOTO_URL"
        alt=""
        draggable="false"
      />

      <!-- 照片淡出后全屏视频；播完自动关闭 -->
      <video
        v-show="phase === 'video'"
        ref="videoRef"
        class="welcome__video"
        :src="VIDEO_URL"
        playsinline
        preload="auto"
        @ended="onVideoEnded"
        @error="onVideoEnded"
      />
    </div>
  </Teleport>
</template>

<script setup>
import { buildPhotoPreviewUrl } from '~/utils/photoSrcCache.js'
import { playWelcomeBgm, preloadWelcomeBgm } from '~/utils/welcomeBgm.js'

// 欢迎遮罩用的精修图（原图地址）
const PHOTO_ORIGIN = 'https://img.yzre.cn/2026/07/wedding-final/7defbbefe7394afe.jpg'
// 七牛 imageView2 压缩展示，与全屏预览同档
const PHOTO_URL = buildPhotoPreviewUrl(PHOTO_ORIGIN)
// 揭幕后全屏播放的视频
const VIDEO_URL = 'https://img.yzre.cn/2026/07/video/6a376491432b63dbaa1ff311a67504e3_raw.mp4'

// intro → burst（照片）→ video（全屏）→ 结束卸载
const phase = ref('intro')
const fading = ref(false)
const photoGrowing = ref(false)
const alive = ref(true)
// 挂载后短暂忽略点击，避免导航「我们」的残留点击穿透
const clickReady = ref(false)
// 必须在就绪后于遮罩上按下再抬起，才算有效点击
const pointerStarted = ref(false)
const videoRef = ref(null)

let readyTimer = null
let growTimer = null
let fadeTimer = null
let videoTimer = null

useHead({
  link: [
    {
      rel: 'stylesheet',
      href: 'https://fonts.googleapis.com/css2?family=Ma+Shan+Zheng&display=swap',
    },
  ],
})

// 遮罩期间锁定滚动
function lockScroll(lock) {
  if (!import.meta.client) return
  document.documentElement.style.overflow = lock ? 'hidden' : ''
  document.body.style.overflow = lock ? 'hidden' : ''
}

// 清理定时器
function clearTimers() {
  if (readyTimer) clearTimeout(readyTimer)
  if (growTimer) clearTimeout(growTimer)
  if (fadeTimer) clearTimeout(fadeTimer)
  if (videoTimer) clearTimeout(videoTimer)
  readyTimer = null
  growTimer = null
  fadeTimer = null
  videoTimer = null
}

// 关闭整层欢迎（视频结束或失败）
function closeWelcome() {
  alive.value = false
  lockScroll(false)
}

// 视频播完或出错后消失
function onVideoEnded() {
  closeWelcome()
}

// 进入全屏视频并尝试播放（带声音；若被策略拦截则静音重试）
async function startVideo() {
  phase.value = 'video'
  fading.value = false
  await nextTick()
  const el = videoRef.value
  if (!el) {
    closeWelcome()
    return
  }
  el.currentTime = 0
  el.muted = false
  try {
    await el.play()
  } catch {
    // 延迟播放可能被拦截：静音后再播，保证能看完
    el.muted = true
    try {
      await el.play()
    } catch {
      closeWelcome()
    }
  }
}

// 遮罩按下：就绪后才记有效起点
function onOverlayPointerDown(event) {
  if (!clickReady.value || phase.value !== 'intro') return
  if (event.pointerType === 'mouse' && event.button !== 0) return
  pointerStarted.value = true
}

// 遮罩抬起：整层可点揭幕
function onOverlayPointerUp(event) {
  if (!pointerStarted.value || !clickReady.value || phase.value !== 'intro') return
  if (event.pointerType === 'mouse' && event.button !== 0) return
  pointerStarted.value = false
  onContinue()
}

// 用户点击遮罩继续
function onContinue() {
  if (!clickReady.value || phase.value !== 'intro') return
  playWelcomeBgm()
  startReveal()
}

// 揭幕：婚纱图放大淡出，结束后立刻全屏播视频
function startReveal() {
  if (phase.value !== 'intro') return
  phase.value = 'burst'

  growTimer = setTimeout(() => {
    photoGrowing.value = true
  }, 120)

  // 放大接近最大时，照片与遮罩一起淡出
  fadeTimer = setTimeout(() => {
    fading.value = true
  }, 2800)

  // 淡出结束后立刻切全屏视频（与 opacity 过渡 2.6s 对齐）
  videoTimer = setTimeout(() => {
    startVideo()
  }, 5600)
}

onMounted(() => {
  lockScroll(true)
  const img = new Image()
  img.src = PHOTO_URL
  preloadWelcomeBgm()
  // 预加载视频，揭幕后更快起播
  const preloadVideo = document.createElement('video')
  preloadVideo.preload = 'auto'
  preloadVideo.src = VIDEO_URL
  // 导航残留点击通常在数百毫秒内；延后接受点击
  readyTimer = setTimeout(() => {
    clickReady.value = true
  }, 800)
})

onBeforeUnmount(() => {
  clearTimers()
  const el = videoRef.value
  if (el) {
    el.pause()
  }
  lockScroll(false)
})
</script>

<style lang="scss" scoped>
.welcome {
  position: fixed;
  inset: 0;
  z-index: 90000;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  cursor: default;
  user-select: none;
  -webkit-tap-highlight-color: transparent;
  opacity: 1;
  transition: opacity 2.6s ease;
  background: #000;

  &--ready {
    cursor: pointer;
  }

  &--fade {
    opacity: 0;
    pointer-events: none;
  }

  &--video {
    // 照片淡出后立刻亮起视频，不再走淡入过渡
    opacity: 1;
    transition: none;
    pointer-events: auto;
    cursor: default;
  }

  &__veil {
    position: absolute;
    inset: 0;
    background:
      radial-gradient(ellipse 70% 55% at 50% 42%, rgba(90, 40, 48, 0.35), transparent 70%),
      rgba(28, 18, 20, 0.92);
  }

  &__copy {
    position: relative;
    z-index: 2;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1.25rem;
    padding: 0 1rem;
  }

  &__title {
    margin: 0;
    font-family: 'Ma Shan Zheng', 'STKaiti', 'KaiTi', 'Songti SC', serif;
    font-size: clamp(2.8rem, 12vw, 5.5rem);
    font-weight: 400;
    letter-spacing: 0.12em;
    line-height: 1.25;
    text-align: center;
    color: #fff5f2;
    text-shadow:
      0 0 24px rgba(255, 140, 150, 0.45),
      0 8px 28px rgba(0, 0, 0, 0.45);
    animation: welcome-sway 2.4s ease-in-out infinite;
  }

  &__hint {
    margin: 0;
    min-height: 1.25em;
    text-align: center;
    font-size: 0.875rem;
    letter-spacing: 0.2em;
    color: rgba(255, 240, 236, 0.55);
    animation: welcome-hint-pulse 2s ease-in-out infinite;
  }

  &__photo {
    position: absolute;
    z-index: 3;
    top: 50%;
    left: 50%;
    width: min(62vw, 360px);
    height: auto;
    aspect-ratio: 3 / 4;
    object-fit: cover;
    border-radius: 6px;
    box-shadow: 0 24px 80px rgba(0, 0, 0, 0.55);
    transform: translate(-50%, -50%) scale(0.72);
    opacity: 0;
    pointer-events: none;
    visibility: hidden;
    transition:
      transform 3s linear,
      opacity 0.45s ease;

    &--show {
      opacity: 1;
      visibility: visible;
    }

    &--grow {
      /* 放大到接近全屏，淡出由外层 fade 状态控制 */
      transform: translate(-50%, -50%) scale(4.6);
    }
  }

  &__video {
    position: absolute;
    inset: 0;
    z-index: 5;
    width: 100%;
    height: 100%;
    object-fit: contain;
    background: #000;
    pointer-events: none;
  }
}

@keyframes welcome-sway {
  0%,
  100% {
    transform: rotate(-2.2deg) translateY(0);
  }
  25% {
    transform: rotate(2deg) translateY(-4px);
  }
  50% {
    transform: rotate(-1.6deg) translateY(2px);
  }
  75% {
    transform: rotate(2.4deg) translateY(-3px);
  }
}

@keyframes welcome-hint-pulse {
  0%,
  100% {
    opacity: 0.45;
  }
  50% {
    opacity: 0.85;
  }
}

@media (prefers-reduced-motion: reduce) {
  .welcome__title,
  .welcome__hint {
    animation: none;
  }

  .welcome__photo {
    transition-duration: 0.8s;
  }

  .welcome {
    transition-duration: 0.8s;
  }
}
</style>
