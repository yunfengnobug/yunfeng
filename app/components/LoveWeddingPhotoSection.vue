<!-- 婚纱照分区网格：精修（疏）/ 初修（密）/ 底图 -->
<script setup>
defineProps({
  // 分区标题
  title: { type: String, required: true },
  // 标题旁说明
  desc: { type: String, default: '' },
  // 无障碍标题 id
  headingId: { type: String, required: true },
  // 照片列表
  photos: { type: Array, default: () => [] },
  // 是否加载中
  pending: { type: Boolean, default: false },
  // 空态文案
  emptyText: { type: String, default: '照片即将上传' },
  // final | draft | base
  variant: { type: String, default: 'draft' },
  // 骨架格子数
  skeletonCount: { type: Number, default: 6 },
  // 图片 alt 前缀
  altPrefix: { type: String, default: '婚纱照' },
})

const emit = defineEmits(['open'])
</script>

<template>
  <section
    class="wedding-section"
    :class="`wedding-section--${variant}`"
    :aria-labelledby="headingId"
  >
    <div class="wedding-section__head">
      <h2 :id="headingId" class="wedding-section__title">{{ title }}</h2>
      <p v-if="desc" class="wedding-section__desc">{{ desc }}</p>
    </div>
    <p v-if="!photos.length && !pending" class="wedding-section__empty">{{ emptyText }}</p>
    <div
      v-else-if="pending"
      class="wedding-grid"
      :class="`wedding-grid--${variant}`"
      aria-busy="true"
    >
      <div
        v-for="n in skeletonCount"
        :key="`sk-${n}`"
        class="wedding-card wedding-card--skeleton"
        :class="`wedding-card--${variant}`"
      >
        <span class="wedding-skel" />
      </div>
    </div>
    <div v-else class="wedding-grid" :class="`wedding-grid--${variant}`">
      <button
        v-for="(item, index) in photos"
        :key="item.id"
        type="button"
        class="wedding-card"
        :class="`wedding-card--${variant}`"
        @click="emit('open', index)"
      >
        <LovePhotoThumb :src="item.url" :alt="`${altPrefix} ${item.id}`" />
      </button>
    </div>
  </section>
</template>

<style lang="scss" scoped>
@use '~/assets/styles/variables.scss' as *;

.wedding-section {
  max-width: 1100px;
  margin: 0 auto;
  padding: 1.5rem 1.25rem 2.5rem;

  &--final {
    padding-top: 0.5rem;
  }

  &--draft {
    border-top: 1px solid rgba(80, 60, 50, 0.08);
  }

  &--base {
    padding-top: 0;
  }

  &__head {
    margin-bottom: 1.5rem;
    text-align: center;
  }

  &__title {
    margin: 0 0 0.35rem;
    font-family: 'Georgia', 'Songti SC', 'SimSun', serif;
    font-size: 1.35rem;
    font-weight: 500;
    letter-spacing: 0.2em;
  }

  &__desc {
    margin: 0;
    font-size: 0.85rem;
    color: #9a8578;
  }

  &__empty {
    text-align: center;
    color: #b0a29a;
    font-size: 0.9rem;
    padding: 2rem 0;
  }
}

.wedding-grid {
  // 等宽瀑布流
  column-count: 2;
  column-gap: 0.5rem;

  @media (min-width: $bp-tablet) {
    column-count: 3;
    column-gap: 0.65rem;
  }

  @media (min-width: 1024px) {
    column-count: 4;
  }

  &--final {
    column-count: 1;
    column-gap: 1.25rem;

    @media (min-width: $bp-tablet) {
      column-count: 2;
      column-gap: 1.5rem;
    }
  }

  &--base {
    margin-top: 1rem;
    opacity: 0.92;
  }
}

.wedding-card {
  appearance: none;
  border: none;
  padding: 0;
  margin: 0 0 0.5rem;
  background: #ebe4de;
  cursor: zoom-in;
  display: block;
  width: 100%;
  break-inside: avoid;
  -webkit-column-break-inside: avoid;
  page-break-inside: avoid;
  overflow: hidden;

  &:hover :deep(.photo-thumb__img) {
    opacity: 0.88;
  }

  &--final {
    margin: 0 0 1.25rem;
    background: transparent;
    // 精修：无圆角卡片感，全幅沉浸
    box-shadow: 0 12px 40px rgba(60, 40, 30, 0.12);

    :deep(.photo-thumb) {
      transition: transform 0.45s ease;
    }

    &:hover :deep(.photo-thumb) {
      transform: scale(1.015);
    }

    &:hover :deep(.photo-thumb__img) {
      opacity: 1;
    }
  }

  &--skeleton {
    pointer-events: none;
    min-height: 10rem;
    background: transparent;
    box-shadow: none;
  }

  &--final.wedding-card--skeleton {
    min-height: 0;
  }
}

.wedding-skel {
  display: block;
  width: 100%;
  min-height: 14rem;
  border-radius: 2px;
  background: linear-gradient(110deg, #ebe4de 25%, #f7f1ec 37%, #ebe4de 63%);
  background-size: 200% 100%;
  animation: wedding-page-shimmer 1.2s ease-in-out infinite;
}

@keyframes wedding-page-shimmer {
  0% {
    background-position: 100% 0;
  }
  100% {
    background-position: -100% 0;
  }
}
</style>
