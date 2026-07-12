# 云枫

个人网站，基于 Vue 3 + Nuxt 4（SSR），纯 JavaScript。

## 技术栈

- Vue 3 + Nuxt 4 + Pinia
- SCSS（scoped + 全局样式）
- pnpm 10
- oxfmt + oxlint

## 功能页面

| 路径         | 说明     |
| ------------ | -------- |
| `/`          | 首页一言 |
| `/about`     | 关于     |
| `/love`      | 我们     |
| `/notes`     | 随笔列表 |
| `/notes/:id` | 随笔详情 |
| `/changelog` | 更新日志 |

## 环境要求

- Node.js 20+
- pnpm 10

## 安装与启动

```bash
pnpm install
pnpm dev
```

## 常用脚本

```bash
pnpm build          # 生产构建
pnpm preview        # 预览构建产物
pnpm format         # oxfmt 格式化
pnpm format:check   # 仅检查格式
pnpm lint           # oxlint
```

## 目录说明

```
app/           # Nuxt 应用（页面、布局、组件、样式）
server/api/    # Nitro API（如一言代理）
shared/        # 前后端可共享数据（可选）
nuxt.config.js
```

## 说明

- 默认开启 SSR；涉及随机动画或浏览器 API 的部分使用客户端组件 / `ClientOnly`
- 不强制 Element Plus；前台以原生控件 + SCSS 为主
