import { useAuth } from './app/context/AuthContext'
import MainApp from './app/index'
import LoginPage from './login/LoginPage'

export default function LoginOrApp() {
  const { user } = useAuth()

  if (user && user.authenticated) {
    return <MainApp />
  }
  else {
    return <LoginPage />
  }
}
