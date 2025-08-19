import type { ClassValue } from 'clsx'
import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function downloadUrl(url: string, isMobile: boolean) {
  if (isMobile) {
    window.location.href = url
  }
  else {
    window.open(url, '_blank', 'noopener,noreferrer')
  }
}
