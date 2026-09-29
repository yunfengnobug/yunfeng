<script setup>
// 应用根：统一文档标题为「云枫」，内页为「页面名 · 云枫」
useHead({
  titleTemplate: (titleChunk) => {
    if (!titleChunk || titleChunk === SITE_NAME) return SITE_NAME
    return `${titleChunk} · ${SITE_NAME}`
  },
})
</script>

<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>
