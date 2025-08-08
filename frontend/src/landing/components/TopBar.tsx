import { ArrowLeft } from 'lucide-react'
import { NavLink } from 'react-router-dom'
import LanguageSwitcher from '../../components/LanguageSwitcher'
import { Button } from '../../components/ui/button'
import { useTranslation } from '../../lib/translations'

export default function TopBar({ showBackButton, hideLoginButton }: { showBackButton?: boolean, hideLoginButton?: boolean }) {
  const t = useTranslation()
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white">
      <div className="container flex h-16 items-center justify-between">
        <NavLink to="/">
          <div className="flex items-center gap-2 pl-6">
            <span className="font-bold text-2xl text-primary">Siikli</span>
          </div>
        </NavLink>
        <nav className="hidden md:flex gap-6 items-center">
          <NavLink
            to="/#ominaisuudet"
            className="text-md font-medium text-gray-900 hover:text-foreground transition-colors"
          >
            {t('landing.topbar.features')}
          </NavLink>
          <NavLink
            to="/#hinnoittelu"
            className="text-md font-medium text-gray-900 hover:text-foreground transition-colors"
          >
            {t('landing.topbar.pricing')}
          </NavLink>
          <NavLink
            to="/tuki"
            className="text-md font-medium text-gray-900 hover:text-foreground transition-colors"
          >
            {t('landing.topbar.support')}
          </NavLink>
          <NavLink
            to="/yhteystiedot"
            className="text-md font-medium text-gray-900 hover:text-foreground transition-colors"
          >
            {t('landing.topbar.contact')}
          </NavLink>
        </nav>
        <div className="flex items-center justify-end w-[200px] gap-4">
          <LanguageSwitcher />
          {showBackButton && (
            <Button variant="outline" size="sm" asChild>
              <NavLink to="/">
                <ArrowLeft className="mr-2 h-4 w-4" />
                {t('landing.topbar.back')}
              </NavLink>
            </Button>
          )}
          {!hideLoginButton && (
            <Button size="lg" className="rounded-full" asChild>
              <NavLink to="/kirjaudu" className="text-lg">{t('landing.topbar.login')}</NavLink>
            </Button>
          )}

        </div>
      </div>
    </header>
  )
}
