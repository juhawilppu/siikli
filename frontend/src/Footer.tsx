import { NavLink } from 'react-router-dom'

export default function Footer() {
  return (
    <footer className="w-full py-12 bg-gray-800 text-white" id="yhteystiedot">
      <div className="container px-4 md:px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <span className="font-bold text-2xl text-white">Siikli</span>
              <span className="text-sm font-medium text-gray-400">ERP</span>
            </div>
            <p className="text-gray-400">Tehokas toiminnanohjausjärjestelmä suomalaisille yrityksille.</p>
            {false && (
              <div className="flex gap-4 mt-2">
                {['twitter', 'facebook', 'instagram', 'NavLinkedin'].map(social => (
                  <NavLink key={social} href={`#${social}`} className="text-gray-400 hover:text-white">
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
            <h3 className="text-lg font-medium text-white">Ominaisuudet</h3>
            <ul className="space-y-2">
              {[
                { name: 'Tilausten hallinta', href: '/#tilaukset' },
                { name: 'Asiakashallinta', href: '/#asiakashallinta' },
                { name: 'Tuotehallinta', href: '/#tuotehallinta' },
                { name: 'Laskutus', href: '/#laskutus' },
                { name: 'Kuljetusten hallinta', href: '/#kuljetukset' },
                { name: 'Raportit', href: '/#raportit' },
              ].map(item => (
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
          <div className="flex flex-col gap-4">
            <h3 className="text-lg font-medium text-white">Yritys</h3>
            <ul className="space-y-2">
              {[
                { name: 'Tietoa meistä', href: '/tietoa-meista' },
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
            <h3 className="text-lg font-medium text-white">Tuki</h3>
            <ul className="space-y-2">
              {[{ name: 'Yhteystiedot', href: '/yhteystiedot' }].map(item => (
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
              Tietosuoja
            </NavLink>
            <NavLink to="/kayttoehdot" className="text-sm text-gray-400 hover:text-white">
              Käyttöehdot
            </NavLink>
            <NavLink to="/evasteet" className="text-sm text-gray-400 hover:text-white">
              Evästeet
            </NavLink>
          </div>
        </div>
      </div>
    </footer>
  )
}
