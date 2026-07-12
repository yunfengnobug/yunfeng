<template>
  <form class="feedback-form" @submit.prevent="onSubmit">
    <p class="feedback-form__hint">欢迎提出改进建议，提交后我们会尽快查看。</p>

    <label class="feedback-form__field">
      <span class="feedback-form__label">标题<span class="required">*</span></span>
      <input
        v-model.trim="title"
        type="text"
        name="title"
        maxlength="96"
        autocomplete="off"
        required
      />
    </label>

    <label class="feedback-form__field">
      <span class="feedback-form__label">内容<span class="required">*</span></span>
      <textarea
        v-model.trim="content"
        name="content"
        maxlength="2000"
        rows="6"
        placeholder="详细描述你的想法或遇到的问题"
        required
      />
    </label>

    <label class="feedback-form__field">
      <span class="feedback-form__label">联系方式（可选）</span>
      <input
        v-model.trim="contact"
        type="text"
        name="contact"
        maxlength="100"
        placeholder="用于联系您进行详细沟通（微信 / QQ / 邮箱等）"
        autocomplete="off"
      />
    </label>

    <p
      v-if="message"
      class="feedback-form__msg"
      :class="messageOk ? 'is-ok' : 'is-err'"
      role="status"
    >
      {{ message }}
    </p>

    <button type="submit" class="feedback-form__submit" :disabled="submitting">
      {{ submitting ? '提交中…' : '提交反馈' }}
    </button>
  </form>
</template>

<script setup>
// 关于页建议反馈表单：提交到本站 /api/feedback，由服务端转发 NotifyX

const title = ref('')
const content = ref('')
const contact = ref('')
const submitting = ref(false)
const message = ref('')
const messageOk = ref(false)

// 提交反馈
async function onSubmit() {
  if (submitting.value) return
  message.value = ''
  submitting.value = true
  try {
    const res = await $fetch('/api/feedback', {
      method: 'POST',
      body: {
        title: title.value,
        content: content.value,
        contact: contact.value || undefined,
      },
    })
    if (res?.code === 0) {
      messageOk.value = true
      message.value = res.message || '提交成功'
      title.value = ''
      content.value = ''
      contact.value = ''
    } else {
      messageOk.value = false
      message.value = res?.message || '提交失败'
    }
  } catch (error) {
    messageOk.value = false
    message.value = '网络异常，请稍后再试'
    console.error('feedback submit failed', error)
  } finally {
    submitting.value = false
  }
}
</script>

<style lang="scss" scoped>
.feedback-form {
  max-width: 40rem;

  &__hint {
    color: #555;
    line-height: 1.6;
    margin-bottom: 1.25rem;
  }

  &__field {
    display: flex;
    flex-direction: column;
    gap: 0.4rem;
    margin-bottom: 1rem;
  }

  &__label {
    font-size: 0.9rem;
    color: #444;
    font-weight: 500;

    .required {
      color: #e53935;
      margin-left: 0.15rem;
    }
  }

  input,
  textarea {
    width: 100%;
    padding: 0.75rem 0.875rem;
    border: 1px solid #d9d9d9;
    border-radius: 0.5rem;
    font: inherit;
    color: #333;
    background: #fff;
    transition: border-color 0.2s;

    &:focus {
      outline: none;
      border-color: #1890ff;
    }

    &::placeholder {
      color: #aaa;
    }
  }

  textarea {
    resize: vertical;
    min-height: 8rem;
    line-height: 1.6;
  }

  &__msg {
    margin: 0 0 1rem;
    font-size: 0.9rem;
    line-height: 1.5;

    &.is-ok {
      color: #389e0d;
    }

    &.is-err {
      color: #cf1322;
    }
  }

  &__submit {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-height: 44px;
    padding: 0.6rem 1.5rem;
    border: none;
    border-radius: 0.5rem;
    background: #1890ff;
    color: #fff;
    font-size: 0.95rem;
    cursor: pointer;
    transition: background 0.2s;

    &:hover:not(:disabled) {
      background: #4096ff;
    }

    &:disabled {
      opacity: 0.65;
      cursor: not-allowed;
    }
  }
}

@media (max-width: 768px) {
  .feedback-form {
    max-width: 100%;
  }
}
</style>
