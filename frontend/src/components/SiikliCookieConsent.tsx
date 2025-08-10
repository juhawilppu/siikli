import CookieConsent from 'react-cookie-consent'
import { NavLink } from 'react-router-dom'

export default function SiikliCookieConsent({ onAccept, onDecline }: { onAccept: () => void, onDecline: () => void }) {
  return (
    <CookieConsent
      location="bottom"
      buttonText="Hyväksy kaikki"
      declineButtonText="Vain välttämättömät"
      enableDeclineButton
      onAccept={() => {
        onAccept()
        localStorage.setItem('cookie-consent', 'accepted')
      }}
      onDecline={() => {
        onDecline()
        localStorage.setItem('cookie-consent', 'declined')
      }}
      style={{
        background: '#f9fafb', // tailwind: gray-50
        color: '#1f2937', // tailwind: gray-800
        fontSize: '14px',
        padding: '16px',
        gap: '16px',
        alignItems: 'center',
        borderTop: '1px solid #d1d5db',
      }}
      buttonStyle={{
        background: '#2563eb', // (tailwind: blue-600)
        color: 'white',
        fontSize: '14px',
        borderRadius: '8px',
        padding: '10px 16px',
        marginRight: '8px',
        border: 'none',
      }}
      declineButtonStyle={{
        background: '#d1d5db', // vaalea harmaa (tailwind: gray-300)
        color: '#1f2937', // tumma teksti
        fontSize: '14px',
        borderRadius: '8px',
        padding: '10px 16px',
        border: 'none',
      }}
    >
      <div>
        Käytämme evästeitä sivuston toiminnan ja kehittämisen tueksi. Voit valita, mitä hyväksyt.
        {' '}
        <NavLink to="/evasteet" style={{ textDecoration: 'underline', color: '#1d4ed8' /* tailwind: blue-700 */ }}>
          Lue lisää evästeistä
        </NavLink>
        .
      </div>
    </CookieConsent>

  )
}
