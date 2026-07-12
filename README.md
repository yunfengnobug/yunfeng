# 王俊杰 ❤️ 李朝新

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

局域网访问：

```bash
pnpm dev --host
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

- 站点名称：`王俊杰 ❤️ 李朝新`（见 `app/utils/site.js`）
- 默认开启 SSR；涉及随机动画或浏览器 API 的部分使用客户端组件 / `ClientOnly`
- 不强制 Element Plus；前台以原生控件 + SCSS 为主
- **包管理仅允许 pnpm**（`packageManager` + `only-allow` + `.npmrc`）

## 部署（GitHub Actions + PM2）

推送到 `main` 会触发 `.github/workflows/deploy.yml`：CI 用 pnpm 构建 Nuxt，将 `.output/` **内容**同步到 **`/server/yunfeng`**（路径写死在 workflow，非 Secret），再 `pm2 reload`。线上端口固定 **3001**（`ecosystem.config.cjs`）。

服务器目录示例：

```
/server/yunfeng/
  server/index.mjs   # Nitro 入口
  public/
  ecosystem.config.cjs
  logs/
```

### GitHub Secrets（Settings → Secrets and variables → Actions）

| Secret 名 | 是否必填 | 说明 |
|-----------|----------|------|
| `HOST` | 是 | 服务器 IP 或域名 |
| `USER` | 是 | SSH 登录用户名 |
| `SSH_KEY` | 是 | 部署用私钥全文（含 `BEGIN`/`END`） |
| `NOTIFYX_KEY` | 建议 | NotifyX 发送密钥；CI 构建时注入为 `NUXT_NOTIFYX_KEY` |
| `ENV_PRODUCTION_YUNFENG` | 否 | 其它构建用环境变量（多行 `KEY=value`） |

> 部署目录固定为 `/server/yunfeng`，无需再配置 `DEPLOY_PATH`。

### 建议反馈（NotifyX）

关于页表单 → `POST /api/feedback` → 服务端调用 NotifyX。密钥不会下发到浏览器。

**生产环境：** 仓库 Settings → Secrets and variables → Actions → New repository secret：

- Name：`NOTIFYX_KEY`
- Secret：粘贴 NotifyX 后台的 key（只要密钥本身，不要写 `NUXT_NOTIFYX_KEY=`）

**本地开发：** 在 `.env` 中配置：

```env
NUXT_NOTIFYX_KEY=你的NotifyX密钥
```

### 服务器准备

1. 已安装 Node.js 20+、**PM2**（运行时只需同步后的 `server/` + `public/`，不必在服务器再装项目依赖）
2. 部署用户对 `/server/yunfeng` 有写权限，且能执行 `pm2`
3. 首次可手动：`mkdir -p /server/yunfeng`，等 Actions 推完后再确认 `pm2 list` 中有 `yunfeng`
4. Nginx（或其它网关）反代到 `127.0.0.1:3001`
