<!-- 婚纱照页：主推精修/初修（不同风格），底图弱化；入口链到我们的故事 -->
<script setup>
definePageMeta({
  // 去掉内容区内边距，全宽沉浸展示
  contentPadding: 0,
})

useSeoMeta({
  title: '婚纱照',
  description: '王俊杰与李朝新的婚纱照',
})

// SSR 拉取三类照片；失败时给空数组，避免页面崩溃
const { data: photoData } = await useAsyncData('wedding-photos', async () => {
  try {
    const res = await $fetch('/api/wedding-photos')
    return (
      res?.data || {
        draft: [],
        final: [],
        base: [],
      }
    )
  } catch {
    return { draft: [], final: [], base: [] }
  }
})

const finalPhotos = computed(() => photoData.value?.final || [])
const draftPhotos = computed(() => photoData.value?.draft || [])
const basePhotos = computed(() => photoData.value?.base || [])

// 底图默认收起（SSR/CSR 初始均为 false，无水合分叉）
const baseOpen = ref(false)

// 灯箱：当前大图 url；null 表示关闭
const lightboxUrl = ref(null)

/**
 * 打开灯箱
 * @param {string} url
 */
function openLightbox(url) {
  lightboxUrl.value = url
}

/** 关闭灯箱 */
function closeLightbox() {
  lightboxUrl.value = null
}

/** 切换底图展开 */
function toggleBase() {
  baseOpen.value = !baseOpen.value
}

onMounted(() => {
  // Esc 关闭灯箱（仅客户端）
  window.addEventListener('keydown', onLightboxKeydown)
})

onBeforeUnmount(() => {
  window.removeEventListener('keydown', onLightboxKeydown)
})

/**
 * 键盘关闭灯箱
 * @param {KeyboardEvent} e
 */
function onLightboxKeydown(e) {
  if (e.key === 'Escape') {
    closeLightbox()
  }
}
</script>

<template>
  <div class="wedding">
    <header class="wedding__hero">
      <p class="wedding__eyebrow">Wedding</p>
      <h1 class="wedding__title">我们的婚纱照</h1>
      <p class="wedding__subtitle">精修与初修，定格这一天</p>
      <NuxtLink to="/love/story" class="wedding__story-link">我们的故事 →</NuxtLink>
    </header>

    <!-- 精修：少而疏，大图卡片 -->
    <section class="wedding__section wedding__section--final" aria-labelledby="final-heading">
      <div class="wedding__section-head">
        <h2 id="final-heading" class="wedding__section-title">精修</h2>
        <p class="wedding__section-desc">精选成片</p>
      </div>
      <p v-if="!finalPhotos.length" class="wedding__empty">精修照片即将上传</p>
      <div v-else class="final-grid">
        <button
          v-for="item in finalPhotos"
          :key="item.id"
          type="button"
          class="final-card"
          @click="openLightbox(item.url)"
        >
          <img :src="item.url" :alt="`精修 ${item.id}`" loading="lazy" />
        </button>
      </div>
    </section>

    <!-- 初修：密网格 -->
    <section class="wedding__section wedding__section--draft" aria-labelledby="draft-heading">
      <div class="wedding__section-head">
        <h2 id="draft-heading" class="wedding__section-title">初修</h2>
        <p class="wedding__section-desc">更多瞬间</p>
      </div>
      <p v-if="!draftPhotos.length" class="wedding__empty">初修照片即将上传</p>
      <div v-else class="draft-grid">
        <button
          v-for="item in draftPhotos"
          :key="item.id"
          type="button"
          class="draft-card"
          @click="openLightbox(item.url)"
        >
          <img :src="item.url" :alt="`初修 ${item.id}`" loading="lazy" />
        </button>
      </div>
    </section>

    <!-- 底图：弱化入口，默认收起 -->
    <section v-if="basePhotos.length" class="wedding__base" aria-labelledby="base-heading">
      <button
        id="base-heading"
        type="button"
        class="wedding__base-toggle"
        :aria-expanded="baseOpen"
        @click="toggleBase"
      >
        {{ baseOpen ? '收起原片底图' : '查看原片底图' }}
        <span aria-hidden="true">{{ baseOpen ? '▴' : '▾' }}</span>
      </button>
      <div v-show="baseOpen" class="draft-grid draft-grid--base">
        <button
          v-for="item in basePhotos"
          :key="item.id"
          type="button"
          class="draft-card"
          @click="openLightbox(item.url)"
        >
          <img :src="item.url" :alt="`底图 ${item.id}`" loading="lazy" />
        </button>
      </div>
    </section>

    <!-- 灯箱：ClientOnly 避免 SSR/CSR 交互态差异；内容由 lightboxUrl 驱动 -->
    <Teleport to="body">
      <div
        v-if="lightboxUrl"
        class="lightbox"
        role="dialog"
        aria-modal="true"
        aria-label="查看大图"
        @click.self="closeLightbox"
      >
        <button type="button" class="lightbox__close" aria-label="关闭" @click="closeLightbox">
          ×
        </button>
        <img :src="lightboxUrl" alt="婚纱照大图" class="lightbox__img" />
      </div>
    </Teleport>
  </div>
</template>

<style lang="scss" scoped>
@use '~/assets/styles/variables.scss' as *;

.wedding {
  min-height: 100vh;
  background:
    radial-gradient(ellipse 80% 50% at 50% -10%, rgba(232, 180, 184, 0.35), transparent),
    linear-gradient(180deg, #faf7f5 0%, #f3ebe6 40%, #efe6df 100%);
  color: #3d342f;
  padding-bottom: 4rem;

  &__hero {
    text-align: center;
    padding: 3.5rem 1.25rem 2.5rem;
  }

  &__eyebrow {
    margin: 0 0 0.5rem;
    font-size: 0.75rem;
    letter-spacing: 0.28em;
    text-transform: uppercase;
    color: #9a8578;
  }

  &__title {
    margin: 0 0 0.75rem;
    font-family: 'Georgia', 'Songti SC', 'SimSun', serif;
    font-size: clamp(1.8rem, 5vw, 2.6rem);
    font-weight: 500;
    letter-spacing: 0.08em;
    color: #2c2420;
  }

  &__subtitle {
    margin: 0 0 1.5rem;
    font-size: 0.95rem;
    color: #7a6a60;
  }

  &__story-link {
    display: inline-block;
    font-size: 0.9rem;
    color: #8b5a4a;
    border-bottom: 1px solid rgba(139, 90, 74, 0.35);
    padding-bottom: 2px;
    transition:
      color 0.2s,
      border-color 0.2s;

    &:hover {
      color: #5c3a30;
      border-color: #5c3a30;
    }
  }

  &__section {
    max-width: 1100px;
    margin: 0 auto;
    padding: 1.5rem 1.25rem 2.5rem;
  }

  &__section--final {
    padding-top: 0.5rem;
  }

  &__section--draft {
    border-top: 1px solid rgba(80, 60, 50, 0.08);
  }

  &__section-head {
    margin-bottom: 1.5rem;
    text-align: center;
  }

  &__section-title {
    margin: 0 0 0.35rem;
    font-family: 'Georgia', 'Songti SC', 'SimSun', serif;
    font-size: 1.35rem;
    font-weight: 500;
    letter-spacing: 0.2em;
  }

  &__section-desc {
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

  &__base {
    max-width: 1100px;
    margin: 0 auto;
    padding: 0 1.25rem 1rem;
    text-align: center;
  }

  &__base-toggle {
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
}

.final-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1.75rem;

  @media (min-width: $bp-tablet) {
    grid-template-columns: repeat(2, 1fr);
    gap: 2rem;
  }
}

.final-card {
  appearance: none;
  border: none;
  padding: 0;
  margin: 0;
  background: transparent;
  cursor: zoom-in;
  display: block;
  width: 100%;
  overflow: hidden;
  // 精修：无圆角卡片感，全幅沉浸
  box-shadow: 0 12px 40px rgba(60, 40, 30, 0.12);

  img {
    display: block;
    width: 100%;
    height: auto;
    aspect-ratio: 3 / 4;
    object-fit: cover;
    transition: transform 0.45s ease;
  }

  &:hover img {
    transform: scale(1.02);
  }
}

.draft-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.5rem;

  @media (min-width: $bp-tablet) {
    grid-template-columns: repeat(4, 1fr);
    gap: 0.65rem;
  }

  &--base {
    margin-top: 1rem;
    opacity: 0.92;
  }
}

.draft-card {
  appearance: none;
  border: none;
  padding: 0;
  margin: 0;
  background: #ebe4de;
  cursor: zoom-in;
  display: block;
  width: 100%;
  overflow: hidden;

  img {
    display: block;
    width: 100%;
    aspect-ratio: 1;
    object-fit: cover;
    transition: opacity 0.25s ease;
  }

  &:hover img {
    opacity: 0.88;
  }
}

.lightbox {
  position: fixed;
  inset: 0;
  z-index: 9999;
  background: rgba(20, 14, 12, 0.92);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1.5rem;
  cursor: zoom-out;

  &__close {
    position: absolute;
    top: 1rem;
    right: 1.25rem;
    appearance: none;
    border: none;
    background: transparent;
    color: #fff;
    font-size: 2rem;
    line-height: 1;
    cursor: pointer;
    opacity: 0.8;

    &:hover {
      opacity: 1;
    }
  }

  &__img {
    max-width: min(100%, 1100px);
    max-height: 90vh;
    object-fit: contain;
    cursor: default;
    box-shadow: 0 8px 40px rgba(0, 0, 0, 0.4);
  }
}
</style>
