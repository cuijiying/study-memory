/** 仅允许站内路径作为登录后回跳地址，避免开放重定向 */
export function resolveInternalRedirect(value: unknown, fallback = '/') {
  if (typeof value !== 'string') return fallback
  if (!value.startsWith('/') || value.startsWith('//')) return fallback
  if (value === '/login' || value === '/register') return fallback
  return value
}
