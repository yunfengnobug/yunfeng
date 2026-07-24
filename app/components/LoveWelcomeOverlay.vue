<!-- 进入「我们」页的欢迎遮罩：艺术字晃动 → 点击遮罩后婚纱图放大淡出 -->
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
      <div class="welcome__veil" />

      <div v-show="phase === 'intro'" class="welcome__copy">
        <p class="welcome__title">我们结婚吧！</p>
        <p class="welcome__hint">{{ clickReady ? '点击屏幕继续' : '' }}</p>
      </div>

      <img
        class="welcome__photo"
        :class="{
          'welcome__photo--show': phase === 'burst',
          'welcome__photo--grow': photoGrowing,
        }"
        :src="PHOTO_URL"
        alt=""
        draggable="false"
      />
    </div>
  </Teleport>
</template>

<script setup>
import { buildPhotoPreviewUrl } from '~/utils/photoSrcCache.js'

// 欢迎遮罩用的精修图（原图地址）
const PHOTO_ORIGIN = 'https://img.yzre.cn/2026/07/wedding-final/7defbbefe7394afe.jpg'
// 七牛 imageView2 压缩展示，与全屏预览同档
const PHOTO_URL = buildPhotoPreviewUrl(PHOTO_ORIGIN)

// intro：等待点击遮罩；burst：图片放大后与遮罩淡出
const phase = ref('intro')
const fading = ref(false)
const photoGrowing = ref(false)
const alive = ref(true)
// 挂载后短暂忽略点击，避免导航「我们」的残留点击穿透
const clickReady = ref(false)
// 必须在就绪后于遮罩上按下再抬起，才算有效点击
const pointerStarted = ref(false)

let readyTimer = null
let growTimer = null
let fadeTimer = null
let doneTimer = null

// 背景音乐（模块级引用，遮罩卸载后仍继续播放）
let welcomeBgm = null
// public/marry[mqms2].ogg；方括号需编码
const BGM_SRC = encodeURI('/marry[mqms2].ogg')

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
  if (doneTimer) clearTimeout(doneTimer)
  readyTimer = null
  growTimer = null
  fadeTimer = null
  doneTimer = null
}

// 点击时播放背景音乐（需用户手势，满足浏览器自动播放策略）
function playWelcomeBgm() {
  if (!import.meta.client) return
  if (!welcomeBgm) {
    welcomeBgm = new Audio(BGM_SRC)
    welcomeBgm.loop = true
    // 背景音量，避免盖过人声/操作
    welcomeBgm.volume = 0.65
  }
  welcomeBgm.play().catch(() => {})
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

// 揭幕：文案消失，婚纱图放大，再与遮罩一起淡出
function startReveal() {
  if (phase.value !== 'intro') return
  phase.value = 'burst'

  growTimer = setTimeout(() => {
    photoGrowing.value = true
  }, 120)

  fadeTimer = setTimeout(() => {
    fading.value = true
  }, 2800)

  doneTimer = setTimeout(() => {
    alive.value = false
    lockScroll(false)
  }, 5600)
}

onMounted(() => {
  lockScroll(true)
  const img = new Image()
  img.src = PHOTO_URL
  // 预加载背景音乐，点击后更快起播
  const preloadAudio = new Audio()
  preloadAudio.preload = 'auto'
  preloadAudio.src = BGM_SRC
  // 导航残留点击通常在数百毫秒内；延后接受点击
  readyTimer = setTimeout(() => {
    clickReady.value = true
  }, 800)
})

onBeforeUnmount(() => {
  clearTimers()
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

  &--ready {
    cursor: pointer;
  }

  &--fade {
    opacity: 0;
    pointer-events: none;
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
