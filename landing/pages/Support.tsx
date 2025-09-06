import { useEffect } from 'react'
import { useTranslation } from '../../lib/translations'
import Footer from '../components/Footer'
import TopBar from '../components/TopBar'

export default function ContactPage() {
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

      <section className="w-full py-12 md:py-24 bg-white">
        <div className="container px-4 md:px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div className="flex flex-col gap-6">
              <h2 className="text-3xl font-bold tracking-tight">{t('support.title')}</h2>
              <div className="space-y-4 text-muted-foreground">
                <p>{t('support.description')}</p>

                <p>{t('support.description2')}</p>

                <p>
                  ✉️
                  {' '}
                  <a className="text-blue-600" href="mailto:juha.wilppu@siikli.fi">juha.wilppu@siikli.fi</a>
                </p>

                <p>{t('support.description3')}</p>
              </div>
            </div>
            <div className="flex justify-center">
              <div className="relative w-1/2 bg-gray-100 rounded-lg overflow-hidden">
                <img src="/juha.jpg" alt="Juha Wilppu" className="object-cover w-full h-full" />
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
