<!-- 婚纱照 Lightbox 舞台：三轨跟手 / 放大层、加载态 -->
<script setup>
defineProps({
  // 将舞台 DOM 写回父级 stageRef（函数 ref，避免 prop 解包丢失 Ref）
  setStageEl: { type: Function, required: true },
  zoomed: { type: Boolean, default: false },
  trackStyleFixed: { type: Object, default: () => ({}) },
  slideWidthStyle: { type: Object, default: () => ({}) },
  currentImgStyle: { type: Object, default: () => ({}) },
  displayPrev: { type: String, default: '' },
  displayCurrent: { type: String, default: '' },
  displayNext: { type: String, default: '' },
  // 预览压缩 URL，用于 img :key
  previewCurrent: { type: String, default: '' },
  currentLoading: { type: Boolean, default: false },
  onTouchStart: { type: Function, default: undefined },
  onTouchMove: { type: Function, default: undefined },
  onTouchEnd: { type: Function, default: undefined },
  onTouchCancel: { type: Function, default: undefined },
  onCurrentImgLoad: { type: Function, default: undefined },
  onDoubleClick: { type: Function, default: undefined },
})

const emit = defineEmits(['close'])
</script>

<template>
  <div
    :ref="setStageEl"
    class="photo-lb__stage"
    @click.self="emit('close')"
    @touchstart.passive="onTouchStart"
    @touchmove="onTouchMove"
    @touchend="onTouchEnd"
    @touchcancel="onTouchCancel"
  >
    <div v-if="currentLoading" class="photo-lb__loading" aria-hidden="true">
      <span class="photo-lb__spinner" />
    </div>

    <!-- 放大时：单图平移缩放 -->
    <div v-if="zoomed" class="photo-lb__zoom-layer">
      <img
        :key="`zoom-${previewCurrent}`"
        :src="displayCurrent"
        alt="婚纱照大图"
        class="photo-lb__img"
        :style="currentImgStyle"
        draggable="false"
        @load="onCurrentImgLoad"
        @error="onCurrentImgLoad"
        @dblclick.prevent="onDoubleClick"
        @click.stop
      />
    </div>

    <!-- 未放大：三轨跟手滑动；邻图仅在横滑/切图后加载 -->
    <div v-else class="photo-lb__track" :style="trackStyleFixed">
      <div class="photo-lb__slide" :style="slideWidthStyle">
        <img v-if="displayPrev" :src="displayPrev" alt="" class="photo-lb__img" draggable="false" />
      </div>
      <div class="photo-lb__slide" :style="slideWidthStyle">
        <img
          v-if="displayCurrent"
          :key="`cur-${previewCurrent}`"
          :src="displayCurrent"
          alt="婚纱照大图"
          class="photo-lb__img"
          draggable="false"
          @load="onCurrentImgLoad"
          @error="onCurrentImgLoad"
          @dblclick.prevent="onDoubleClick"
          @click.stop
        />
      </div>
      <div class="photo-lb__slide" :style="slideWidthStyle">
        <img v-if="displayNext" :src="displayNext" alt="" class="photo-lb__img" draggable="false" />
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.photo-lb__stage {
  position: absolute;
  inset: 0;
  overflow: hidden;
  padding: calc(3.2rem + env(safe-area-inset-top, 0px)) 0
    calc(2.2rem + env(safe-area-inset-bottom, 0px));
}

.photo-lb__loading {
  position: absolute;
  inset: 0;
  z-index: 3;
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: none;
}

.photo-lb__spinner {
  width: 2.25rem;
  height: 2.25rem;
  border: 2px solid rgba(255, 255, 255, 0.2);
  border-top-color: rgba(255, 255, 255, 0.9);
  border-radius: 50%;
  animation: photo-lb-spin 0.7s linear infinite;
}

.photo-lb__track {
  display: flex;
  height: 100%;
  will-change: transform;
}

.photo-lb__slide {
  flex: 0 0 auto;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.photo-lb__zoom-layer {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.photo-lb__img {
  display: block;
  max-width: 100%;
  max-height: 100%;
  width: auto;
  height: auto;
  object-fit: contain;
  transform-origin: center center;
  will-change: transform;
  -webkit-user-drag: none;
  pointer-events: auto;
}

@keyframes photo-lb-spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
