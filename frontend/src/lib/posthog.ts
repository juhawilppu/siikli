import posthog from 'posthog-js'

export function initPosthog() {
  posthog.init(import.meta.env.VITE_PUBLIC_POSTHOG_KEY, {
    api_host: import.meta.env.VITE_PUBLIC_POSTHOG_HOST,
    autocapture: true,
    capture_pageview: true,
    disable_session_recording: true,
    debug: import.meta.env.MODE === 'development',
    loaded: () => {
      console.log('PostHog loaded')
    },
  })
  posthog.people.set({ variant: localStorage.getItem('variant') })
}
