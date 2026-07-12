<template>
  <div class="notes-page">
    <header class="page-header">
      <h1 class="page-title">云枫随笔</h1>
      <p class="page-subtitle">记录点滴思考，分享个人感悟</p>
    </header>

    <div v-if="notes.length === 0" class="empty-state">
      <p>暂无随笔内容</p>
    </div>

    <div v-else class="notes-list">
      <article
        v-for="note in notes"
        :key="note.id"
        class="note-card"
        role="link"
        tabindex="0"
        @click="goToNoteDetail(note.id)"
        @keydown.enter="goToNoteDetail(note.id)"
      >
        <h2 class="note-title">{{ note.title }}</h2>

        <div class="note-meta">
          <span class="author">{{ note.author }}</span>
          <time class="date" :datetime="note.published_at">
            {{ formatDate(note.published_at) }}
          </time>
        </div>

        <p class="note-content">{{ note.summary }}</p>

        <div v-if="note.tags" class="note-tags">
          <span v-for="tag in splitTags(note.tags)" :key="tag" class="tag">
            {{ tag }}
          </span>
        </div>
      </article>
    </div>
  </div>
</template>

<script setup>
// 随笔列表页

import { NOTES, splitTags } from '#shared/notes'

useSeoMeta({
  title: '云枫随笔 - 云枫',
  description: '云枫随笔列表',
})

const notes = NOTES
const router = useRouter()

// 进入随笔详情
function goToNoteDetail(id) {
  router.push(`/notes/${id}`)
}
</script>

<style lang="scss" scoped>
.page-header {
  text-align: center;
  margin-bottom: 1.875rem;

  .page-title {
    font-size: 2rem;
    color: #333;
    margin-bottom: 0.625rem;
  }

  .page-subtitle {
    font-size: 1rem;
    color: #666;
  }
}

.empty-state {
  text-align: center;
  padding: 2.5rem;
  background: white;
  border-radius: 0.5rem;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);

  p {
    font-size: 1.1rem;
    color: #999;
  }
}

.notes-list {
  .note-card {
    margin-bottom: 1.25rem;
    padding: 1.25rem;
    background: white;
    border-radius: 0.5rem;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
    cursor: pointer;
    transition:
      transform 0.2s,
      box-shadow 0.2s;

    &:hover,
    &:focus-visible {
      transform: translateY(-3px);
      box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
      outline: none;
    }

    .note-title {
      font-size: 1.3rem;
      font-weight: 500;
      color: #333;
      margin: 0 0 0.625rem 0;
    }

    .note-meta {
      margin: 0.625rem 0;
      font-size: 0.9rem;
      color: #888;

      .author,
      .date {
        margin-right: 0.9375rem;
      }
    }

    .note-content {
      margin: 0.9375rem 0;
      color: #555;
      line-height: 1.6;
    }

    .note-tags {
      margin-top: 0.9375rem;
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
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
  .page-header .page-title {
    font-size: 1.6rem;
  }

  .notes-list .note-card .note-title {
    font-size: 1.15rem;
  }
}
</style>
