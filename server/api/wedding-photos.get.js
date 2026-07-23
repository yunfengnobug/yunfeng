/**
 * 公开：婚纱照列表（初修 / 精修 / 底图），仅读库
 * GET /api/wedding-photos
 */
export default defineEventHandler(async () => {
  const config = useRuntimeConfig()
  if (!config.dbHost || !config.dbUser || !config.dbName) {
    return {
      code: 1,
      message: '数据库未配置',
      data: { draft: [], final: [], base: [] },
    }
  }

  try {
    const rows = await query(
      `SELECT id, category, url, sort_order
       FROM wedding_photos
       ORDER BY sort_order DESC, id DESC`,
    )

    const draft = []
    const final = []
    const base = []

    for (const row of rows || []) {
      const item = {
        id: row.id,
        url: row.url,
        sort_order: row.sort_order,
      }
      if (row.category === 'draft') {
        draft.push(item)
      } else if (row.category === 'final') {
        final.push(item)
      } else if (row.category === 'base') {
        base.push(item)
      }
    }

    return {
      code: 0,
      message: 'ok',
      data: { draft, final, base },
    }
  } catch (error) {
    console.error('[wedding-photos]', error?.message || error)
    return {
      code: 1,
      message: '读取婚纱照失败',
      data: { draft: [], final: [], base: [] },
    }
  }
})
