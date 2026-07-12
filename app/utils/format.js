// 日期与文案工具

// 格式化为 YYYY-MM-DD
export function formatDate(dateStr) {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

// 截取摘要
export function getSummary(content, length = 100) {
  if (!content) return ''
  const plain = String(content).replace(/<[^>]+>/g, '')
  if (plain.length <= length) return plain
  return `${plain.substring(0, length)}...`
}
