export type NoticeInput = {
  enabled?: boolean | null
  title?: string | null
  message?: string | null
  url?: string | null
  endsAt?: string | null
}
export type ActiveNotice = { title: string; message: string; url: string | null; endsAt: string }

export function safeNoticeUrl(value?: string | null) {
  if (!value?.trim()) return null
  try {
    const url = new URL(value.trim())
    return url.protocol === 'https:' && !url.username && !url.password ? url.toString() : null
  } catch {
    return null
  }
}

export function activeNotice(notice?: NoticeInput | null, now = Date.now()): ActiveNotice | null {
  if (!notice?.enabled || validateNotice(notice, undefined, now) !== true) return null
  return {
    title: notice.title!.trim(),
    message: notice.message!.trim(),
    url: safeNoticeUrl(notice.url),
    endsAt: notice.endsAt!,
  }
}

export function validateNotice(
  notice: NoticeInput,
  previous?: NoticeInput | null,
  now = Date.now(),
): true | string {
  if (!notice.enabled) return true
  if (!notice.title?.trim() || !notice.message?.trim())
    return 'Completá el título y el mensaje del aviso.'
  if (notice.url?.trim() && !safeNoticeUrl(notice.url))
    return 'Usá un enlace HTTPS válido, sin usuario ni contraseña.'
  const end = notice.endsAt ? Date.parse(notice.endsAt) : NaN
  const unchanged =
    previous?.enabled &&
    ['title', 'message', 'url', 'endsAt'].every(
      (key) => notice[key as keyof NoticeInput] === previous[key as keyof NoticeInput],
    )
  if (!Number.isFinite(end) || (end <= now && !unchanged))
    return 'Elegí una fecha y hora futura para retirar el aviso.'
  return true
}
