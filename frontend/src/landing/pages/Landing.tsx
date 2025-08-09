import { ArrowRight, BarChart3, Box, Check, ChevronRight, FileText, Package, Truck, Users } from 'lucide-react'

import { useEffect, useRef } from 'react'
import { NavLink } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { useApp } from '../../context/AppContext'
import { useTranslation } from '../../lib/translations'
import Footer from '../components/Footer'
import ImageCarousel from '../components/ImageCarousel'
import TopBar from '../components/TopBar'

export default function LandingPage() {
  const t = useTranslation()
  const { variant } = useApp()

  const pricingRef = useRef<HTMLDivElement>(null)
  const featuresRef = useRef<HTMLDivElement>(null)
  const ordersRef = useRef<HTMLDivElement>(null)
  const customersRef = useRef<HTMLDivElement>(null)
  const productsRef = useRef<HTMLDivElement>(null)
  const invoicesRef = useRef<HTMLDivElement>(null)
  const shippingRef = useRef<HTMLDivElement>(null)
  const reportsRef = useRef<HTMLDivElement>(null)

  const scrollToPricing = () => {
    pricingRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const scrollToFeatures = () => {
    featuresRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const scrollToOrders = () => {
    ordersRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const scrollToCustomers = () => {
    customersRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const scrollToProducts = () => {
    productsRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const scrollToInvoices = () => {
    invoicesRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const scrollToShipping = () => {
    shippingRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const scrollToReports = () => {
    reportsRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    if (window.location.hash === '#hinnoittelu') {
      scrollToPricing()
    }
    else if (window.location.hash === '#ominaisuudet') {
      scrollToFeatures()
    }
    else if (window.location.hash === '#tilaukset') {
      scrollToOrders()
    }
    else if (window.location.hash === '#asiakashallinta') {
      scrollToCustomers()
    }
    else if (window.location.hash === '#tuotehallinta') {
      scrollToProducts()
    }
    else if (window.location.hash === '#laskutus') {
      scrollToInvoices()
    }
    else if (window.location.hash === '#kuljetukset') {
      scrollToShipping()
    }
    else if (window.location.hash === '#raportit') {
      scrollToReports()
    }
  }, [window.location.hash])

  return (
    <div className="flex min-h-screen flex-col text-base text-muted-foreground md:text-lg">
      <TopBar />

      <section className="w-full py-12 md:py-24 lg:py-32 bg-gradient-to-b from-white to-gray-50">
        <div className="container px-4 md:px-6 flex flex-col md:flex-row items-center md:items-start gap-12">
          <div className="flex flex-col gap-4 md:w-1/2">
            <img src={`/siikli-logo-${variant}.png`} alt="Siikli Logo" className="w-1/3" />
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.1]">
              {t(`landing.${variant}.title`)}
            </h1>
            <p className="text-lg md:text-lg lg:text-xl">
              {t(`landing.${variant}.description`)}
            </p>
            <p className="text-lg md:text-lg lg:text-xl">
              {t(`landing.${variant}.description2`)}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 mt-4">
              <Button size="lg" className="rounded-full text-lg" asChild>
                <NavLink to="/kirjaudu">
                  {t(`landing.${variant}.startForFree`)}
                  {' '}
                  <ArrowRight className="ml-2 h-5 w-5" />
                </NavLink>
              </Button>
              <Button variant="outline" size="lg" className="rounded-full text-lg" asChild>
                <a href="#ominaisuudet">{t('landing.learnMore')}</a>
              </Button>
            </div>
            {false && (
              <div className="flex items-center gap-2 mt-4">
                <div className="flex -space-x-2">
                  {[1, 2, 3, 4].map(i => (
                    <div
                      key={i}
                      className="h-10 w-10 rounded-full border-2 border-white bg-gray-200 flex items-center justify-center text-base font-medium"
                    >
                      {String.fromCharCode(64 + i)}
                    </div>
                  ))}
                </div>
                <p className="text-base text-muted-foreground">
                  Yli
                  {' '}
                  <span className="font-medium">500+</span>
                  {' '}
                  yritystä käyttää Siikliä
                </p>
              </div>
            )}
          </div>
          <div className="w-full md:w-1/2">
            <ImageCarousel />
          </div>

        </div>
      </section>

      <section className="w-full py-12 md:py-24 bg-white" id="ominaisuudet" ref={featuresRef}>
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center gap-4 text-center mb-12">
            <h2 className="text-gray-900 text-4xl font-bold tracking-tight">{t('landing.features.title')}</h2>
            <p className="text-muted-foreground text-xl max-w-[800px]">
              {t('landing.features.description')}
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card ref={ordersRef} className="rounded-xl border p-6 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 bg-white">
              <CardHeader className="pb-2">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <Package className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="text-xl">{t('landing.features.orders.title')}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-lg">
                  {t('landing.features.orders.description')}
                </p>
                <ul className="mt-4 space-y-2">
                  {[t('landing.features.orders.feature1'), t('landing.features.orders.feature2'), t('landing.features.orders.feature3'), t('landing.features.orders.feature4')].map(
                    feature => (
                      <li key={feature} className="flex items-center gap-2">
                        <Check className="h-5 w-5 text-primary" />
                        <span className="text-base">{feature}</span>
                      </li>
                    ),
                  )}
                </ul>
              </CardContent>
              {false && (
                <CardFooter>
                  <Button variant="ghost" size="sm" className="gap-1 text-lg" asChild>
                    <a href="#tilaukset">
                      Lue lisää
                      {' '}
                      <ChevronRight className="h-5 w-5" />
                    </a>
                  </Button>
                </CardFooter>
              )}
            </Card>
            <Card ref={customersRef} className="rounded-xl border p-6 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 bg-white">
              <CardHeader className="pb-2">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <Users className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="text-xl">{t('landing.features.customers.title')}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-lg">
                  {t('landing.features.customers.description')}
                </p>
                <ul className="mt-4 space-y-2">
                  {[t('landing.features.customers.feature1'), t('landing.features.customers.feature2'), t('landing.features.customers.feature3')].map(feature => (
                    <li key={feature} className="flex items-center gap-2">
                      <Check className="h-5 w-5 text-primary" />
                      <span className="text-base">{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              {false && (
                <CardFooter>
                  <Button variant="ghost" size="sm" className="gap-1 text-lg" asChild>
                    <a href="#asiakkaat">
                      Lue lisää
                      {' '}
                      <ChevronRight className="h-5 w-5" />
                    </a>
                  </Button>
                </CardFooter>
              )}
            </Card>
            <Card ref={productsRef} className="rounded-xl border p-6 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 bg-white">
              <CardHeader className="pb-2">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <Box className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="text-xl">{t('landing.features.products.title')}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-lg">
                  {t('landing.features.products.description')}
                </p>
                <ul className="mt-4 space-y-2">
                  {[t('landing.features.products.feature1'), t('landing.features.products.feature2'), t('landing.features.products.feature3')].map(feature => (
                    <li key={feature} className="flex items-center gap-2">
                      <Check className="h-5 w-5 text-primary" />
                      <span className="text-base">{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              {false && (
                <CardFooter>
                  <Button variant="ghost" size="sm" className="gap-1 text-lg" asChild>
                    <a href="#tuotteet">
                      Lue lisää
                      {' '}
                      <ChevronRight className="h-5 w-5" />
                    </a>
                  </Button>
                </CardFooter>
              )}
            </Card>
            <Card ref={invoicesRef} className="rounded-xl border p-6 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 bg-white">
              <CardHeader className="pb-2">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <FileText className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="text-xl">{t('landing.features.invoices.title')}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-lg">
                  {t('landing.features.invoices.description')}
                </p>
                <ul className="mt-4 space-y-2">
                  {[t('landing.features.invoices.feature1'), t('landing.features.invoices.feature2'), t('landing.features.invoices.feature3')].map(feature => (
                    <li key={feature} className="flex items-center gap-2">
                      <Check className="h-5 w-5 text-primary" />
                      <span className="text-base">{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              {false && (
                <CardFooter>
                  <Button variant="ghost" size="sm" className="gap-1 text-lg" asChild>
                    <a href="#laskutus">
                      Lue lisää
                      {' '}
                      <ChevronRight className="h-5 w-5" />
                    </a>
                  </Button>
                </CardFooter>
              )}
            </Card>
            <Card ref={shippingRef} className="rounded-xl border p-6 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 bg-white">
              <CardHeader className="pb-2">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <Truck className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="text-xl">{t('landing.features.shipping.title')}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-lg">
                  {t('landing.features.shipping.description')}
                </p>
                <ul className="mt-4 space-y-2">
                  {[t('landing.features.shipping.feature1'), t('landing.features.shipping.feature2'), t('landing.features.shipping.feature3')].map(
                    feature => (
                      <li key={feature} className="flex items-center gap-2">
                        <Check className="h-5 w-5 text-primary" />
                        <span className="text-base">{feature}</span>
                      </li>
                    ),
                  )}
                </ul>
              </CardContent>
              {false && (
                <CardFooter>
                  <Button variant="ghost" size="sm" className="gap-1 text-lg" asChild>
                    <a href="#kuljetukset">
                      Lue lisää
                      {' '}
                      <ChevronRight className="h-5 w-5" />
                    </a>
                  </Button>
                </CardFooter>
              )}
            </Card>
            <Card ref={reportsRef} className="rounded-xl border p-6 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 bg-white">
              <CardHeader className="pb-2">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <BarChart3 className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="text-xl">{t('landing.features.reports.title')}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-lg">
                  {t('landing.features.reports.description')}
                </p>
                <ul className="mt-4 space-y-2">
                  {[t('landing.features.reports.feature1'), t('landing.features.reports.feature2'), t('landing.features.reports.feature3')].map(feature => (
                    <li key={feature} className="flex items-center gap-2">
                      <Check className="h-5 w-5 text-primary" />
                      <span className="text-base">{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              {false && (
                <CardFooter>
                  <Button variant="ghost" size="sm" className="gap-1 text-lg" asChild>
                    <a href="#raportit">
                      Lue lisää
                      {' '}
                      <ChevronRight className="h-5 w-5" />
                    </a>
                  </Button>
                </CardFooter>
              )}
            </Card>
          </div>
        </div>
      </section>

      <section className="w-full py-12 md:py-24 bg-gray-50" id="hinnoittelu" ref={pricingRef}>
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center gap-4 text-center mb-12">
            <h2 className="text-gray-900 text-4xl font-bold tracking-tight">{t('landing.pricing.title')}</h2>
            <p className="text-muted-foreground text-xl max-w-[800px]">
              {t('landing.pricing.description')}
            </p>
          </div>
          <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="border-border flex flex-col">
              <CardHeader>
                <CardTitle className="text-2xl">{t('landing.pricing.free.title')}</CardTitle>
                <CardDescription className="text-lg text-muted-foreground">{t('landing.pricing.free.description')}</CardDescription>
                <div className="mt-4">
                  <span className="text-4xl font-bold">0 €</span>
                  <span className="text-muted-foreground text-xl">/kk</span>
                </div>
              </CardHeader>
              <CardContent className="flex-1">
                <ul className="space-y-2">
                  {[t('landing.pricing.free.feature1'), t('landing.pricing.free.feature2'), t('landing.pricing.free.feature3'), t('landing.pricing.free.feature4')].map(
                    feature => (
                      <li key={feature} className="flex items-center gap-2">
                        <Check className="h-5 w-5 text-primary" />
                        <span className="text-base">{feature}</span>
                      </li>
                    ),
                  )}
                </ul>
                <p className="text-muted-foreground mt-4 text-lg">{t('landing.pricing.free.cta')}</p>
              </CardContent>
              <CardFooter>
                <Button className="w-full text-lg">{t('landing.pricing.free.ctaButton')}</Button>
              </CardFooter>
            </Card>
            <Card className="border-primary relative border-border flex flex-col">
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-blue-400 text-white text-base font-medium px-4 py-1 rounded-full text-center">
                {t('landing.pricing.premium.recommended')}
              </div>
              <CardHeader>
                <CardTitle className="text-2xl">{t('landing.pricing.premium.title')}</CardTitle>
                <CardDescription className="text-lg text-muted-foreground">{t('landing.pricing.premium.description')}</CardDescription>
                <div className="mt-4">
                  <span className="text-4xl font-bold">149 €</span>
                  <span className="text-muted-foreground text-xl">/kk</span>
                </div>
              </CardHeader>
              <CardContent className="flex-1">
                <ul className="space-y-2">
                  {[
                    t('landing.pricing.premium.feature1'),
                    t('landing.pricing.premium.feature2'),
                    t('landing.pricing.premium.feature3'),
                    t('landing.pricing.premium.feature4'),
                  ].map(feature => (
                    <li key={feature} className="flex items-center gap-2">
                      <Check className="h-5 w-5 text-primary" />
                      <span className="text-base">{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                <Button className="w-full text-lg">{t('landing.pricing.premium.ctaButton')}</Button>
              </CardFooter>
            </Card>
          </div>
          <p className="text-base text-muted-foreground mt-4 text-center">{t('landing.pricing.vat')}</p>
        </div>
      </section>

      <section className="w-full py-12 md:py-24 bg-white">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center gap-4 text-center mb-12">
            <h2 className="text-gray-900 text-4xl font-bold tracking-tight">{t('landing.customerFeedback.title')}</h2>
            <p className="text-muted-foreground text-xl max-w-[800px]">
              {t('landing.customerFeedback.description')}
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
            {[
              {
                name: t(
                  'landing.customerFeedback.1.name',
                ),
                company: t(
                  'landing.customerFeedback.1.company',
                ),
                quote:
                    t('landing.customerFeedback.1.quote'),
              },
            ].map((testimonial, i) => (
              <Card key={i} className="bg-gray-50 border-none">
                <CardContent className="pt-6">
                  <div className="flex flex-col gap-4">
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map(star => (
                        <svg
                          key={star}
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          fill="currentColor"
                          className="w-6 h-6 text-yellow-500"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z"
                            clipRule="evenodd"
                          />
                        </svg>
                      ))}
                    </div>
                    <p className="text-muted-foreground italic text-lg">
                      "
                      {testimonial.quote}
                      "
                    </p>
                    <div className="flex items-center gap-4 mt-4">
                      <div className="h-12 w-12 rounded-full bg-gray-200 flex items-center justify-center text-base font-medium">
                        {testimonial.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-medium text-lg">{testimonial.name}</p>
                        <p className="text-base text-muted-foreground">{testimonial.company}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="w-full py-12 md:py-24 bg-primary text-primary-foreground">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center text-center gap-4 md:gap-8">
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight">{t('landing.cta.title')}</h2>
            <p className="text-xl md:text-2xl text-primary-foreground/90 max-w-[800px]">
              {t('landing.cta.description')}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 mt-4">
              <Button size="lg" variant="secondary" className="text-lg" asChild>
                <NavLink to="/kirjaudu">
                  {t('landing.cta.startForFree')}
                  {' '}
                  <ArrowRight className="ml-2 h-5 w-5" />
                </NavLink>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="bg-transparent border-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/10 text-lg"
                asChild
              >
                <NavLink to="/yhteystiedot">{t('landing.cta.askForMore')}</NavLink>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Turvallisuus */}
      <section className="w-full py-12 md:py-24 bg-white">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="md:w-1/2 flex flex-col gap-4">
              <h2 className="text-gray-900 text-4xl font-bold tracking-tight">{t('landing.security.title')}</h2>
              <p className="text-muted-foreground text-xl">
                {t('landing.security.description')}
              </p>
              <ul className="mt-4 space-y-2">
                {[
                  t('landing.security.feature1'),
                  t('landing.security.feature2'),
                  t('landing.security.feature3'),
                  t('landing.security.feature4'),
                ].map(feature => (
                  <li key={feature} className="flex items-center gap-2">
                    <Check className="h-5 w-5 text-primary" />
                    <span className="text-lg">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="md:w-1/3 flex justify-center">
              <div className="md:w-1/2 max-w-md aspect-video rounded-lg flex items-center justify-center">
                <img src="/shield.svg" alt="Tietoturva" className="rounded-lg" />
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
