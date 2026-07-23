<!-- 婚纱照缩略图：加载中显示骨架闪烁，完成后淡入（SSR/CSR 初始均为未加载） -->
<script setup>
const props = defineProps({
  // 图片地址
  src: { type: String, required: true },
  // 无障碍文案
  alt: { type: String, default: '' },
})

const imgRef = ref(null)
// 是否已加载完成（SSR/CSR 同为 false，避免水合分叉）
const loaded = ref(false)

/** 标记加载完成 */
function markLoaded() {
  loaded.value = true
}

onMounted(() => {
  // 缓存命中时 load 可能已触发，用 complete 兜底
  const el = imgRef.value
  if (el?.complete && el.naturalWidth > 0) {
    loaded.value = true
  }
})
</script>

<template>
  <span class="photo-thumb" :class="{ 'is-loaded': loaded }">
    <span v-show="!loaded" class="photo-thumb__skeleton" aria-hidden="true" />
    <img
      ref="imgRef"
      class="photo-thumb__img"
      :src="src"
      :alt="alt"
      loading="lazy"
      decoding="async"
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
