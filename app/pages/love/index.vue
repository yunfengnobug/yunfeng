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

// 离开「我们」板块时停止欢迎背景音乐
useStopWelcomeBgmOnLeave()

// SSR 拉取三类照片；失败时给空数组，避免页面崩溃
const { data: photoData, pending: photosPending } = await useAsyncData(
  'wedding-photos',
  async () => {
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
  },
)

const finalPhotos = computed(() => photoData.value?.final || [])
const draftPhotos = computed(() => photoData.value?.draft || [])
const basePhotos = computed(() => photoData.value?.base || [])

// 底图默认收起（SSR/CSR 初始均为 false，无水合分叉）
const baseOpen = ref(false)

// 灯箱：仅客户端打开；初始关闭保证水合一致
const lightboxOpen = ref(false)
const lightboxUrls = ref([])
const lightboxIndex = ref(0)

/**
 * 打开全屏预览（在当前分区内左右滑切换）
 * @param {Array<{ url: string }>} list
 * @param {number} index
 */
function openLightbox(list, index) {
  lightboxUrls.value = (list || []).map((item) => item.url).filter(Boolean)
  lightboxIndex.value = index
  lightboxOpen.value = true
}

/** 切换底图展开 */
function toggleBase() {
  baseOpen.value = !baseOpen.value
}

onBeforeUnmount(() => {
  // 离开页时清掉已加载标记，避免跨次进入无限堆积
  clearPhotoSrcCache()
})
</script>

<template>
  <div class="wedding">
    <!-- 欢迎遮罩：.client + ClientOnly；SSR 仅黑底占位，不含 video -->
    <ClientOnly>
      <LoveWelcomeOverlay />
      <template #fallback>
        <div class="wedding__welcome-ssr" aria-hidden="true" />
      </template>
    </ClientOnly>

    <LoveWeddingHero />

    <LoveWeddingPhotoSection
      title="精修"
      desc="精选成片"
      heading-id="final-heading"
      variant="final"
      :photos="finalPhotos"
      :pending="photosPending"
      empty-text="精修照片即将上传"
      :skeleton-count="2"
      alt-prefix="精修"
      @open="(index) => openLightbox(finalPhotos, index)"
    />

    <LoveWeddingPhotoSection
      title="初修"
      desc="更多瞬间"
      heading-id="draft-heading"
      variant="draft"
      :photos="draftPhotos"
      :pending="photosPending"
      empty-text="初修照片即将上传"
      :skeleton-count="6"
      alt-prefix="初修"
      @open="(index) => openLightbox(draftPhotos, index)"
    />

    <LoveWeddingBaseSection
      :photos="basePhotos"
      :open="baseOpen"
      @toggle="toggleBase"
      @open-lightbox="(index) => openLightbox(basePhotos, index)"
    />

    <!-- 客户端全屏预览：左右滑 / 双指缩放 -->
    <LovePhotoLightbox v-model="lightboxOpen" :urls="lightboxUrls" :start-index="lightboxIndex" />
  </div>
</template>

<style lang="scss" scoped>
.wedding {
  min-height: 100vh;
  background:
    radial-gradient(ellipse 80% 50% at 50% -10%, rgba(232, 180, 184, 0.35), transparent),
    linear-gradient(180deg, #faf7f5 0%, #f3ebe6 40%, #efe6df 100%);
  color: #3d342f;
  padding-bottom: 4rem;

  // SSR/水合前占位：全屏黑底，不含 video，避免闪出正文
  &__welcome-ssr {
    position: fixed;
    inset: 0;
    z-index: 90000;
    background: #000;
  }
}
</style>
