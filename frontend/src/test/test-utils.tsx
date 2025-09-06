import type { ReactElement } from 'react'
import { render } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { Toaster } from '@/components/ui/toaster'

export function renderWithProviders(
  ui: ReactElement,
  { route = '/', params = {} } = {},
) {
  // Convert params object into actual values in the route
  const path = Object.entries(params).reduce(
    (acc, [key, value]) => acc.replace(`:${key}`, value as string),
    route,
  )

  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path={route} element={ui} />
      </Routes>
      <Toaster />
    </MemoryRouter>,
  )
}
