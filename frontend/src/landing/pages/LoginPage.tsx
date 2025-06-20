import { HelpCircle } from 'lucide-react'
import { Link } from 'react-router-dom'

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../../components/ui/accordion'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../../components/ui/card'
import { useTranslation } from '../../lib/translations'
import Footer from '../components/Footer'
import TopBar from '../components/TopBar'
import LoginForm from './LoginForm'

export default function LoginPage2() {
  const t = useTranslation()

  return (
    <div className="flex min-h-screen flex-col">
      {/* Navigation */}
      <TopBar showBackButton hideLoginButton />

      {/* Main content */}
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32 bg-gradient-to-b from-white to-gray-50">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center text-center space-y-4 mb-12">
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight">
                {t('login.title')}
              </h1>
              <p className="text-muted-foreground text-lg md:text-xl max-w-[800px]">
                {t('login.description').replace('&ndash;', '—')}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
              {/* Login form */}
              <Card className="w-full mx-auto">
                <CardHeader>
                  <CardTitle>{t('login.form.title')}</CardTitle>
                  <CardDescription>{t('login.form.description')}</CardDescription>
                </CardHeader>
                <CardContent>
                  <LoginForm />
                </CardContent>
                <CardFooter className="flex flex-col items-start gap-2">
                  <div className="text-sm text-muted-foreground">
                    {t('login.form.noAccountYetCreateHere')}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {t('login.form.acceptTerms')}
                    {' '}
                    <Link href="#kayttoehdot" className="text-primary hover:underline">
                      {t('login.form.terms')}
                    </Link>
                    {' '}
                    {t('login.form.and')}
                    {' '}
                    <Link href="#tietosuoja" className="text-primary hover:underline">
                      {t('login.form.privacyPolicy')}
                    </Link>
                    .
                  </div>
                </CardFooter>
              </Card>
              {/* Trial info */}
              <div className="flex flex-col space-y-8">
                <Card className="bg-primary/5 border-primary/20">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      {t('login.trial.title')}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p>
                      {t('login.trial.description')}
                    </p>
                    <ul className="space-y-2">
                      {[
                        t('login.trial.noCommitment'),
                        t('login.trial.personalSupport'),
                        t('login.trial.allFeatures'),
                      ].map(feature => (
                        <li key={feature} className="flex items-center gap-2">
                          <span>
                            ✅
                            {' '}
                            {feature}
                          </span>
                        </li>
                      ))}
                    </ul>
                    <p>
                      {t('login.trial.contactIfUnsure')}
                    </p>
                  </CardContent>
                </Card>

                {/* FAQ */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <HelpCircle className="h-5 w-5" />
                      {t('login.trial.faqTitle')}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Accordion type="single" collapsible className="w-full">
                      <AccordionItem value="item-1">
                        <AccordionTrigger>
                          {t('login.trial.faq.needCreditCard')}
                        </AccordionTrigger>
                        <AccordionContent>
                          {t('login.trial.faq.needCreditCardAnswer')}
                        </AccordionContent>
                      </AccordionItem>
                      <AccordionItem value="item-2">
                        <AccordionTrigger>
                          {t('login.trial.faq.howToCancel')}
                        </AccordionTrigger>
                        <AccordionContent>
                          {t('login.trial.faq.howToCancelAnswer')}
                        </AccordionContent>
                      </AccordionItem>
                      <AccordionItem value="item-3">
                        <AccordionTrigger>
                          {t('login.trial.faq.whatHappensWhenTrialEnds')}
                        </AccordionTrigger>
                        <AccordionContent>
                          {t('login.trial.faq.whatHappensWhenTrialEndsAnswer')}
                        </AccordionContent>
                      </AccordionItem>
                      <AccordionItem value="item-4">
                        <AccordionTrigger>
                          {t('login.trial.faq.canIGetSupportDuringTrial')}
                        </AccordionTrigger>
                        <AccordionContent>
                          {t('login.trial.faq.canIGetSupportDuringTrialAnswer')}
                        </AccordionContent>
                      </AccordionItem>
                      <AccordionItem value="item-5">
                        <AccordionTrigger>
                          {t('login.trial.faq.canITransferDataFromAnotherSystem')}
                        </AccordionTrigger>
                        <AccordionContent>
                          {t('login.trial.faq.canITransferDataFromAnotherSystemAnswer')}
                        </AccordionContent>
                      </AccordionItem>
                    </Accordion>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>

      </main>

      <Footer />
    </div>
  )
}
