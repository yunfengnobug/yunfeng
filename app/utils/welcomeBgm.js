/**
 * 「我们」页欢迎背景音乐（模块单例，遮罩卸载后仍可继续播）
 */

/** @type {HTMLAudioElement | null} */
let welcomeBgm = null

// 七牛 CDN 背景音乐
const BGM_SRC = 'https://img.yzre.cn/2026/07/video/marry.ogg'

// 预加载，点击后更快起播
export function preloadWelcomeBgm() {
  if (!import.meta.client) return
  const preloadAudio = new Audio()
  preloadAudio.preload = 'auto'
  preloadAudio.src = BGM_SRC
}

// 播放背景音乐（需用户手势，满足浏览器自动播放策略）
export function playWelcomeBgm() {
  if (!import.meta.client) return
  if (!welcomeBgm) {
    welcomeBgm = new Audio(BGM_SRC)
    welcomeBgm.loop = true
    // 背景音量，避免盖过人声/操作
    welcomeBgm.volume = 0.65
  }
  welcomeBgm.play().catch(() => {})
}

// 停止并复位，离开「我们」相关页时调用
export function stopWelcomeBgm() {
  if (!welcomeBgm) return
  welcomeBgm.pause()
  welcomeBgm.currentTime = 0
}
