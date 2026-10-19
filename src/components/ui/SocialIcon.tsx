type Platform = 'facebook' | 'youtube' | 'instagram' | 'whatsapp'
const paths: Record<Platform, string> = {
  facebook: 'M14 21v-8h3l.5-4H14V7c0-1 .5-1.5 1.5-1.5H18V2h-3c-3 0-5 1.8-5 5v2H7v4h3v8',
  youtube: 'M9 8l7 4-7 4V8ZM3 5.5C2 7 2 17 3 18.5c1 1 17 1 18 0 1-1.5 1-11.5 0-13-1-1-17-1-18 0Z',
  instagram:
    'M7 3h10a4 4 0 0 1 4 4v10a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V7a4 4 0 0 1 4-4ZM16 12a4 4 0 1 1-8 0 4 4 0 0 1 8 0ZM17.5 6.5h.01',
  whatsapp:
    'M20 11.6a8 8 0 0 1-8 8 9 9 0 0 1-4-.9L3 20l1.4-4.6A8 8 0 1 1 20 11.6ZM8 7.5c0 4 4.5 8.5 8 8l1-2-3-1-1 1-2.5-2.5 1-1-1-3-2 .5Z',
}
export function SocialIcon({ platform }: { platform: string }) {
  const path = paths[platform as Platform]
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-6 w-6"
      aria-hidden="true"
    >
      <path d={path ?? 'M4 12h16M12 4v16'} />
    </svg>
  )
}
