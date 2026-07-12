<template>
  <div class="changelog-page">
    <header class="page-header">
      <h1>更新日志</h1>
      <p class="introduction">记录网站成长的点滴历程</p>
    </header>

    <div v-if="sortedLogs.length === 0" class="empty-state">暂无更新日志</div>

    <div v-else class="timeline-list">
      <article v-for="log in sortedLogs" :key="log.id" class="changelog-card">
        <header class="card-header">
          <span class="tag" :class="`tag--${log.status}`">{{ log.version }}</span>
          <time class="release-date" :datetime="log.date">{{ log.date }}</time>
          <span class="tag tag--status" :class="`tag--${log.status}`">{{ log.status }}</span>
        </header>
        <h2 class="card-title">{{ log.title }}</h2>
        <ul class="change-list">
          <li v-for="(item, itemIndex) in log.items" :key="itemIndex">
            {{ item }}
          </li>
        </ul>
        <footer v-if="log.creator_name" class="creator-info">
          <span>发布者: {{ log.creator_name }}</span>
        </footer>
      </article>
    </div>
  </div>
</template>

<script setup>
// 更新日志页：本地静态数据时间线

useSeoMeta({
  description: '网站更新日志',
})

const changelogData = [
  {
    id: 1,
    version: 'v1.2.0',
    title: '功能增强与性能优化',
    date: '2025-01-20',
    items: ['新增随笔详情页面', '优化页面加载性能', '修复移动端布局问题', '更新依赖包版本'],
    status: 'stable',
    creator_name: '云枫',
  },
  {
    id: 2,
    version: 'v1.1.0',
    title: '新增更新日志功能',
    date: '2025-01-15',
    items: ['新增更新日志页面', '添加时间线展示效果', '支持版本状态标签'],
    status: 'stable',
    creator_name: '云枫',
  },
  {
    id: 3,
    version: 'v1.0.0',
    title: '项目初始版本',
    date: '2025-01-10',
    items: [
      '完成基础页面框架搭建',
      '实现首页一言展示功能',
      '添加随笔列表页面',
      '基于 Nuxt 4 完成站点迁移与 SSR',
    ],
    status: 'stable',
    creator_name: '云枫',
  },
  {
    id: 4,
    version: 'v1.3.0-beta',
    title: '即将推出的功能',
    date: '2025-01-25',
    items: ['用户登录系统', '评论功能', '搜索功能优化'],
    status: 'beta',
    creator_name: '云枫',
  },
]

// 按日期倒序
const sortedLogs = computed(() =>
  [...changelogData].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
)
</script>

<style lang="scss" scoped>
.page-header {
  text-align: center;
  margin-bottom: 2.5rem;

  h1 {
    color: #333;
    margin-bottom: 0.625rem;
    font-size: 2rem;
  }

  .introduction {
    color: #666;
    font-size: 1rem;
  }
}

.empty-state {
  text-align: center;
  padding: 2.5rem;
  color: #999;
  font-size: 1.1rem;
}

.timeline-list {
  margin-top: 1.875rem;

  .changelog-card {
    position: relative;
    padding: 1.25rem;
    margin-bottom: 1.25rem;
    background: #fafafa;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
    border-radius: 0.5rem;
    border-left: 3px solid #1890ff;
    transition: transform 0.3s;

    &:hover {
      transform: translateY(-2px);
    }

    .card-header {
      display: flex;
      align-items: center;
      flex-wrap: wrap;
      gap: 0.625rem;
      margin-bottom: 0.625rem;

      .release-date {
        font-size: 0.9rem;
        color: #888;
      }

      .tag--status {
        margin-left: auto;
        font-size: 0.75rem;
      }
    }

    .card-title {
      font-size: 1.3rem;
      font-weight: 500;
      color: #333;
      margin: 0 0 0.9375rem 0;
    }

    .change-list {
      list-style-type: disc;
      padding-left: 1.25rem;
      margin: 0;

      li {
        margin-bottom: 0.5rem;
        color: #555;
        line-height: 1.5;

        &:last-child {
          margin-bottom: 0;
        }
      }
    }

    .creator-info {
      margin-top: 0.9375rem;
      font-size: 0.85rem;
      text-align: right;
      color: #888;
    }
  }
}

.tag {
  display: inline-block;
  padding: 0.15rem 0.5rem;
  border-radius: 0.25rem;
  font-size: 0.8125rem;
  font-weight: 500;
  line-height: 1.4;

  &--stable {
    background: #f6ffed;
    color: #389e0d;
    border: 1px solid #b7eb8f;
  }

  &--beta {
    background: #e6f4ff;
    color: #0958d9;
    border: 1px solid #91caff;
  }

  &--alpha {
    background: #fff7e6;
    color: #d46b08;
    border: 1px solid #ffd591;
  }
}

@media (max-width: 768px) {
  .page-header h1 {
    font-size: 1.6rem;
  }

  .timeline-list .changelog-card {
    padding: 0.9375rem;

    .card-title {
      font-size: 1.15rem;
    }
  }
}
</style>
