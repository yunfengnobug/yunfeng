/**
 * 婚纱照 Lightbox 三轨位移、缩放与 settle 动画状态
 */
export function useLightboxTrack(options) {
  const { urls, close } = options

  // 当前下标
  const index = ref(0)
  // 缩放（仅当前图）
  const scale = ref(1)
  // 放大后平移
  const offsetX = ref(0)
  const offsetY = ref(0)
  // 轨道跟手水平位移（相对中间页）
  const dragX = ref(0)
  // 下滑关闭跟手
  const closeY = ref(0)
  // 跟手中：关闭 CSS transition
  const gesturing = ref(false)
  // 松手后位移动画中
  const settling = ref(false)
  // 视口宽度（px），用于轨道定位
  const viewportW = ref(0)
  // 是否允许加载左右邻图（默认否，避免一点开就打 3 次 CDN）
  const neighborsEnabled = ref(false)

  const stageRef = ref(null)

  /** 防止 settle 回调重复执行 */
  let settleToken = 0
  /** settleTo 的 setTimeout id，卸载时需清理 */
  let settleTimer = null

  const zoomed = computed(() => scale.value > 1.08)

  /** 三轨容器位移：默认停在中间页；跟手时无 transition，松手 settling 时缓动 */
  const trackStyleFixed = computed(() => {
    const w = viewportW.value || 0
    return {
      width: `${w * 3}px`,
      transform: `translate3d(${-w + dragX.value}px, ${closeY.value}px, 0)`,
      transition: gesturing.value
        ? 'none'
        : settling.value
          ? 'transform 0.28s cubic-bezier(0.22, 0.8, 0.28, 1)'
          : 'none',
    }
  })

  const slideWidthStyle = computed(() => ({
    width: `${viewportW.value || 0}px`,
  }))

  const currentImgStyle = computed(() => ({
    transform: `translate3d(${offsetX.value}px, ${offsetY.value}px, 0) scale(${scale.value})`,
    transition: gesturing.value ? 'none' : 'transform 0.2s ease-out',
  }))

  /**
   * 测量舞台宽度
   */
  function measureViewport() {
    viewportW.value = stageRef.value?.clientWidth || window.innerWidth || 0
  }

  /**
   * 重置缩放 / 跟手位移
   */
  function resetTransform() {
    scale.value = 1
    offsetX.value = 0
    offsetY.value = 0
    dragX.value = 0
    closeY.value = 0
  }

  /**
   * 无动画切换索引并复位轨道
   * @param {number} nextIndex
   */
  function commitIndex(nextIndex) {
    index.value = nextIndex
    settling.value = false
    gesturing.value = true
    dragX.value = 0
    closeY.value = 0
    scale.value = 1
    offsetX.value = 0
    offsetY.value = 0
    // 下一帧再允许 transition，避免复位闪一下
    requestAnimationFrame(() => {
      gesturing.value = false
    })
  }

  /**
   * 取消未完成的 settle 定时器，并作废回调
   */
  function cleanupSettle() {
    if (settleTimer != null) {
      window.clearTimeout(settleTimer)
      settleTimer = null
    }
    settleToken += 1
  }

  /**
   * 松手后平滑滚到目标，再提交索引
   * @param {number} targetX 目标 dragX
   * @param {number | null} nextIndex 完成后索引；null 表示回弹
   */
  function settleTo(targetX, nextIndex) {
    const token = ++settleToken
    if (settleTimer != null) {
      window.clearTimeout(settleTimer)
      settleTimer = null
    }
    settling.value = true
    gesturing.value = false
    dragX.value = targetX
    closeY.value = 0

    const finish = () => {
      settleTimer = null
      if (token !== settleToken) {
        return
      }
      if (nextIndex == null) {
        settling.value = false
        dragX.value = 0
        return
      }
      commitIndex(nextIndex)
    }

    settleTimer = window.setTimeout(finish, 300)
  }

  /** 允许加载邻图（开始横滑或键盘切图时） */
  function enableNeighbors() {
    neighborsEnabled.value = true
  }

  /**
   * 边缘阻尼：到头时跟手变钝
   * @param {number} dx
   */
  function applyEdgeRubber(dx) {
    const list = toValue(urls)
    const atStart = index.value <= 0
    const atEnd = index.value >= list.length - 1
    if ((atStart && dx > 0) || (atEnd && dx < 0)) {
      return dx * 0.32
    }
    return dx
  }

  /**
   * 切换图片（按钮 / 键盘）
   * @param {number} delta
   */
  function go(delta) {
    if (settling.value) {
      return
    }
    enableNeighbors()
    // 放大态先还原再切
    if (zoomed.value) {
      resetTransform()
    }
    const list = toValue(urls)
    const next = index.value + delta
    if (next < 0 || next >= list.length) {
      return
    }
    const w = viewportW.value || window.innerWidth
    settleTo(delta > 0 ? -w : w, next)
  }

  onBeforeUnmount(() => {
    cleanupSettle()
  })

  return {
    index,
    scale,
    offsetX,
    offsetY,
    dragX,
    closeY,
    gesturing,
    settling,
    viewportW,
    neighborsEnabled,
    stageRef,
    zoomed,
    trackStyleFixed,
    slideWidthStyle,
    currentImgStyle,
    measureViewport,
    resetTransform,
    commitIndex,
    settleTo,
    enableNeighbors,
    applyEdgeRubber,
    go,
    cleanupSettle,
    close,
  }
}
