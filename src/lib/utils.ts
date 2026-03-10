import { kurdishStrings } from '@/lib/strings'

// ── City data ──

export const CITIES: Record<string, string> = {
  erbil: kurdishStrings.erbil,
  suli: kurdishStrings.suli,
  duhok: kurdishStrings.duhok,
}

export const ROUTE_HOURS: Record<string, number> = {
  'erbil-suli': 2, 'suli-erbil': 2,
  'erbil-duhok': 3, 'duhok-erbil': 3,
  'suli-duhok': 5, 'duhok-suli': 5,
}

export const ROUTE_DISTANCE: Record<string, string> = {
  'erbil-suli': '١٦٠ کم', 'suli-erbil': '١٦٠ کم',
  'erbil-duhok': '١٨٠ کم', 'duhok-erbil': '١٨٠ کم',
  'suli-duhok': '٣٤٠ کم', 'duhok-suli': '٣٤٠ کم',
}

export const ROUTE_INFO: Record<string, { duration: string; distance: string }> = {
  'erbil-suli': { duration: '٢ کاتژمێر', distance: '١٦٠ کم' },
  'suli-erbil': { duration: '٢ کاتژمێر', distance: '١٦٠ کم' },
  'erbil-duhok': { duration: '٣ کاتژمێر', distance: '١٨٠ کم' },
  'duhok-erbil': { duration: '٣ کاتژمێر', distance: '١٨٠ کم' },
  'suli-duhok': { duration: '٥ کاتژمێر', distance: '٣٤٠ کم' },
  'duhok-suli': { duration: '٥ کاتژمێر', distance: '٣٤٠ کم' },
}

export const COLOR_KU: Record<string, string> = {
  black: 'ڕەش', white: 'سپی', red: 'سوور', blue: 'شین', green: 'سەوز',
  yellow: 'زەرد', silver: 'زیوی', grey: 'خۆڵەمێشی', gray: 'خۆڵەمێشی',
  brown: 'قاوەیی', orange: 'پرتەقاڵی', gold: 'ئاڵتوونی',
}

// ── Formatting helpers ──

export function toKurdishNum(n: number | string): string {
  return String(n).replace(/[0-9]/g, (d) => '٠١٢٣٤٥٦٧٨٩'[Number(d)])
}

export function formatKurdishDate(dt: string): string {
  const d = new Date(dt)
  const day = d.getDate()
  const month = d.getMonth() + 1
  const year = d.getFullYear()
  return toKurdishNum(year) + '/' + toKurdishNum(month) + '/' + toKurdishNum(day)
}

/** Format ISO datetime to "H:MM" (plain digits — wrap with toKurdishNum at call site if needed) */
export function formatTime(dt: string): string {
  const d = new Date(dt)
  return `${d.getHours()}:${d.getMinutes().toString().padStart(2, '0')}`
}

/** Estimate arrival time as "H:MM" (plain digits) */
export function estimateArrival(dt: string, fromCity: string, toCity: string): string {
  const d = new Date(dt)
  const add = ROUTE_HOURS[`${fromCity}-${toCity}`] || 2
  d.setHours(d.getHours() + add)
  return `${d.getHours()}:${d.getMinutes().toString().padStart(2, '0')}`
}

export function formatWhatsApp(phone: string): string {
  return 'https://wa.me/' + phone.replace(/^0/, '964')
}
