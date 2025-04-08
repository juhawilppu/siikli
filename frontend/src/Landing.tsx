import google from '../public/google.webp'

export const Landing = () => (
  <>
    <h1>Tervetuloa Siikliin!</h1>
    <p>Aloita kirjautumalla sisään.</p>
    <p>
      <a href='/auth/google'>
        <img src={google} style={{ width: '200px' }}></img>
      </a>
    </p>
  </>
)
