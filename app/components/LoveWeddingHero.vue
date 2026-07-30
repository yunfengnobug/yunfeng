<!-- 婚纱照页顶栏：标题与故事入口 -->
<template>
  <header class="wedding-hero">
    <p class="wedding-hero__eyebrow">Wedding</p>
    <h1 class="wedding-hero__title">我们的婚纱照</h1>
    <p class="wedding-hero__subtitle">精修与初修，定格这一天</p>
    <NuxtLink to="/love/story" class="wedding-hero__story-link">我们的故事 →</NuxtLink>
  </header>
</template>

<style lang="scss" scoped>
.wedding-hero {
  text-align: center;
  padding: 3.5rem 1.25rem 2.5rem;

  &__eyebrow {
    margin: 0 0 0.5rem;
    font-size: 0.75rem;
    letter-spacing: 0.28em;
    text-transform: uppercase;
    color: #9a8578;
  }

  &__title {
    margin: 0 0 0.75rem;
    font-family: 'Georgia', 'Songti SC', 'SimSun', serif;
    font-size: clamp(1.8rem, 5vw, 2.6rem);
    font-weight: 500;
    letter-spacing: 0.08em;
    color: #2c2420;
  }

  &__subtitle {
    margin: 0 0 1.5rem;
    font-size: 0.95rem;
    color: #7a6a60;
  }

  &__story-link {
    display: inline-block;
    font-size: 0.9rem;
    color: #8b5a4a;
    border-bottom: 1px solid rgba(139, 90, 74, 0.35);
    padding-bottom: 2px;
    transition:
      color 0.2s,
      border-color 0.2s;

    &:hover {
      color: #5c3a30;
      border-color: #5c3a30;
    }
  }
}
</style>
