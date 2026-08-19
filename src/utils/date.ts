/** 艾宾浩斯复习间隔（小时） */
const REVIEW_INTERVALS_HOURS = [3, 27, 72, 168, 360] as const

export function getTodayRange() {
  const now = new Date()
  const start = new Date(now)
  start.setHours(0, 0, 0, 0)
  const end = new Date(now)
  end.setHours(23, 59, 59, 999)
  return { start, end }
}

export function formatDateTime(value?: string | null) {
  if (!value) return '-'
  return new Date(value).toLocaleString()
}

export function isSameDay(date: string) {
  const today = new Date()
  const target = new Date(date)
  return (
    today.getDate() === target.getDate() &&
    today.getMonth() === target.getMonth() &&
    today.getFullYear() === target.getFullYear()
  )
}

export function buildReviewSchedule(base = new Date()) {
  const baseMs = base.getTime()
  const [r1, r2, r3, r4, r5] = REVIEW_INTERVALS_HOURS.map(
    (hours) => new Date(baseMs + hours * 60 * 60 * 1000).toISOString()
  )
  return {
    review1_time: r1,
    review2_time: r2,
    review3_time: r3,
    review4_time: r4,
    review5_time: r5,
  }
}

export const REVIEW_COUNT = REVIEW_INTERVALS_HOURS.length
export const COMPLETED_REVIEW_STATUS = '1'.repeat(REVIEW_COUNT)
