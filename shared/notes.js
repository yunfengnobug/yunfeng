// 随笔假数据（列表与详情共用）
export const NOTES = [
  {
    id: 1,
    title: '初探 Vue 3 组合式 API',
    content:
      '<p>Vue 3 引入了组合式 API，它提供了一种更灵活的方式来组织组件逻辑。通过 setup 函数，我们可以更好地复用代码，提高代码的可读性和维护性。</p><p>本文将深入探讨组合式 API 的核心概念和使用方法，包括 ref、reactive、computed、watch 等常用API的使用技巧。</p>',
    summary:
      'Vue 3 引入了组合式 API，它提供了一种更灵活的方式来组织组件逻辑。通过 setup 函数，我们可以更好地复用代码，提高代码的可读性和维护性。本文将深入探讨组合式 API 的核心概念和使用方法...',
    tags: 'Vue3,前端,JavaScript',
    author: '云枫',
    published_at: '2025-01-20T10:00:00.000Z',
    created_at: '2025-01-20T09:00:00.000Z',
    updated_at: '2025-01-20T10:00:00.000Z',
  },
  {
    id: 2,
    title: 'TypeScript 类型体操入门',
    content:
      '<p>TypeScript 的类型系统非常强大，掌握类型体操可以帮助我们编写更加健壮的代码。</p><p>本文将介绍一些常见的类型工具和技巧，包括泛型、条件类型、映射类型等高级用法。</p>',
    summary:
      'TypeScript 的类型系统非常强大，掌握类型体操可以帮助我们编写更加健壮的代码。本文将介绍一些常见的类型工具和技巧，包括泛型、条件类型、映射类型等...',
    tags: 'TypeScript,前端',
    author: '云枫',
    published_at: '2025-01-18T14:30:00.000Z',
    created_at: '2025-01-18T14:00:00.000Z',
    updated_at: '2025-01-18T14:30:00.000Z',
  },
  {
    id: 3,
    title: '关于代码整洁之道的思考',
    content:
      '<p>代码不仅要能运行，更要易于理解和维护。良好的代码风格和架构设计是每个开发者都应该追求的目标。</p><p>本文分享一些关于代码整洁之道的个人思考和实践经验。</p>',
    summary:
      '代码不仅要能运行，更要易于理解和维护。良好的代码风格和架构设计是每个开发者都应该追求的目标。本文分享一些关于代码整洁之道的个人思考和实践经验...',
    tags: '编程思想,最佳实践',
    author: '云枫',
    published_at: '2025-01-15T08:00:00.000Z',
    created_at: '2025-01-15T07:30:00.000Z',
    updated_at: '2025-01-15T08:00:00.000Z',
  },
  {
    id: 4,
    title: 'CSS Grid 布局完全指南',
    content:
      '<p>CSS Grid 是一个强大的二维布局系统，可以轻松实现复杂的页面布局。</p><p>本文将全面介绍 Grid 布局的基本概念、属性和实际应用案例。</p>',
    summary:
      'CSS Grid 是一个强大的二维布局系统，可以轻松实现复杂的页面布局。本文将全面介绍 Grid 布局的基本概念、属性和实际应用案例...',
    tags: 'CSS,前端,布局',
    author: '云枫',
    published_at: '2025-01-10T16:00:00.000Z',
    created_at: '2025-01-10T15:00:00.000Z',
    updated_at: '2025-01-10T16:00:00.000Z',
  },
  {
    id: 5,
    title: '2025年前端技术展望',
    content:
      '<p>新的一年，前端技术领域又会有哪些新的发展趋势？</p><p>本文将从框架生态、工具链、性能优化等多个角度，分析2025年前端技术的发展方向。</p>',
    summary:
      '新的一年，前端技术领域又会有哪些新的发展趋势？本文将从框架生态、工具链、性能优化等多个角度，分析2025年前端技术的发展方向...',
    tags: '前端,技术趋势,2025',
    author: '云枫',
    published_at: '2025-01-05T12:00:00.000Z',
    created_at: '2025-01-05T11:00:00.000Z',
    updated_at: '2025-01-05T12:00:00.000Z',
  },
]

// 按 id 查找随笔
export function getNoteById(id) {
  const numId = Number(id)
  return NOTES.find((item) => item.id === numId) || null
}

// 将标签字符串拆成数组
export function splitTags(tags) {
  if (!tags) return []
  return tags
    .split(',')
    .map((tag) => tag.trim())
    .filter(Boolean)
}
