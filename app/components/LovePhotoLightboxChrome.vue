<!-- 婚纱照 Lightbox 顶栏计数、关闭钮与操作提示 -->
<script setup>
defineProps({
  // 计数文案，如「1 / 12」
  counterText: { type: String, default: '' },
})

const emit = defineEmits(['close'])
</script>

<template>
  <div class="photo-lb__top">
    <span class="photo-lb__counter">{{ counterText }}</span>
    <button type="button" class="photo-lb__close" aria-label="关闭" @click="emit('close')">
      ×
    </button>
  </div>

  <p class="photo-lb__hint">左右滑动切换 · 双指缩放 · 双击放大</p>
</template>

<style lang="scss" scoped>
.photo-lb__top {
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

.photo-lb__counter {
  font-size: 0.9rem;
  opacity: 0.85;
}

.photo-lb__close {
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

.photo-lb__hint {
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
</style>
