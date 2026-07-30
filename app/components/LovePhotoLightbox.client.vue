<!-- 婚纱照全屏预览：三轨跟手滑动切图、双指缩放；复用页面已加载图片，邻图按需加载 -->
<script setup>
import {
  buildPhotoPreviewUrl,
  isPhotoLoaded,
  registerPhotoLoaded,
  resolvePhotoSrc,
} from '~/utils/photoSrcCache.js'

const props = defineProps({
  // 是否打开
  modelValue: { type: Boolean, default: false },
  // 当前组图片 URL 列表
  urls: { type: Array, default: () => [] },
  // 打开时的起始下标
  startIndex: { type: Number, default: 0 },
})

const emit = defineEmits(['update:modelValue'])

/** 关闭预览 */
function close() {
  emit('update:modelValue', false)
}

const track = useLightboxTrack({
  urls: computed(() => props.urls),
  close,
})

const {
  index,
  neighborsEnabled,
  stageRef,
  zoomed,
  trackStyleFixed,
  slideWidthStyle,
  currentImgStyle,
  measureViewport,
  resetTransform,
  go,
} = track

const gestures = usePhotoGestures({
  track,
  urls: computed(() => props.urls),
})

const prevUrl = computed(() => props.urls[index.value - 1] || '')
const currentUrl = computed(() => props.urls[index.value] || '')
const nextUrl = computed(() => props.urls[index.value + 1] || '')

// 七牛预览压缩图（限宽 webp）；复用依赖浏览器 HTTP 缓存
const previewCurrent = computed(() => buildPhotoPreviewUrl(currentUrl.value))
const previewPrev = computed(() => (prevUrl.value ? buildPhotoPreviewUrl(prevUrl.value) : ''))
const previewNext = computed(() => (nextUrl.value ? buildPhotoPreviewUrl(nextUrl.value) : ''))

const displayCurrent = computed(() => resolvePhotoSrc(previewCurrent.value))
const displayPrev = computed(() =>
  neighborsEnabled.value && previewPrev.value ? resolvePhotoSrc(previewPrev.value) : '',
)
const displayNext = computed(() =>
  neighborsEnabled.value && previewNext.value ? resolvePhotoSrc(previewNext.value) : '',
)

const counterText = computed(() => {
  const total = props.urls.length
  if (!total) {
    return ''
  }
  return `${index.value + 1} / ${total}`
})

// 当前主图是否仍在加载
const currentLoading = ref(true)

/** 根据缓存同步加载态（按预览压缩 URL） */
function syncCurrentLoading() {
  currentLoading.value = !isPhotoLoaded(previewCurrent.value)
}

watch(previewCurrent, () => {
  syncCurrentLoading()
})

/** 当前主图加载完成 */
function onCurrentImgLoad(event) {
  currentLoading.value = false
  registerPhotoLoaded(previewCurrent.value, event?.target)
}

/**
 * @param {KeyboardEvent} e
 */
function onKeydown(e) {
  if (!props.modelValue) {
    return
  }
  if (e.key === 'Escape') {
    close()
  } else if (e.key === 'ArrowRight') {
    go(1)
  } else if (e.key === 'ArrowLeft') {
    go(-1)
  }
}

function onResize() {
  measureViewport()
  track.dragX.value = 0
}

watch(
  () => props.modelValue,
  (open) => {
    if (!import.meta.client) {
      return
    }
    if (open) {
      index.value = Math.min(Math.max(0, props.startIndex), Math.max(0, props.urls.length - 1))
      resetTransform()
      track.settling.value = false
      track.gesturing.value = false
      // 打开时不预加载邻图
      neighborsEnabled.value = false
      syncCurrentLoading()
      nextTick(() => {
        measureViewport()
      })
      document.documentElement.style.overflow = 'hidden'
      document.body.style.overflow = 'hidden'
    } else {
      document.documentElement.style.overflow = ''
      document.body.style.overflow = ''
    }
  },
)

onMounted(() => {
  window.addEventListener('keydown', onKeydown)
  window.addEventListener('resize', onResize)
  measureViewport()
})

onBeforeUnmount(() => {
  window.removeEventListener('keydown', onKeydown)
  window.removeEventListener('resize', onResize)
  if (import.meta.client) {
    document.documentElement.style.overflow = ''
    document.body.style.overflow = ''
  }
})
</script>

<template>
  <Teleport to="body">
    <div
      v-if="modelValue"
      class="photo-lb"
      role="dialog"
      aria-modal="true"
      aria-label="婚纱照全屏预览"
      @wheel.prevent="gestures.onWheel"
    >
      <LovePhotoLightboxChrome :counter-text="counterText" @close="close" />

      <LovePhotoLightboxTrack
        :set-stage-el="
          (el) => {
            stageRef.value = el
          }
        "
        :zoomed="zoomed"
        :track-style-fixed="trackStyleFixed"
        :slide-width-style="slideWidthStyle"
        :current-img-style="currentImgStyle"
        :display-prev="displayPrev"
        :display-current="displayCurrent"
        :display-next="displayNext"
        :preview-current="previewCurrent"
        :current-loading="currentLoading"
        :on-touch-start="gestures.onTouchStart"
        :on-touch-move="gestures.onTouchMove"
        :on-touch-end="gestures.onTouchEnd"
        :on-touch-cancel="gestures.onTouchCancel"
        :on-current-img-load="onCurrentImgLoad"
        :on-double-click="gestures.onDoubleClick"
        @close="close"
      />

      <button
        v-if="urls.length > 1"
        type="button"
        class="photo-lb__nav photo-lb__nav--prev"
        aria-label="上一张"
        @click="go(-1)"
      >
        ‹
      </button>
      <button
        v-if="urls.length > 1"
        type="button"
        class="photo-lb__nav photo-lb__nav--next"
        aria-label="下一张"
        @click="go(1)"
      >
        ›
      </button>
    </div>
  </Teleport>
</template>

<style lang="scss" scoped>
.photo-lb {
  position: fixed;
  inset: 0;
  z-index: 100000;
  width: 100%;
  height: 100vh;
  height: 100dvh;
  background: #0a0706;
  color: #fff;
  touch-action: none;
  overscroll-behavior: none;
  user-select: none;
  -webkit-user-select: none;

  &__nav {
    display: none;
    position: absolute;
    top: 50%;
    z-index: 2;
    transform: translateY(-50%);
    appearance: none;
    border: none;
    background: rgba(255, 255, 255, 0.12);
    color: #fff;
    width: 2.75rem;
    height: 2.75rem;
    border-radius: 50%;
    font-size: 1.75rem;
    line-height: 1;
    cursor: pointer;

    @media (min-width: 768px) {
      display: flex;
      align-items: center;
      justify-content: center;
    }

    &--prev {
      left: 1rem;
    }

    &--next {
      right: 1rem;
    }
  }
}
</style>
