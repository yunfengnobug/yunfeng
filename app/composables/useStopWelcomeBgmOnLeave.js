import { stopWelcomeBgm } from '~/utils/welcomeBgm.js'

// 离开「我们」相关路由（/love*）时停止欢迎背景音乐
export function useStopWelcomeBgmOnLeave() {
  onBeforeRouteLeave((to) => {
    if (!String(to.path || '').startsWith('/love')) {
      stopWelcomeBgm()
    }
  })
}
