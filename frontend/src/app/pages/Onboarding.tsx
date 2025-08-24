import type { GetOnboardingResponseDto } from '@siikli/shared'

import axios from 'axios'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { FunnelBar } from '@/components/funnel-bar'
import { Button } from '@/components/ui/button'

export default function OnboardingPage() {
  const navigate = useNavigate()

  const [onboarding, setOnboarding] = useState<GetOnboardingResponseDto | null>(null)

  useEffect(() => {
    axios.get<GetOnboardingResponseDto>('/tenants/onboarding').then((res) => {
      setOnboarding(res.data)
    })
  }, [])

  if (!onboarding) {
    return <div></div>
  }

  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-1 overflow-auto">
        <div className="container mx-auto p-4 md:p-6">
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold tracking-tight leading-tight mb-2">Aloitetaan Siiklin käyttöönotto!</h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-tight">
              Tämä sivu ohjeistaa sinua Siiklin käyttöönotossa. Voit seurata alla mainittuja vaiheita.
            </p>
          </div>

          <FunnelBar onboarding={onboarding} />

          <div className="mt-8 p-6 rounded-lg border bg-gradient-to-r from-gray-50 to-gray-100">
            <h3 className="font-semibold mb-4">Tarvitsetko apua?</h3>
            <div className="flex flex-wrap gap-3">
              <Button variant="outline" size="sm">
                <a href="https://www.youtube.com/watch?v=ZCOCyZbOQn8">🎥 Katso 4 min esittelyvideo</a>
              </Button>
              <Button variant="outline" size="sm" onClick={() => navigate('/app/support')}>
                💬 Ota yhteyttä
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
