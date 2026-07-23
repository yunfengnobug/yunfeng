<!-- 婚纱照全屏预览：三轨跟手滑动切图、双指缩放（仅客户端） -->
<script setup>
const props = defineProps({
  // 是否打开
  modelValue: { type: Boolean, default: false },
  // 当前组图片 URL 列表
  urls: { type: Array, default: () => [] },
  // 打开时的起始下标
  startIndex: { type: Number, default: 0 },
})

const emit = defineEmits(['update:modelValue'])

// 当前下标
const index = ref(0)
// 缩放（仅当前图）
const scale = ref(1)
// 放大后平移
const offsetX = ref(0)
const offsetY = ref(0)
// 轨道跟手水平位移（相对中间页）
const dragX = ref(0)
// 下滑关闭跟手
const closeY = ref(0)
// 跟手中：关闭 CSS transition
const gesturing = ref(false)
// 松手后位移动画中
const settling = ref(false)
// 视口宽度（px），用于轨道定位
const viewportW = ref(0)

const stageRef = ref(null)

/** @type {'none' | 'swipe' | 'pan' | 'pinch' | 'close'} */
let mode = 'none'
let startX = 0
let startY = 0
let originOffsetX = 0
let originOffsetY = 0
let pinchStartDist = 0
let pinchStartScale = 1
let lastMoveX = 0
let lastMoveT = 0
let velocityX = 0
/** 防止 settle 回调重复执行 */
let settleToken = 0
/** 轴锁定：待定 / 横 / 纵 */
let axis = /** @type {'pending' | 'x' | 'y'} */ ('pending')

const prevUrl = computed(() => props.urls[index.value - 1] || '')
const currentUrl = computed(() => props.urls[index.value] || '')
const nextUrl = computed(() => props.urls[index.value + 1] || '')

const counterText = computed(() => {
  const total = props.urls.length
  if (!total) {
    return ''
  }
  return `${index.value + 1} / ${total}`
})

const zoomed = computed(() => scale.value > 1.08)

/** 三轨容器位移：默认停在中间页；跟手时无 transition，松手 settling 时缓动 */
const trackStyleFixed = computed(() => {
  const w = viewportW.value || 0
  return {
    width: `${w * 3}px`,
    transform: `translate3d(${-w + dragX.value}px, ${closeY.value}px, 0)`,
    transition: gesturing.value
      ? 'none'
      : settling.value
        ? 'transform 0.28s cubic-bezier(0.22, 0.8, 0.28, 1)'
        : 'none',
  }
})

const slideWidthStyle = computed(() => ({
  width: `${viewportW.value || 0}px`,
}))

const currentImgStyle = computed(() => ({
  transform: `translate3d(${offsetX.value}px, ${offsetY.value}px, 0) scale(${scale.value})`,
  transition: gesturing.value ? 'none' : 'transform 0.2s ease-out',
}))

/**
 * 测量舞台宽度
 */
function measureViewport() {
  viewportW.value = stageRef.value?.clientWidth || window.innerWidth || 0
}

/**
 * 重置缩放 / 跟手位移
 */
function resetTransform() {
  scale.value = 1
  offsetX.value = 0
  offsetY.value = 0
  dragX.value = 0
  closeY.value = 0
}

/**
 * 关闭预览
 */
function close() {
  emit('update:modelValue', false)
}

/**
 * 无动画切换索引并复位轨道
 * @param {number} nextIndex
 */
function commitIndex(nextIndex) {
  index.value = nextIndex
  settling.value = false
  gesturing.value = true
  dragX.value = 0
  closeY.value = 0
  scale.value = 1
  offsetX.value = 0
  offsetY.value = 0
  // 下一帧再允许 transition，避免复位闪一下
  requestAnimationFrame(() => {
    gesturing.value = false
  })
}

/**
 * 松手后平滑滚到目标，再提交索引
 * @param {number} targetX 目标 dragX
 * @param {number | null} nextIndex 完成后索引；null 表示回弹
 */
function settleTo(targetX, nextIndex) {
  const token = ++settleToken
  settling.value = true
  gesturing.value = false
  dragX.value = targetX
  closeY.value = 0

  const finish = () => {
    if (token !== settleToken) {
      return
    }
    if (nextIndex == null) {
      settling.value = false
      dragX.value = 0
      return
    }
    commitIndex(nextIndex)
  }

  window.setTimeout(finish, 300)
}

/**
 * 切换图片（按钮 / 键盘）
 * @param {number} delta
 */
function go(delta) {
  if (settling.value) {
    return
  }
  // 放大态先还原再切
  if (zoomed.value) {
    resetTransform()
  }
  const next = index.value + delta
  if (next < 0 || next >= props.urls.length) {
    return
  }
  const w = viewportW.value || window.innerWidth
  settleTo(delta > 0 ? -w : w, next)
}

/**
 * @param {Touch} a
 * @param {Touch} b
 */
function touchDist(a, b) {
  return Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY)
}

/**
 * 边缘阻尼：到头时跟手变钝
 * @param {number} dx
 */
function applyEdgeRubber(dx) {
  const atStart = index.value <= 0
  const atEnd = index.value >= props.urls.length - 1
  if ((atStart && dx > 0) || (atEnd && dx < 0)) {
    return dx * 0.32
  }
  return dx
}

/**
 * @param {TouchEvent} e
 */
function onTouchStart(e) {
  if (settling.value) {
    return
  }
  gesturing.value = true
  settling.value = false
  axis = 'pending'
  velocityX = 0
  lastMoveX = e.touches[0]?.clientX || 0
  lastMoveT = performance.now()

  if (e.touches.length === 2) {
    mode = 'pinch'
    pinchStartDist = touchDist(e.touches[0], e.touches[1]) || 1
    pinchStartScale = scale.value
    return
  }

  if (e.touches.length === 1) {
    startX = e.touches[0].clientX
    startY = e.touches[0].clientY
    originOffsetX = offsetX.value
    originOffsetY = offsetY.value
    mode = zoomed.value ? 'pan' : 'swipe'
  }
}

/**
 * @param {TouchEvent} e
 */
function onTouchMove(e) {
  if (mode === 'none' || settling.value) {
    return
  }
  e.preventDefault()

  if (mode === 'pinch' && e.touches.length >= 2) {
    const dist = touchDist(e.touches[0], e.touches[1]) || 1
    const next = Math.min(4, Math.max(1, pinchStartScale * (dist / pinchStartDist)))
    scale.value = next
    if (next <= 1.02) {
      offsetX.value = 0
      offsetY.value = 0
    }
    return
  }

  if (e.touches.length !== 1) {
    return
  }

  const x = e.touches[0].clientX
  const y = e.touches[0].clientY
  const dx = x - startX
  const dy = y - startY
  const now = performance.now()
  const dt = Math.max(1, now - lastMoveT)
  velocityX = (x - lastMoveX) / dt
  lastMoveX = x
  lastMoveT = now

  if (mode === 'pan') {
    offsetX.value = originOffsetX + dx
    offsetY.value = originOffsetY + dy
    return
  }

  if (mode === 'swipe') {
    // 轴锁定，避免斜滑抖动
    if (axis === 'pending' && (Math.abs(dx) > 8 || Math.abs(dy) > 8)) {
      axis = Math.abs(dx) >= Math.abs(dy) ? 'x' : 'y'
    }
    if (axis === 'y') {
      dragX.value = 0
      closeY.value = Math.max(0, dy)
      return
    }
    if (axis === 'x' || axis === 'pending') {
      closeY.value = 0
      dragX.value = applyEdgeRubber(dx)
    }
  }
}

/**
 * @param {TouchEvent} e
 */
function onTouchEnd(e) {
  if (e.touches.length > 0) {
    if (e.touches.length === 1 && zoomed.value) {
      mode = 'pan'
      startX = e.touches[0].clientX
      startY = e.touches[0].clientY
      originOffsetX = offsetX.value
      originOffsetY = offsetY.value
    }
    return
  }

  const endMode = mode
  mode = 'none'
  const dx = dragX.value
  const dy = closeY.value
  const w = viewportW.value || window.innerWidth
  const speed = velocityX

  if (endMode === 'swipe') {
    // 下滑关闭
    if (axis === 'y' && dy > 96) {
      gesturing.value = false
      close()
      return
    }

    const distanceOk = Math.abs(dx) > w * 0.18
    const velocityOk = Math.abs(speed) > 0.45
    const goNext = (dx < 0 && distanceOk) || speed < -0.45
    const goPrev = (dx > 0 && distanceOk) || speed > 0.45

    if (goNext && index.value < props.urls.length - 1 && (distanceOk || velocityOk)) {
      settleTo(-w, index.value + 1)
      return
    }
    if (goPrev && index.value > 0 && (distanceOk || velocityOk)) {
      settleTo(w, index.value - 1)
      return
    }

    // 回弹
    settleTo(0, null)
    return
  }

  gesturing.value = false
  if (scale.value < 1.05) {
    resetTransform()
  }
}

function onTouchCancel() {
  mode = 'none'
  axis = 'pending'
  settleTo(0, null)
}

/** 双击放大 / 还原 */
function onDoubleClick() {
  if (scale.value > 1.2) {
    resetTransform()
  } else {
    scale.value = 2.2
  }
}

/**
 * @param {WheelEvent} e
 */
function onWheel(e) {
  e.preventDefault()
  if (Math.abs(e.deltaX) > Math.abs(e.deltaY) && !zoomed.value) {
    // 触控板左右滑切图
    if (e.deltaX > 30) {
      go(1)
    } else if (e.deltaX < -30) {
      go(-1)
    }
    return
  }
  const delta = e.deltaY < 0 ? 0.15 : -0.15
  const next = Math.min(4, Math.max(1, Number((scale.value + delta).toFixed(2))))
  scale.value = next
  if (next <= 1) {
    offsetX.value = 0
    offsetY.value = 0
  }
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
  dragX.value = 0
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
      settling.value = false
      gesturing.value = false
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
      @wheel.prevent="onWheel"
    >
      <div class="photo-lb__top">
        <span class="photo-lb__counter">{{ counterText }}</span>
        <button type="button" class="photo-lb__close" aria-label="关闭" @click="close">×</button>
      </div>

      <p class="photo-lb__hint">左右滑动切换 · 双指缩放 · 双击放大</p>

      <div
        ref="stageRef"
        class="photo-lb__stage"
        @click.self="close"
        @touchstart.passive="onTouchStart"
        @touchmove="onTouchMove"
        @touchend="onTouchEnd"
        @touchcancel="onTouchCancel"
      >
        <!-- 放大时：单图平移缩放 -->
        <div v-if="zoomed" class="photo-lb__zoom-layer">
          <img
            :src="currentUrl"
            alt="婚纱照大图"
            class="photo-lb__img"
            :style="currentImgStyle"
            draggable="false"
            @dblclick.prevent="onDoubleClick"
            @click.stop
          />
        </div>

        <!-- 未放大：三轨跟手滑动 -->
        <div v-else class="photo-lb__track" :style="trackStyleFixed">
          <div class="photo-lb__slide" :style="slideWidthStyle">
            <img v-if="prevUrl" :src="prevUrl" alt="" class="photo-lb__img" draggable="false" />
          </div>
          <div class="photo-lb__slide" :style="slideWidthStyle">
            <img
              v-if="currentUrl"
              :src="currentUrl"
              alt="婚纱照大图"
              class="photo-lb__img"
              draggable="false"
              @dblclick.prevent="onDoubleClick"
              @click.stop
            />
          </div>
          <div class="photo-lb__slide" :style="slideWidthStyle">
            <img v-if="nextUrl" :src="nextUrl" alt="" class="photo-lb__img" draggable="false" />
          </div>
        </div>
      </div>

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

  &__top {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    z-index: 2;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: calc(0.75rem + env(safe-area-inset-top, 0px)) 1rem 0.5rem;
    pointer-events: none;
  }

  &__counter {
    font-size: 0.9rem;
    opacity: 0.85;
  }

  &__close {
    pointer-events: auto;
    appearance: none;
    border: none;
    background: rgba(255, 255, 255, 0.12);
    color: #fff;
    width: 2.5rem;
    height: 2.5rem;
    border-radius: 50%;
    font-size: 1.6rem;
    line-height: 1;
    cursor: pointer;
  }

  &__hint {
    position: absolute;
    left: 0;
    right: 0;
    bottom: calc(0.85rem + env(safe-area-inset-bottom, 0px));
    z-index: 2;
    margin: 0;
    text-align: center;
    font-size: 0.72rem;
    letter-spacing: 0.04em;
    opacity: 0.45;
    pointer-events: none;

    @media (min-width: 768px) {
      display: none;
    }
  }

  &__stage {
    position: absolute;
    inset: 0;
    overflow: hidden;
    padding: calc(3.2rem + env(safe-area-inset-top, 0px)) 0
      calc(2.2rem + env(safe-area-inset-bottom, 0px));
  }

  &__track {
    display: flex;
    height: 100%;
    will-change: transform;
  }

  &__slide {
    flex: 0 0 auto;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
  }

  &__zoom-layer {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
  }

  &__img {
    display: block;
    max-width: 100%;
    max-height: 100%;
    width: auto;
    height: auto;
    object-fit: contain;
    transform-origin: center center;
    will-change: transform;
    -webkit-user-drag: none;
    pointer-events: auto;
  }

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
