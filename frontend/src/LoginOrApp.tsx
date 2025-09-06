import { useAuth } from './app/context/AuthContext'
import MainApp from './app/index'
import LoginPage from './login/LoginPage'

export default function LoginOrApp() {
  const { user } = useAuth()

  if (user && user.authenticated) {
    console.log('user', user)
    return <MainApp />
  }
  else {
    console.log('user not found')
    return <LoginPage />
  }
}
