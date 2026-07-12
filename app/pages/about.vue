<template>
  <div class="about-page">
    <header class="page-header">
      <h1>关于我们</h1>
    </header>
    <p class="lead">
      任何时候，对自己、对他人，对一切事物都能有良好积极的认知和端正的三观，与君共勉。
    </p>

    <section class="author-section">
      <h2>关于作者 - 云枫</h2>
      <div class="author-info">
        <p>云枫，喜欢听音乐的00后白羊，流行 or 经典，只要好听，我都喜欢，戴上耳机，保持快乐。</p>
        <p>
          生活就是一种体验，有的人体验贫穷，有的人体验病痛，有的人体验挫折，在仅有一次的生命里，活出真正的自己。
        </p>
        <p>
          我喜欢秋天的小雨，喜欢春天的阳光，喜欢陌生的环境，自由的环境能让我感到很惬意；喜欢轻奢简约风格的舒心感，偶尔也会被典雅端庄所震撼。
        </p>
        <p>顺境使我快乐，逆境使我成长，蓦然回首，一路走来，所过之处皆风景！</p>
      </div>
    </section>

    <section class="love-section">
      <h2>关于爱情</h2>
      <div class="love-info">
        <p>男人至死是少年，少年至死是浪漫，浪漫至死是爱情。</p>
        <p>
          期待的爱情：理解、支持、互相成就、平淡而温馨，如清晨的阳光和微风，令人感到舒适而温暖。对于不喜欢的人，是没有想要接近的欲望的。
        </p>
        <p>...</p>
        <p>
          终于，我等到了你，
          <NuxtLink to="/love" class="love-link">我的新宝儿。</NuxtLink>
        </p>
      </div>
    </section>

    <section class="website-section">
      <h2>关于网站</h2>
      <div class="website-info">
        <p>
          创建本站的目的：给自己找点事做，看着自己的网站慢慢变得更好、更完善，是一件很有成就感的事情。这就像我的绘画板，在这里可以我想做什么就做什么，没有限制，没有束缚，没有压力，没有烦恼。可能一日一更，也可能一周一更，也可能一月一更，也可能好久才更，没有deadline，但我会坚持下去，日益变好，有朝一日，也会枝繁叶茂，成为自己的骄傲。
        </p>
        <p>
          记录心情的地方，在这里，没有人认识我，不用担心深夜 emo
          发个朋友圈都得分组可见，我可以放肆做自己，做最真实的自己。
        </p>
      </div>
    </section>

    <section class="contact-section">
      <h2>联系方式</h2>
      <div class="contact-info">
        <p>欢迎对本网站提出改进意见（不建议深夜打扰）：</p>
        <ul class="contact-list">
          <li>QQ: 1768669274</li>
          <li>WeChat: 同QQ</li>
          <li>
            Email:
            <a href="mailto:ceo@yzre.cn">ceo@yzre.cn</a>
          </li>
        </ul>
      </div>
    </section>
  </div>
</template>

<script setup>
// 关于页：作者、爱情、网站与联系方式

useSeoMeta({
  title: '关于我们 - 云枫',
  description: '关于云枫、爱情、本站与联系方式',
})
</script>

<style lang="scss" scoped>
.page-header {
  text-align: center;
  margin-bottom: 2.5rem;

  h1 {
    color: #333;
    margin-bottom: 0.75rem;
    font-size: 2rem;
  }
}

.lead {
  color: #555;
  line-height: 1.6;
  margin-bottom: 2rem;
}

section {
  margin-bottom: 2.5rem;

  h2 {
    color: #444;
    margin-bottom: 1.25rem;
    font-size: 1.5rem;
    border-bottom: 2px solid #eee;
    padding-bottom: 0.625rem;
  }
}

.author-info,
.website-info,
.contact-info,
.love-info {
  color: #555;
  line-height: 1.6;

  p {
    margin-bottom: 0.9375rem;
  }

  ul {
    list-style-type: disc;
    margin-left: 1.25rem;

    li {
      margin-bottom: 0.625rem;
    }
  }

  a,
  .love-link {
    color: #4a90e2;
    transition: color 0.3s;
    cursor: pointer;

    &:hover {
      color: #357abd;
      text-decoration: underline;
    }
  }

  .contact-list {
    color: #000;
    font-weight: 500;
  }
}

@media (max-width: 768px) {
  .page-header h1 {
    font-size: 1.6rem;
  }

  section h2 {
    font-size: 1.25rem;
  }
}
</style>
