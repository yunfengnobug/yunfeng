<template>
  <div class="note-detail-page">
    <div v-if="!note" class="empty-state">
      <p>未找到随笔内容</p>
      <button type="button" class="btn btn--primary" @click="goBack">返回列表</button>
    </div>

    <article v-else class="note-detail">
      <nav class="back-button">
        <button type="button" class="btn" @click="goBack">← 返回列表</button>
      </nav>

      <header class="note-header">
        <h1 class="note-title">{{ note.title }}</h1>

        <div class="note-meta">
          <span class="author">作者 {{ note.author }}</span>
          <time class="date" :datetime="note.published_at">
            {{ formatDate(note.published_at) }}
          </time>
          <div v-if="note.tags" class="tags">
            <span v-for="tag in splitTags(note.tags)" :key="tag" class="tag">
              {{ tag }}
            </span>
          </div>
        </div>
      </header>

      <hr class="divider" />

      <div class="note-content" v-html="note.content" />

      <footer class="note-footer">
        <p class="created-time">
          创建于
          <time :datetime="note.created_at">{{ formatDate(note.created_at) }}</time>
        </p>
        <p v-if="note.updated_at !== note.created_at" class="updated-time">
          更新于
          <time :datetime="note.updated_at">{{ formatDate(note.updated_at) }}</time>
        </p>
      </footer>
    </article>
  </div>
</template>

<script setup>
// 随笔详情页：根据路由 id 读取共享假数据

import { getNoteById, splitTags } from '#shared/notes'

const route = useRoute()
const router = useRouter()

const { data: note } = await useAsyncData(`note-${route.params.id}`, () =>
  Promise.resolve(getNoteById(route.params.id)),
)

useSeoMeta({
  title: () => (note.value ? `${note.value.title} - 云枫随笔` : '随笔详情 - 云枫'),
  description: () => note.value?.summary || '云枫随笔详情',
})

// 返回随笔列表
function goBack() {
  router.push('/notes')
}
</script>

<style lang="scss" scoped>
.empty-state {
  text-align: center;
  padding: 3.75rem 1.25rem;
  background: white;
  border-radius: 0.5rem;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);

  p {
    font-size: 1.1rem;
    color: #999;
    margin-bottom: 1.25rem;
  }
}

.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 44px;
  padding: 0.5rem 1rem;
  border: 1px solid #d9d9d9;
  border-radius: 0.375rem;
  background: #fff;
  color: #333;
  font-size: 0.875rem;
  cursor: pointer;
  transition:
    color 0.2s,
    border-color 0.2s,
    background 0.2s;

  &:hover {
    color: #1890ff;
    border-color: #1890ff;
  }

  &--primary {
    background: #1890ff;
    border-color: #1890ff;
    color: #fff;

    &:hover {
      background: #4096ff;
      border-color: #4096ff;
      color: #fff;
    }
  }
}

.note-detail {
  background: white;
  border-radius: 0.5rem;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  padding: 1.5rem;

  .back-button {
    margin-bottom: 1.25rem;
  }

  .note-header {
    .note-title {
      font-size: 1.8rem;
      font-weight: 600;
      color: #333;
      margin-bottom: 0.9375rem;
    }

    .note-meta {
      margin-bottom: 1.25rem;
      color: #666;
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem 1.25rem;
      align-items: center;

      .author,
      .date {
        font-size: 0.9rem;
      }

      .tags {
        display: flex;
        flex-wrap: wrap;
        gap: 0.5rem;
        width: 100%;
      }
    }
  }

  .divider {
    border: none;
    height: 1px;
    background-color: #eee;
    margin: 1.25rem 0;
  }

  .note-content {
    margin: 1.875rem 0;
    font-size: 1.05rem;
    line-height: 1.8;
    color: #333;

    :deep(p) {
      margin-bottom: 1em;
    }

    :deep(img) {
      max-width: 100%;
      border-radius: 0.25rem;
      margin: 0.625rem 0;
    }

    :deep(a) {
      color: #1890ff;

      &:hover {
        text-decoration: underline;
      }
    }

    :deep(h1),
    :deep(h2),
    :deep(h3),
    :deep(h4),
    :deep(h5),
    :deep(h6) {
      margin-top: 1.5em;
      margin-bottom: 0.5em;
      font-weight: 600;
      color: #222;
    }

    :deep(blockquote) {
      border-left: 4px solid #ddd;
      padding-left: 0.9375rem;
      color: #666;
      font-style: italic;
      margin: 1em 0;
    }

    :deep(ul),
    :deep(ol) {
      padding-left: 2em;
      margin: 1em 0;
      list-style: initial;
    }

    :deep(code) {
      background-color: #f5f5f5;
      border-radius: 3px;
      font-family: Consolas, Monaco, 'Andale Mono', monospace;
      padding: 0.2em 0.4em;
      margin: 0 0.2em;
    }

    :deep(pre) {
      background-color: #f5f5f5;
      border-radius: 0.25rem;
      padding: 1em;
      overflow-x: auto;

      code {
        background-color: transparent;
        padding: 0;
        margin: 0;
      }
    }
  }

  .note-footer {
    margin-top: 2.5rem;
    padding-top: 1.25rem;
    border-top: 1px solid #eee;
    color: #999;
    font-size: 0.85rem;
    text-align: right;

    p {
      margin-bottom: 0.3rem;
    }
  }
}

.tag {
  display: inline-block;
  padding: 0.15rem 0.5rem;
  border-radius: 0.25rem;
  font-size: 0.75rem;
  background: #e6f4ff;
  color: #0958d9;
  border: 1px solid #91caff;
}

@media (max-width: 768px) {
  .note-detail {
    padding: 1rem;

    .note-header .note-title {
      font-size: 1.4rem;
    }

    .note-header .note-meta {
      flex-direction: column;
      align-items: flex-start;
      gap: 0.35rem;
    }
  }
}
</style>
