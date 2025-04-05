import { Button } from '@/components/ui/button'
import { LinearProgress } from '@mui/material'
import axios from 'axios'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { CustomerCard, CustomerSection } from '../components'

export const Products = () => {
  const [customers, setCustomers] = useState<any>()
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate();

  useEffect(() => {
    axios
      .get('/products')
      .then((response) => setCustomers(response.data))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <LinearProgress />
  if (!customers) return <div>Ei tuotteita</div>

  return (
    <>
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Tuotteet</h1>
        <p className="text-muted-foreground">Hinnan muuttaminen ei muuta tuotteiden hintoja nykyisissä tilauksissa,
          vain automaattisesti ehdotettavaa hintaa tulevissa tilauksissa.</p>
      </div>
      <Button onClick={() => navigate(`/products/new`)}>
        Luo uusi tuote
      </Button>
      {customers.map((customer: any) => (
        <CustomerCard key={customer.id}>
          <CustomerSection>{customer.name}</CustomerSection>
        </CustomerCard>
      ))}
    </>
  )
}
