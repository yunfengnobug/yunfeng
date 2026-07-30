/**
 * 婚纱照 Lightbox 触摸 / 双击 / 滚轮手势，依赖 useLightboxTrack 返回的状态
 */
export function usePhotoGestures(options) {
  const { track, urls } = options

  /** @type {'none' | 'swipe' | 'pan' | 'pinch' | 'close'} */
  let mode = 'none'
  let startX = 0
  let startY = 0
  let originOffsetX = 0
  let originOffsetY = 0
  let pinchStartDist = 0
  let pinchStartScale = 1
  let lastMoveX = 0
  let lastMoveT = 0
  let velocityX = 0
  /** 轴锁定：待定 / 横 / 纵 */
  let axis = /** @type {'pending' | 'x' | 'y'} */ ('pending')

  /**
   * @param {Touch} a
   * @param {Touch} b
   */
  function touchDist(a, b) {
    return Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY)
  }

  /**
   * @param {TouchEvent} e
   */
  function onTouchStart(e) {
    if (track.settling.value) {
      return
    }
    track.gesturing.value = true
    track.settling.value = false
    axis = 'pending'
    velocityX = 0
    lastMoveX = e.touches[0]?.clientX || 0
    lastMoveT = performance.now()

    if (e.touches.length === 2) {
      mode = 'pinch'
      pinchStartDist = touchDist(e.touches[0], e.touches[1]) || 1
      pinchStartScale = track.scale.value
      return
    }

    if (e.touches.length === 1) {
      startX = e.touches[0].clientX
      startY = e.touches[0].clientY
      originOffsetX = track.offsetX.value
      originOffsetY = track.offsetY.value
      mode = track.zoomed.value ? 'pan' : 'swipe'
    }
  }

  /**
   * @param {TouchEvent} e
   */
  function onTouchMove(e) {
    if (mode === 'none' || track.settling.value) {
      return
    }
    e.preventDefault()

    if (mode === 'pinch' && e.touches.length >= 2) {
      const dist = touchDist(e.touches[0], e.touches[1]) || 1
      const next = Math.min(4, Math.max(1, pinchStartScale * (dist / pinchStartDist)))
      track.scale.value = next
      if (next <= 1.02) {
        track.offsetX.value = 0
        track.offsetY.value = 0
      }
      return
    }

    if (e.touches.length !== 1) {
      return
    }

    const x = e.touches[0].clientX
    const y = e.touches[0].clientY
    const dx = x - startX
    const dy = y - startY
    const now = performance.now()
    const dt = Math.max(1, now - lastMoveT)
    velocityX = (x - lastMoveX) / dt
    lastMoveX = x
    lastMoveT = now

    if (mode === 'pan') {
      track.offsetX.value = originOffsetX + dx
      track.offsetY.value = originOffsetY + dy
      return
    }

    if (mode === 'swipe') {
      // 轴锁定，避免斜滑抖动
      if (axis === 'pending' && (Math.abs(dx) > 8 || Math.abs(dy) > 8)) {
        axis = Math.abs(dx) >= Math.abs(dy) ? 'x' : 'y'
        if (axis === 'x') {
          track.enableNeighbors()
        }
      }
      if (axis === 'y') {
        track.dragX.value = 0
        track.closeY.value = Math.max(0, dy)
        return
      }
      if (axis === 'x' || axis === 'pending') {
        track.closeY.value = 0
        track.dragX.value = track.applyEdgeRubber(dx)
      }
    }
  }

  /**
   * @param {TouchEvent} e
   */
  function onTouchEnd(e) {
    if (e.touches.length > 0) {
      if (e.touches.length === 1 && track.zoomed.value) {
        mode = 'pan'
        startX = e.touches[0].clientX
        startY = e.touches[0].clientY
        originOffsetX = track.offsetX.value
        originOffsetY = track.offsetY.value
      }
      return
    }

    const endMode = mode
    mode = 'none'
    const dx = track.dragX.value
    const dy = track.closeY.value
    const w = track.viewportW.value || window.innerWidth
    const speed = velocityX
    const list = toValue(urls)

    if (endMode === 'swipe') {
      // 下滑关闭
      if (axis === 'y' && dy > 96) {
        track.gesturing.value = false
        track.close()
        return
      }

      const distanceOk = Math.abs(dx) > w * 0.18
      const velocityOk = Math.abs(speed) > 0.45
      const goNext = (dx < 0 && distanceOk) || speed < -0.45
      const goPrev = (dx > 0 && distanceOk) || speed > 0.45

      if (goNext && track.index.value < list.length - 1 && (distanceOk || velocityOk)) {
        track.settleTo(-w, track.index.value + 1)
        return
      }
      if (goPrev && track.index.value > 0 && (distanceOk || velocityOk)) {
        track.settleTo(w, track.index.value - 1)
        return
      }

      // 回弹
      track.settleTo(0, null)
      return
    }

    track.gesturing.value = false
    if (track.scale.value < 1.05) {
      track.resetTransform()
    }
  }

  function onTouchCancel() {
    mode = 'none'
    axis = 'pending'
    track.settleTo(0, null)
  }

  /** 双击放大 / 还原 */
  function onDoubleClick() {
    if (track.scale.value > 1.2) {
      track.resetTransform()
    } else {
      track.scale.value = 2.2
    }
  }

  /**
   * @param {WheelEvent} e
   */
  function onWheel(e) {
    e.preventDefault()
    if (Math.abs(e.deltaX) > Math.abs(e.deltaY) && !track.zoomed.value) {
      // 触控板左右滑切图
      if (e.deltaX > 30) {
        track.go(1)
      } else if (e.deltaX < -30) {
        track.go(-1)
      }
      return
    }
    const delta = e.deltaY < 0 ? 0.15 : -0.15
    const next = Math.min(4, Math.max(1, Number((track.scale.value + delta).toFixed(2))))
    track.scale.value = next
    if (next <= 1) {
      track.offsetX.value = 0
      track.offsetY.value = 0
    }
  }

  return {
    onTouchStart,
    onTouchMove,
    onTouchEnd,
    onTouchCancel,
    onDoubleClick,
    onWheel,
  }
}
