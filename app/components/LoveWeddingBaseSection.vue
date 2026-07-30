<!-- 婚纱照底图：默认收起的弱化入口 -->
<script setup>
defineProps({
  // 底图列表
  photos: { type: Array, default: () => [] },
  // 是否展开
  open: { type: Boolean, default: false },
})

const emit = defineEmits(['toggle', 'open-lightbox'])
</script>

<template>
  <section v-if="photos.length" class="wedding-base" aria-labelledby="base-heading">
    <button
      id="base-heading"
      type="button"
      class="wedding-base__toggle"
      :aria-expanded="open"
      @click="emit('toggle')"
    >
      {{ open ? '收起原片底图' : '查看原片底图' }}
      <span aria-hidden="true">{{ open ? '▴' : '▾' }}</span>
    </button>
    <div v-show="open" class="wedding-base__grid">
      <button
        v-for="(item, index) in photos"
        :key="item.id"
        type="button"
        class="wedding-base__card"
        @click="emit('open-lightbox', index)"
      >
        <LovePhotoThumb :src="item.url" :alt="`底图 ${item.id}`" />
      </button>
    </div>
  </section>
</template>

<style lang="scss" scoped>
@use '~/assets/styles/variables.scss' as *;

.wedding-base {
  max-width: 1100px;
  margin: 0 auto;
  padding: 0 1.25rem 1rem;
  text-align: center;

  &__toggle {
    appearance: none;
    border: none;
    background: transparent;
    cursor: pointer;
    font-size: 0.8rem;
    color: #a8988c;
    padding: 0.5rem 0.75rem;
    letter-spacing: 0.04em;

    &:hover {
      color: #7a6a60;
    }

    span {
      margin-left: 0.25rem;
    }
  }

  &__grid {
    margin-top: 1rem;
    column-count: 2;
    column-gap: 0.5rem;
    opacity: 0.92;
    text-align: left;

    @media (min-width: $bp-tablet) {
      column-count: 3;
      column-gap: 0.65rem;
    }

    @media (min-width: 1024px) {
      column-count: 4;
    }
  }

  &__card {
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
  }
}
</style>
