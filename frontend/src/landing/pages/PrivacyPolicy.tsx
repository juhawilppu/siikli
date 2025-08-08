import { useEffect } from 'react'
import { useTranslation } from '../../lib/translations'
import Footer from '../components/Footer'
import TopBar from '../components/TopBar'

export default function PrivacyPolicy() {
  const t = useTranslation()

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    })
  }

  useEffect(() => {
    scrollToTop()
  }, [])

  return (
    <div className="flex min-h-screen flex-col">
      <TopBar />

      {/* Hero-osio */}
      <section className="w-full py-12 md:py-24 lg:py-32 bg-gradient-to-b from-white to-gray-50">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center text-center gap-4">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight">
              {t('landing.privacyPolicy.title')}
            </h1>
            <p className="text-muted-foreground text-lg md:text-xl max-w-[800px]">
              {t('landing.privacyPolicy.description')}
            </p>
          </div>
        </div>
      </section>

      {/* Tarinamme */}
      <section className="w-full py-12 md:py-24 bg-white">
        <div className="container px-4 md:px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div className="flex flex-col gap-6">
              <h2 className="text-3xl font-bold tracking-tight">{t('landing.privacyPolicy.content.title')}</h2>
              <div className="space-y-4 text-muted-foreground">
                <p>{t('landing.privacyPolicy.content.lastUpdated')}</p>

                <h2 className="text-l font-bold tracking-tight mt-4">{t('landing.privacyPolicy.content.section1.title')}</h2>
                <p>Siikli</p>
                <p>
                  {t('landing.privacyPolicy.content.section1.businessId')}
                  :
                  {' '}
                  {t('landing.privacyPolicy.content.section1.businessIdNumber')}
                </p>
                <p>
                  {t('landing.privacyPolicy.content.section1.email')}
                  :
                  {' '}
                  {t('landing.privacyPolicy.content.section1.emailAddress')}
                </p>
                <p>
                  {t('landing.privacyPolicy.content.section1.city')}
                  :
                  {' '}
                  {t('landing.privacyPolicy.content.section1.cityName')}
                </p>

                <h2 className="text-l font-bold tracking-tight mt-4">{t('landing.privacyPolicy.content.section2.title')}</h2>
                <p>{t('landing.privacyPolicy.content.section2.subsection1.title')}</p>
                <p>{t('landing.privacyPolicy.content.section2.subsection1.feature1')}</p>
                <p>{t('landing.privacyPolicy.content.section2.subsection1.feature2')}</p>
                <p>{t('landing.privacyPolicy.content.section2.subsection1.feature3')}</p>
                <p>{t('landing.privacyPolicy.content.section2.subsection1.feature4')}</p>

                <p>{t('landing.privacyPolicy.content.section2.subsection2.title')}</p>
                <p>{t('landing.privacyPolicy.content.section2.subsection2.feature1')}</p>
                <p>{t('landing.privacyPolicy.content.section2.subsection2.feature2')}</p>
                <p>{t('landing.privacyPolicy.content.section2.subsection2.feature3')}</p>

                <h2 className="text-l font-bold tracking-tight mt-4">{t('landing.privacyPolicy.content.section3.title')}</h2>
                <p>{t('landing.privacyPolicy.content.section3.description')}</p>
                <p>{t('landing.privacyPolicy.content.section3.feature1')}</p>
                <p>{t('landing.privacyPolicy.content.section3.feature2')}</p>
                <p>{t('landing.privacyPolicy.content.section3.feature3')}</p>
                <p>{t('landing.privacyPolicy.content.section3.feature4')}</p>
                <p>{t('landing.privacyPolicy.content.section3.feature5')}</p>

                <h2 className="text-l font-bold tracking-tight mt-4">{t('landing.privacyPolicy.content.section4.title')}</h2>
                <p>{t('landing.privacyPolicy.content.section4.description')}</p>

                <p>{t('landing.privacyPolicy.content.section4.posthog.title')}</p>
                <p>{t('landing.privacyPolicy.content.section4.posthog.description')}</p>
                <p>
                  👉
                  {' '}
                  <a className="text-blue-600" href="https://posthog.com/docs/privacy" target="_blank" rel="noopener noreferrer">{t('landing.privacyPolicy.content.section4.posthog.link')}</a>
                </p>

                <p>{t('landing.privacyPolicy.content.section4.sentry.title')}</p>
                <p>{t('landing.privacyPolicy.content.section4.sentry.description')}</p>
                <p>
                  👉
                  {' '}
                  <a className="text-blue-600" href="https://sentry.io/privacy/" target="_blank" rel="noopener noreferrer">{t('landing.privacyPolicy.content.section4.sentry.link')}</a>
                </p>

                <h2 className="text-l font-bold tracking-tight mt-4">{t('landing.privacyPolicy.content.section5.title')}</h2>
                <p>{t('landing.privacyPolicy.content.section5.description')}</p>

                <h2 className="text-l font-bold tracking-tight mt-4">{t('landing.privacyPolicy.content.section6.title')}</h2>
                <p>{t('landing.privacyPolicy.content.section6.description')}</p>

                <h2 className="text-l font-bold tracking-tight mt-4">{t('landing.privacyPolicy.content.section7.title')}</h2>
                <p>{t('landing.privacyPolicy.content.section7.description')}</p>
                <p>{t('landing.privacyPolicy.content.section7.feature1')}</p>
                <p>{t('landing.privacyPolicy.content.section7.feature2')}</p>
                <p>{t('landing.privacyPolicy.content.section7.feature3')}</p>
                <p>{t('landing.privacyPolicy.content.section7.feature4')}</p>
                <p>{t('landing.privacyPolicy.content.section7.feature5')}</p>
                <p>{t('landing.privacyPolicy.content.section7.feature6')}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
