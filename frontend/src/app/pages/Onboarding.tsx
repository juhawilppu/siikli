import type { GetOnboardingResponse } from '@siikli/shared'

import axios from 'axios'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { FunnelBar } from '@/components/funnel-bar'
import { Button } from '@/components/ui/button'
import { useTranslation } from '@/lib/translations'

export default function OnboardingPage() {
  const t = useTranslation()
  const navigate = useNavigate()

  const [onboarding, setOnboarding] = useState<GetOnboardingResponse | null>(null)

  useEffect(() => {
    axios.get<GetOnboardingResponse>('/tenants/onboarding').then((res) => {
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
            <h1 className="text-3xl font-bold tracking-tight leading-tight mb-2">{t('onboarding.title')}</h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-tight">
              {t('onboarding.description')}
            </p>
          </div>

          <FunnelBar onboarding={onboarding} />

          <div className="mt-8 p-6 rounded-lg border bg-gradient-to-r from-gray-50 to-gray-100">
            <h3 className="font-semibold mb-4">{t('onboarding.helpTitle')}</h3>
            <div className="flex flex-wrap gap-3">
              <Button variant="outline" size="sm">
                <a href="https://www.youtube.com/watch?v=ZCOCyZbOQn8">
                  🎥
                  {' '}
                  {t('onboarding.videoTitle')}
                </a>
              </Button>
              <Button variant="outline" size="sm" onClick={() => navigate('/support')}>
                💬
                {' '}
                {t('onboarding.contactSupport')}
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
