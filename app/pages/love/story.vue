<!-- 「我们的故事」纪念页（由原 /love 迁入）；随机爱心由客户端组件承载 -->
<script setup>
import { LOVE_STORY_START_DATE_KEY } from '~/utils/love-story-content.js'

definePageMeta({
  // 去掉内容区内边距，全宽沉浸展示
  contentPadding: 0,
})

useSeoMeta({
  title: '我们的故事',
  description: '王俊杰与李朝新的纪念页',
})

// 离开「我们」板块时停止欢迎背景音乐
useStopWelcomeBgmOnLeave()

// 计算已在一起的天数（上海时区日历差，与进程本地时区无关）
function calcDaysCount() {
  return calendarDaysSinceShanghai(LOVE_STORY_START_DATE_KEY)
}

const daysCount = ref(calcDaysCount())

onMounted(() => {
  // 客户端再校准一次，避免跨请求边界的极小偏差
  daysCount.value = calcDaysCount()
})
</script>

<template>
  <div class="love-container">
    <LoveHearts />
    <LoveStoryBody :days-count="daysCount" />
  </div>
</template>

<style scoped lang="scss">
.love-container {
  position: relative;
  min-height: 100vh;
  background: linear-gradient(135deg, #fff5f5 0%, #ffe4ec 50%, #ffd6e7 100%);
  overflow: hidden;
}
</style>
