import { PostCompleteSignupRequest } from '@siikli/shared'

import axios from 'axios'
import { Building2, Check, Loader2, Rocket, Users } from 'lucide-react'
import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import { useToast } from '@/app/hooks/use-toast'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useTranslation } from '@/lib/translations'

export default function SelfSignup() {
  const t = useTranslation()
  const [companyNamy, setCompanyName] = useState('')
  const [marketingConsent, setMarketingConsent] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const { toast } = useToast()

  const handleSave = async () => {
    if (!companyNamy.trim()) {
      toast({
        title: t('selfSignup.companyNameMissing'),
        description: t('selfSignup.enterCompanyNameToContinue'),
        variant: 'destructive',
      })
      return
    }

    setIsLoading(true)

    try {
      const data = PostCompleteSignupRequest.parse({
        name: companyNamy,
        user: {
          marketingConsent,
        },
      })

      await axios.post('/tenants/complete-signup', data)

      window.location.href = '/onboarding'
    }
    catch (e) {
      console.error('error', e)
      setIsLoading(false)
      toast({
        title: t('selfSignup.errorDuringSignup'),
        description: t('selfSignup.tryAgainLater'),
        variant: 'destructive',
      })
    }
  }

  const logout = async () => {
    await axios.post('/auth/logout').finally(() => {
      window.location.href = 'https://siikli.fi'
    })
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="sticky top-0 z-50 w-full border-b bg-white">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-bold text-2xl text-primary">Siikli</span>
          </div>
          <div className="flex items-center gap-4">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" size="sm">
                  {t('login.backToHomepage')}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>{t('selfSignup.confirmCancel')}</AlertDialogTitle>
                  <AlertDialogDescription>
                    {t('selfSignup.willBeLoggedOut')}
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>{t('selfSignup.continue')}</AlertDialogCancel>
                  <AlertDialogAction onClick={() => logout()}>
                    {t('selfSignup.logout')}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </header>

      <main className="flex-1 py-12">
        <div className="container px-4 md:px-6">
          <div className="max-w-3xl mx-auto">
            <div className="mb-8 text-center">
              <h1 className="text-3xl font-bold tracking-tight mb-2">{t('selfSignup.welcome')}</h1>
              <p className="text-muted-foreground">
                {t('selfSignup.addCompanyInfo')}
              </p>
            </div>

            <Card className="mb-8">
              <CardContent>
                <div className="space-y-4 mt-4">
                  <div className="space-y-2">
                    <Label htmlFor="company-name" className="font-medium">
                      {t('selfSignup.companyName.label')}
                      {' '}
                      <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="company-name"
                      placeholder={t('selfSignup.companyName.placeholder')}
                      value={companyNamy}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCompanyName(e.target.value)}
                      required
                    />
                  </div>

                  <div className="flex items-center space-x-2 pt-4">
                    <Checkbox
                      id="marketing-consent"
                      checked={marketingConsent}
                      onCheckedChange={checked => setMarketingConsent(checked as boolean)}
                    />
                    <Label htmlFor="marketing-consent" className="text-sm">
                      {t('selfSignup.marketingConsent')}
                    </Label>
                  </div>
                </div>
                <div className="flex justify-end mt-4">
                  <Button onClick={handleSave} disabled={isLoading || !companyNamy.trim()}>
                    {isLoading
                      ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            {t('selfSignup.loading')}
                            {' '}
                          </>
                        )
                      : (
                          <>
                            <Rocket className="mr-2 h-4 w-4" />
                            {t('selfSignup.continue')}
                          </>
                        )}
                  </Button>
                </div>
              </CardContent>

            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-2">
                    <Building2 className="h-5 w-5 text-primary" />
                    <CardTitle className="text-lg">{t('selfSignup.benefits.title')}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {[
                      'selfSignup.benefits.point1',
                      'selfSignup.benefits.point2',
                      'selfSignup.benefits.point3',
                      'selfSignup.benefits.point4',
                    ].map(benefit => (
                      <li key={benefit} className="flex items-start gap-2">
                        <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                        <span className="text-sm">{t(benefit as any)}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-primary" />
                    <CardTitle className="text-lg">{t('selfSignup.tips.title')}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <ol className="space-y-3 list-decimal pl-5">
                    {[
                      'selfSignup.tips.point1',
                      'selfSignup.tips.point2',
                      'selfSignup.tips.point3',
                      'selfSignup.tips.point4',
                      'selfSignup.tips.point5',
                    ].map(tip => (
                      <li key={tip} className="text-sm pl-1">
                        {t(tip as any)}
                      </li>
                    ))}
                  </ol>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t bg-white py-6">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-sm text-muted-foreground">
              <p>
                {t('footer.copyright')}
                .
              </p>
            </div>
            <div className="flex gap-6">
              <NavLink to="#tuki" className="text-sm text-muted-foreground hover:text-foreground">
                {t('footer.support')}
              </NavLink>
              <NavLink to="#tietosuoja" className="text-sm text-muted-foreground hover:text-foreground">
                {t('footer.privacy')}
              </NavLink>
              <NavLink to="#kayttoehdot" className="text-sm text-muted-foreground hover:text-foreground">
                {t('footer.conditions')}
              </NavLink>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
