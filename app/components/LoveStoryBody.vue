<!-- 「我们的故事」正文各区块（文案见 love-story-content） -->
<script setup>
import {
  LOVE_STORY_CARDS,
  LOVE_STORY_LETTER_LINES,
  LOVE_STORY_MESSAGES,
  LOVE_STORY_PLANS,
  LOVE_STORY_TIMELINE,
  LOVE_STORY_TITLE,
} from '~/utils/love-story-content.js'

defineProps({
  // 已在一起天数（上海日历）
  daysCount: { type: Number, required: true },
})

const titleChars = LOVE_STORY_TITLE.split('')
</script>

<template>
  <div class="love-story-body">
    <nav class="story-nav" aria-label="故事页导航">
      <NuxtLink to="/love" class="story-nav__link">← 返回婚纱照</NuxtLink>
      <NuxtLink to="/love/engagement" class="story-nav__link">订婚视频 →</NuxtLink>
    </nav>

    <header class="header">
      <h1 class="love-title">
        <span
          v-for="(char, i) in titleChars"
          :key="i"
          class="letter"
          :style="{ animationDelay: `${i * 0.1}s` }"
        >
          {{ char }}
        </span>
      </h1>
      <p class="subtitle">每一天都比昨天更爱你</p>
      <p class="love-counter">
        <span>爱你的第</span>
        <strong>{{ daysCount }}</strong>
        <span>天</span>
      </p>
    </header>

    <section class="love-expressions">
      <article
        v-for="(card, index) in LOVE_STORY_CARDS"
        :key="index"
        class="love-card"
        :style="{ animationDelay: `${index * 0.2}s` }"
      >
        <span class="icon">{{ card.icon }}</span>
        <h3>{{ card.title }}</h3>
        <p>{{ card.text }}</p>
      </article>
    </section>

    <section class="timeline-section">
      <h2 class="section-title">我们的故事</h2>
      <article
        v-for="(item, index) in LOVE_STORY_TIMELINE"
        :key="index"
        class="timeline-item"
        :style="{ animationDelay: `${index * 0.3}s` }"
      >
        <span class="marker">{{ item.icon }}</span>
        <div class="content">
          <h3>{{ item.title }}</h3>
          <time>{{ item.date }}</time>
          <p>{{ item.text }}</p>
        </div>
      </article>
    </section>

    <section class="love-messages">
      <h2 class="section-title">我想对你说</h2>
      <div class="grid">
        <article
          v-for="(msg, index) in LOVE_STORY_MESSAGES"
          :key="index"
          class="message-card"
          :style="{ animationDelay: `${index * 0.1}s` }"
        >
          <span class="icon">{{ msg.icon }}</span>
          <p>{{ msg.text }}</p>
        </article>
      </div>
    </section>

    <section class="future-plans">
      <h2 class="section-title">我们的未来</h2>
      <div class="grid">
        <article
          v-for="(plan, index) in LOVE_STORY_PLANS"
          :key="index"
          class="plan-card"
          :style="{ animationDelay: `${index * 0.2}s` }"
        >
          <span class="icon">{{ plan.icon }}</span>
          <h3>{{ plan.title }}</h3>
          <p>{{ plan.text }}</p>
        </article>
      </div>
    </section>

    <section class="love-letter">
      <h2>给朝新的情书</h2>
      <p
        v-for="(line, index) in LOVE_STORY_LETTER_LINES"
        :key="index"
        :style="{ animationDelay: `${index * 0.3}s` }"
      >
        {{ line }}
      </p>
    </section>
  </div>
</template>

<style scoped lang="scss">
.love-story-body {
  .story-nav {
    position: relative;
    z-index: 3;
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
    gap: 0.75rem;
    padding: 1rem 1.25rem 0;
    max-width: 960px;
    margin: 0 auto;

    &__link {
      font-size: 0.9rem;
      color: #e91e63;
      opacity: 0.85;

      &:hover {
        opacity: 1;
        text-decoration: underline;
      }
    }
  }

  .header {
    position: relative;
    z-index: 2;
    text-align: center;
    padding: 3.75rem 1.25rem 2.5rem;

    .love-title {
      font-size: 3rem;
      color: #e91e63;
      margin-bottom: 1.25rem;
      text-shadow: 2px 2px 4px rgba(233, 30, 99, 0.3);

      .letter {
        display: inline-block;
        animation: love-story-bounce 0.6s ease infinite;
      }
    }

    .subtitle {
      font-size: 1.2rem;
      color: #f06292;
      margin-bottom: 1.25rem;
    }

    .love-counter {
      color: #e91e63;
      font-size: 1.2rem;

      strong {
        font-size: 3rem;
        font-family: Georgia, 'Times New Roman', serif;
        margin: 0 0.3rem;
        background: linear-gradient(135deg, #e91e63, #f06292);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
      }
    }
  }

  .section-title {
    text-align: center;
    font-size: 2rem;
    color: #e91e63;
    margin-bottom: 2.5rem;

    &::after {
      content: '💕';
      display: block;
      margin-top: 0.625rem;
    }
  }

  .icon {
    display: block;
    font-size: 3rem;
    margin-bottom: 0.9375rem;
  }

  .love-expressions {
    position: relative;
    z-index: 2;
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 1.25rem;
    padding: 2.5rem 1.25rem;

    .love-card {
      background: white;
      border-radius: 1.25rem;
      padding: 1.875rem;
      text-align: center;
      box-shadow: 0 10px 30px rgba(233, 30, 99, 0.15);
      transition:
        transform 0.3s,
        box-shadow 0.3s;
      animation: love-story-fade-in-up 0.6s ease forwards;
      opacity: 0;

      &:hover {
        transform: translateY(-10px);
        box-shadow: 0 20px 40px rgba(233, 30, 99, 0.25);
      }

      h3 {
        color: #e91e63;
        margin-bottom: 0.625rem;
        font-size: 1.3rem;
      }

      p {
        color: #666;
        line-height: 1.6;
      }
    }
  }

  .timeline-section {
    position: relative;
    z-index: 2;
    padding: 3.75rem 1.25rem;

    .timeline-item {
      position: relative;
      display: flex;
      gap: 1.25rem;
      margin-bottom: 1.875rem;
      animation: love-story-fade-in-up 0.6s ease forwards;
      opacity: 0;

      .marker {
        flex-shrink: 0;
        width: 50px;
        height: 50px;
        background: white;
        border: 3px solid #e91e63;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 1.5rem;
      }

      .content {
        flex: 1;
        background: white;
        padding: 1.5rem;
        border-radius: 0.9375rem;
        box-shadow: 0 5px 20px rgba(0, 0, 0, 0.1);

        h3 {
          color: #e91e63;
          margin-bottom: 0.5rem;
        }

        time {
          display: block;
          color: #999;
          font-size: 0.9rem;
          margin-bottom: 0.625rem;
        }

        p {
          color: #555;
          line-height: 1.8;
        }
      }
    }
  }

  .love-messages {
    position: relative;
    z-index: 2;
    padding: 3.75rem 1.25rem;

    .grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1.25rem;
    }

    .message-card {
      background: white;
      border-radius: 0.9375rem;
      padding: 1.25rem;
      text-align: center;
      box-shadow: 0 5px 20px rgba(233, 30, 99, 0.1);
      transition: transform 0.3s;
      animation: love-story-fade-in-up 0.6s ease forwards;
      opacity: 0;

      &:hover {
        transform: scale(1.05);
      }

      .icon {
        font-size: 2rem;
        margin-bottom: 0.625rem;
      }

      p {
        color: #555;
        line-height: 1.5;
      }
    }
  }

  .future-plans {
    position: relative;
    z-index: 2;
    padding: 3.75rem 1.25rem;

    .grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 1.5rem;
    }

    .plan-card {
      background: linear-gradient(135deg, #fff 0%, #fff5f8 100%);
      border-radius: 1.25rem;
      padding: 1.875rem;
      text-align: center;
      box-shadow: 0 10px 30px rgba(233, 30, 99, 0.1);
      border: 2px solid #fce4ec;
      transition:
        transform 0.3s,
        box-shadow 0.3s;
      animation: love-story-fade-in-up 0.6s ease forwards;
      opacity: 0;

      &:hover {
        transform: translateY(-5px);
        box-shadow: 0 15px 40px rgba(233, 30, 99, 0.2);
        border-color: #f48fb1;
      }

      h3 {
        color: #e91e63;
        margin-bottom: 0.625rem;
      }

      p {
        color: #666;
        line-height: 1.6;
      }
    }
  }

  .love-letter {
    position: relative;
    z-index: 2;
    max-width: 800px;
    margin: 3.75rem auto;
    background: linear-gradient(135deg, #fff9c4 0%, #fff59d 100%);
    padding: 2.5rem;
    border-radius: 1.25rem;
    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
    transform: rotate(-1deg);

    h2 {
      text-align: center;
      color: #e91e63;
      margin-bottom: 1.875rem;
      font-size: 1.8rem;

      &::before {
        content: '💌 ';
      }

      &::after {
        content: ' 💌';
      }
    }

    p {
      color: #555;
      line-height: 2;
      margin-bottom: 0.9375rem;
      font-size: 1.1rem;
      animation: love-story-fade-in-up 0.6s ease forwards;
      opacity: 0;

      &:last-child {
        font-weight: bold;
        color: #e91e63;
        text-align: center;
        font-size: 1.2rem;
      }
    }
  }

  @media (max-width: 768px) {
    .header {
      padding-top: 2.5rem;

      .love-title {
        font-size: 2rem;
      }

      .love-counter strong {
        font-size: 2.25rem;
      }
    }

    .section-title {
      font-size: 1.5rem;
    }

    .love-expressions,
    .future-plans .grid {
      grid-template-columns: 1fr;
    }

    .love-letter {
      padding: 1.5rem;
      margin: 2.5rem 0.9375rem;
      transform: none;
    }
  }
}

@keyframes love-story-bounce {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-10px);
  }
}

@keyframes love-story-fade-in-up {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
