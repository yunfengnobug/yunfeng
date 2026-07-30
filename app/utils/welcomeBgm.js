/**
 * 「我们」页欢迎背景音乐（模块单例；离开 /love* 时释放 Audio）
 */

/** @type {HTMLAudioElement | null} */
let welcomeBgm = null

// 七牛 CDN 背景音乐
const BGM_SRC = 'https://img.yzre.cn/2026/07/video/marry.ogg'

/**
 * 获取或创建唯一 Audio 实例（预加载与播放共用）
 * @returns {HTMLAudioElement | null}
 */
function ensureWelcomeBgm() {
  if (!import.meta.client) return null
  if (!welcomeBgm) {
    welcomeBgm = new Audio()
    welcomeBgm.preload = 'auto'
    welcomeBgm.loop = true
    // 背景音量，避免盖过人声/操作
    welcomeBgm.volume = 0.65
    welcomeBgm.src = BGM_SRC
  }
  return welcomeBgm
}

// 预加载，点击后更快起播（复用同一实例，不另建孤立 Audio）
export function preloadWelcomeBgm() {
  ensureWelcomeBgm()
}

// 播放背景音乐（需用户手势，满足浏览器自动播放策略）
export function playWelcomeBgm() {
  const audio = ensureWelcomeBgm()
  if (!audio) return
  audio.play().catch(() => {})
}

// 停止并释放 Audio，离开「我们」相关页时调用
export function stopWelcomeBgm() {
  if (!welcomeBgm) return
  const audio = welcomeBgm
  welcomeBgm = null
  audio.pause()
  audio.currentTime = 0
  // 断开资源，便于 GC；再 load 清空缓冲
  audio.removeAttribute('src')
  audio.load()
}
