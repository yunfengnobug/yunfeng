<template>
  <div class="hearts" aria-hidden="true">
    <div
      v-for="(heart, index) in fallingHearts"
      :key="`fall-${index}`"
      class="heart"
      :style="{
        animationDelay: `${heart.delay}s`,
        left: `${heart.left}%`,
        animationDuration: `${heart.duration}s`,
      }"
    >
      {{ heart.emoji }}
    </div>
  </div>
  <div class="bottom-hearts" aria-hidden="true">
    <div
      v-for="(heart, index) in floatingHearts"
      :key="`float-${index}`"
      class="floating-heart"
      :style="{
        animationDelay: `${heart.delay}s`,
        left: `${heart.left}%`,
      }"
    >
      {{ heart.emoji }}
    </div>
  </div>
</template>

<script setup>
// 仅客户端渲染的随机爱心动画，避免水合不一致

const heartEmojis = ['❤️', '💕', '💖', '💗', '💙', '💚', '💛', '💜', '🖤', '🤍', '💝', '💞', '💟']

// 生成随机爱心位置与动画参数
function generateHearts(count) {
  return Array.from({ length: count }, () => ({
    emoji: heartEmojis[Math.floor(Math.random() * heartEmojis.length)],
    left: Math.random() * 100,
    delay: Math.random() * 8,
    duration: 8 + Math.random() * 5,
  }))
}

const fallingHearts = ref(generateHearts(30))
const floatingHearts = ref(generateHearts(15))
</script>

<style lang="scss" scoped>
.hearts {
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: 1;
  overflow: hidden;

  .heart {
    position: absolute;
    top: -50px;
    font-size: 1.5rem;
    animation: falling linear infinite;
    opacity: 0.8;
  }
}

.bottom-hearts {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 200px;
  pointer-events: none;
  z-index: 1;

  .floating-heart {
    position: absolute;
    bottom: -50px;
    font-size: 1.5rem;
    animation: floating 4s ease-in-out infinite;
  }
}

@keyframes falling {
  0% {
    transform: translateY(-50px) rotate(0deg);
    opacity: 0;
  }
  10%,
  90% {
    opacity: 0.8;
  }
  100% {
    transform: translateY(100vh) rotate(360deg);
    opacity: 0;
  }
}

@keyframes floating {
  0%,
  100% {
    transform: translateY(0) scale(1);
    opacity: 0.6;
  }
  50% {
    transform: translateY(-100px) scale(1.2);
    opacity: 1;
  }
}
</style>
