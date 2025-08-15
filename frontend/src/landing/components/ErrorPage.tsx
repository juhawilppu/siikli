import { useNavigate } from 'react-router-dom'
import { Button } from '../../components/ui/button'

export default function ErrorPage() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen flex flex-col items-center justify-start">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-red-500 mb-4">Kirjautuminen epäonnistui</h1>
        <p className="text-gray-600 mb-8">
          Ota yhteyttä ylläpitoon: juha.wilppu@siikli.fi.
        </p>
        <Button
          onClick={() => navigate('/')}
          className="bg-blue-600 hover:bg-blue-700"
        >
          Palaa etusivulle
        </Button>
      </div>
    </div>
  )
}
