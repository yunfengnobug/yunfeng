<!-- 婚纱照缩略图：七牛 imageView2 压缩 + 视口懒加载 -->
<script setup>
import { buildPhotoThumbUrl, registerPhotoLoaded } from '~/utils/photoSrcCache.js'

const props = defineProps({
  // 原图 CDN 地址（入库的完整链接）
  src: { type: String, required: true },
  // 无障碍文案
  alt: { type: String, default: '' },
})

const rootRef = ref(null)
const imgRef = ref(null)
// 是否进入视口（SSR/CSR 初始 false，避免水合分叉）
const inView = ref(false)
// 是否已加载完成
const loaded = ref(false)

// 列表用七牛压缩图（webp + 限宽）
const thumbSrc = computed(() => buildPhotoThumbUrl(props.src))

/** 标记加载完成并登记缓存（按缩略图 URL） */
function markLoaded() {
  loaded.value = true
  registerPhotoLoaded(thumbSrc.value, imgRef.value)
}

onMounted(() => {
  const root = rootRef.value
  if (!root || typeof IntersectionObserver === 'undefined') {
    inView.value = true
    return
  }
  const io = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) {
          continue
        }
        inView.value = true
        io.disconnect()
        break
      }
    },
    {
      rootMargin: '40% 0px',
      threshold: 0.01,
    },
  )
  io.observe(root)
  onBeforeUnmount(() => io.disconnect())
})
</script>

<template>
  <span ref="rootRef" class="photo-thumb" :class="{ 'is-loaded': loaded }">
    <span v-show="!loaded" class="photo-thumb__skeleton" aria-hidden="true" />
    <img
      v-if="inView"
      ref="imgRef"
      class="photo-thumb__img"
      :src="thumbSrc"
      :alt="alt"
      :data-photo-src="thumbSrc"
      decoding="async"
      fetchpriority="low"
      @load="markLoaded"
      @error="markLoaded"
    />
  </span>
</template>

<style lang="scss" scoped>
.photo-thumb {
  position: relative;
  display: block;
  width: 100%;
  overflow: hidden;
  background: #ebe4de;

  &__skeleton {
    position: absolute;
    inset: 0;
    z-index: 1;
    min-height: 12rem;
    background: linear-gradient(110deg, #ebe4de 25%, #f7f1ec 37%, #ebe4de 63%);
    background-size: 200% 100%;
    animation: photo-shimmer 1.2s ease-in-out infinite;
  }

  &__img {
    display: block;
    width: 100%;
    height: auto;
    opacity: 0;
    transition: opacity 0.35s ease;
  }

  &.is-loaded &__img {
    opacity: 1;
  }
}

@keyframes photo-shimmer {
  0% {
    background-position: 100% 0;
  }
  100% {
    background-position: -100% 0;
  }
}
</style>
