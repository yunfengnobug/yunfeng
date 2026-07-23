<template>
  <div class="love-container">
    <LoveHearts />

    <nav class="story-nav" aria-label="返回婚纱照">
      <NuxtLink to="/love" class="story-nav__link">← 返回婚纱照</NuxtLink>
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
        v-for="(card, index) in loveCards"
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
        v-for="(item, index) in timelineItems"
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
          v-for="(msg, index) in messages"
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
          v-for="(plan, index) in futurePlans"
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
        v-for="(line, index) in letterLines"
        :key="index"
        :style="{ animationDelay: `${index * 0.3}s` }"
      >
        {{ line }}
      </p>
    </section>
  </div>
</template>

<script setup>
// 「我们的故事」纪念页（由原 /love 迁入）；随机爱心由客户端组件承载

definePageMeta({
  // 去掉内容区内边距，全宽沉浸展示
  contentPadding: 0,
})

useSeoMeta({
  title: '我们的故事',
  description: '王俊杰与李朝新的纪念页',
})

const titleChars = '李朝新，我爱你'.split('')

// 在一起起始日（UTC），保证 SSR/CSR 同一天计算结果一致
const START_UTC = Date.UTC(2025, 5, 20)

// 计算已在一起的天数
function calcDaysCount() {
  const diff = Date.now() - START_UTC
  return Math.max(0, Math.floor(diff / (1000 * 60 * 60 * 24)))
}

const daysCount = ref(calcDaysCount())

onMounted(() => {
  // 客户端再校准一次，避免跨请求边界的极小偏差
  daysCount.value = calcDaysCount()
})

const loveCards = [
  { icon: '😊', title: '你的笑容', text: '如春风般温暖，如阳光般灿烂，是我心中最美的风景' },
  { icon: '🎵', title: '你的声音', text: '如天籁般动听，如清泉般甘甜，是我最爱的旋律' },
  { icon: '👀', title: '你的眼睛', text: '如星辰般闪亮，如大海般深邃，是我永远的港湾' },
  { icon: '🤗', title: '你的拥抱', text: '如暖阳般温暖，如港湾般安全，是我最渴望的归宿，想抱抱' },
  { icon: '🌙', title: '你的温柔', text: '如月光般柔和，如丝绸般细腻，是我最珍贵的宝藏' },
  { icon: '👧', title: '你的可爱', text: '软软糯糯的小脸，机智又可爱，让人想捏捏' },
]

const timelineItems = [
  {
    icon: '🌅',
    title: '我们在一起了',
    date: '2025年6月20日',
    text: '那天红玫瑰飘香，现在想来都是甜蜜。你的手那么柔软，那么温暖，牵着你的手，我感觉拥有了整个世界。',
  },
]

const messages = [
  { icon: '✨', text: '你是我生命中最美好的意外' },
  { icon: '🍀', text: '遇见你是我最大的幸运' },
  { icon: '😊', text: '你的笑容是我最大的幸福' },
  { icon: '👴👵', text: '我想和你一起变老' },
  { icon: '👸', text: '你是我心中永远的公主' },
  { icon: '💝', text: '我爱你胜过爱自己' },
  { icon: '🚀', text: '你是我前进的动力' },
  { icon: '🍯', text: '愿我们的爱情永远甜蜜' },
  { icon: '⭐', text: '你是我心中最亮的星' },
  { icon: '🏠', text: '我想给你最好的生活' },
  { icon: '💎', text: '你是我最珍贵的宝贝' },
  { icon: '🌟', text: '愿我们的爱情如星辰般永恒' },
]

const futurePlans = [
  { icon: '🌍', title: '环游世界', text: '和你一起看遍世界各地的美景，留下我们美好的回忆' },
  { icon: '🏡', title: '温馨的家', text: '建造一个属于我们的小窝，充满爱和温暖' },
  { icon: '🐕', title: '养一只宠物', text: '一起照顾我们的小宝贝，体验做父母的快乐' },
  { icon: '📚', title: '学习新技能', text: '一起成长，一起进步，成为更好的自己' },
  { icon: '🏃‍♀️', title: '健康生活', text: '一起运动，一起养生，拥有健康的身体' },
  { icon: '💒', title: '浪漫的婚礼', text: '在亲朋好友的见证下，许下我们一生的承诺' },
]

const letterLines = [
  '亲爱的朝新，遇见你是我生命中最美好的奇迹。',
  '你的笑容如阳光般温暖，你的声音如天籁般动听。',
  '我想和你一起看遍世间美景，一起走过每一个春夏秋冬。',
  '愿我们的爱情如星辰般永恒，如大海般深邃。',
  '我爱你，李朝新！',
  '愿我们的爱情故事永远继续下去，直到永远。',
  '"下辈子，我们还在一起。"上辈子，我们也是这么说的。',
]
</script>

<style scoped lang="scss">
.love-container {
  position: relative;
  min-height: 100vh;
  background: linear-gradient(135deg, #fff5f5 0%, #ffe4ec 50%, #ffd6e7 100%);
  overflow: hidden;

  .story-nav {
    position: relative;
    z-index: 3;
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
        animation: bounce 0.6s ease infinite;
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
      animation: fadeInUp 0.6s ease forwards;
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
      animation: fadeInUp 0.6s ease forwards;
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
      animation: fadeInUp 0.6s ease forwards;
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
      animation: fadeInUp 0.6s ease forwards;
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
      animation: fadeInUp 0.6s ease forwards;
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

@keyframes bounce {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-10px);
  }
}

@keyframes fadeInUp {
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
