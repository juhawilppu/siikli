import { NavLink } from 'react-router-dom'
import { useTranslation } from '../../lib/translations'

export default function Footer() {
  const t = useTranslation()
  return (
    <footer className="w-full py-12 bg-gray-800 text-white" id="yhteystiedot">
      <div className="container px-4 md:px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <span className="font-bold text-2xl text-white">Siikli</span>
            </div>
            <p className="text-gray-400">{t('landing.footer.description')}</p>
            {false && (
              <div className="flex gap-4 mt-2">
                {['twitter', 'facebook', 'instagram', 'NavLinkedin'].map(social => (
                  <NavLink key={social} to={`#${social}`} className="text-gray-400 hover:text-white">
                    <span className="sr-only">{social}</span>
                    <div className="h-6 w-6 rounded-full bg-gray-800 flex items-center justify-center">
                      {social.charAt(0).toUpperCase()}
                    </div>
                  </NavLink>
                ))}
              </div>
            )}
          </div>
          <div className="flex flex-col gap-4">
            <h3 className="text-lg font-medium text-white">{t('landing.footer.features')}</h3>
            <ul className="space-y-2">
              {[
                { name: t('landing.footer.links.orders'), href: '/#tilaukset' },
                { name: t('landing.footer.links.customers'), href: '/#asiakashallinta' },
                { name: t('landing.footer.links.products'), href: '/#tuotehallinta' },
                { name: t('landing.footer.links.invoices'), href: '/#laskutus' },
                { name: t('landing.footer.links.shipping'), href: '/#kuljetukset' },
                { name: t('landing.footer.links.reports'), href: '/#raportit' },
              ].map(item => (
                <li key={item.name}>
                  <a
                    className="text-gray-400 hover:text-white"
                    onClick={(e) => {
                      e.preventDefault()
                      window.location.href = item.href // Forces full reload since the user might already be on the page
                    }}
                  >
                    {item.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          <div className="flex flex-col gap-4">
            <h3 className="text-lg font-medium text-white">{t('landing.footer.company')}</h3>
            <ul className="space-y-2">
              {[
                { name: t('landing.footer.links.about'), href: '/tietoa-meista' },
              ].map(item => (
                <li key={item.name}>
                  <NavLink to={item.href} className="text-gray-400 hover:text-white">
                    {item.name}
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>
          <div className="flex flex-col gap-4">
            <h3 className="text-lg font-medium text-white">{t('landing.footer.support')}</h3>
            <ul className="space-y-2">
              {[{ name: t('landing.footer.links.contact'), href: '/yhteystiedot' }].map(item => (
                <li key={item.name}>
                  <NavLink
                    to={item.href}
                    className="text-gray-400 hover:text-white"
                  >
                    {item.name}
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="border-t border-gray-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-gray-400">© 2025 Siikli</p>
          <div className="flex gap-6">
            <NavLink to="/tietosuoja" className="text-sm text-gray-400 hover:text-white">
              {t('landing.footer.links.privacyPolicy')}
            </NavLink>
            <NavLink to="/kayttoehdot" className="text-sm text-gray-400 hover:text-white">
              {t('landing.footer.links.termsOfService')}
            </NavLink>
            <NavLink to="/evasteet" className="text-sm text-gray-400 hover:text-white">
              {t('landing.footer.links.cookiePolicy')}
            </NavLink>
          </div>
        </div>
      </div>
    </footer>
  )
}
