<template>
  <div class="app-layout">
    <header class="app-navbar">
      <nav class="navbar-content" aria-label="主导航">
        <div class="logo">
          <NuxtLink to="/">{{ SITE_NAME }}</NuxtLink>
        </div>
        <ul class="nav-links">
          <li>
            <NuxtLink to="/">首页</NuxtLink>
          </li>
          <li>
            <NuxtLink to="/about">关于</NuxtLink>
          </li>
          <li>
            <NuxtLink to="/love">我们</NuxtLink>
          </li>
        </ul>
      </nav>
    </header>

    <main class="app-content" :style="{ padding: contentPadding }">
      <slot />
    </main>

    <footer class="app-footer">
      <p class="app-footer__copy">&copy; {{ currentYear }} {{ SITE_NAME }} - 版权所有</p>
      <a
        class="app-footer__beian"
        href="https://beian.miit.gov.cn/"
        target="_blank"
        rel="noopener noreferrer"
      >
        豫ICP备2023005087号-3
      </a>
    </footer>
  </div>
</template>

<script setup>
// 站点默认布局：顶栏导航 + 内容区 + 页脚

const route = useRoute()

// 页脚年份（SSR/CSR 同年份一致，跨年瞬间差异可忽略）
const currentYear = new Date().getFullYear()

// 内容区 padding；页面可通过 definePageMeta({ contentPadding }) 覆盖
const contentPadding = computed(() => {
  if ('contentPadding' in route.meta) {
    return route.meta.contentPadding
  }
  return '40px 20px 60px'
})
</script>

<style lang="scss" scoped>
@use '~/assets/styles/variables.scss' as *;

.app-layout {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.app-navbar {
  position: sticky;
  top: 0;
  z-index: 100;
  background-color: #ffffff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);

  .navbar-content {
    max-width: $content-max-width;
    margin: 0 auto;
    padding: 0 1.25rem;
    height: $navbar-height;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
  }

  .logo {
    font-size: 1.125rem;
    font-weight: bold;
    flex-shrink: 1;
    min-width: 0;
    line-height: 1.3;

    a {
      color: $color-primary;
      display: inline-block;
      word-break: keep-all;
    }
  }

  .nav-links {
    display: flex;
    flex-wrap: wrap;
    justify-content: flex-end;
    gap: 0.25rem 0.75rem;
    margin: 0;
    padding: 0;

    a {
      color: $color-text;
      font-size: 0.875rem;
      padding: 0.5rem 0.25rem;
      transition: color 0.3s;
      display: inline-block;
      min-height: 44px;
      line-height: 28px;

      &:hover,
      &.router-link-active {
        color: $color-primary;
      }
    }
  }
}

.app-content {
  flex: 1;
  min-height: calc(100vh - #{$navbar-height} - #{$footer-height});
  max-width: $content-max-width;
  width: 100%;
  margin: 0 auto;
  box-sizing: border-box;
}

.app-footer {
  background-color: #f0f2f5;
  min-height: $footer-height;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.35rem;
  color: $color-text-secondary;
  font-size: 0.875rem;
  padding: 0.875rem 1rem;
  text-align: center;

  &__copy {
    margin: 0;
  }

  &__beian {
    color: $color-text-secondary;
    font-size: 0.8125rem;
    line-height: 1.4;
    transition: color 0.2s;

    &:hover {
      color: $color-primary;
    }
  }
}

@media (max-width: $bp-tablet) {
  .app-navbar {
    .logo {
      font-size: 0.9375rem;
    }

    .nav-links a {
      font-size: 0.8125rem;
    }
  }
}
</style>
