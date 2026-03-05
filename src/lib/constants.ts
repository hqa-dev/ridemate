import { T } from '@/lib/theme'

// Shared status configs for ride requests
export const REQUEST_STATUS: Record<string, { text: string; color: string; bg: string }> = {
  pending:   { text: 'چاوەڕوانە',       color: T.amber,   bg: T.amberBg },
  approved:  { text: 'قبوڵ کرا',        color: T.green,   bg: T.greenBg },
  declined:  { text: 'ڕەت کرایەوە',    color: T.red,     bg: T.redBg },
  cancelled: { text: 'هەڵوەشێنرایەوە', color: T.textMid, bg: T.chipBg },
}

export const RIDE_CANCELLED_STATUS = { text: 'هەڵوەشێنرایەوە', color: T.red, bg: T.redBg }
