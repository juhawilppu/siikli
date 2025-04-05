import { Button } from '@/components/ui/button'
import { LinearProgress } from '@mui/material'
import axios from 'axios'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { CustomerCard, CustomerSection } from '../components'


export const Customers = () => {
  const [customers, setCustomers] = useState<any>()
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate();


  useEffect(() => {
    axios
      .get('/customers')
      .then((response) => setCustomers(response.data))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <LinearProgress />
  if (!customers) return <div>Ei asiakkaita</div>

  return (
    <>
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Asiakkaat</h1>
        <p className="text-muted-foreground">Järjestä asiakkaat haluamaasi järjestykseen raahaamalla. Järjestystä
          käytetään pakkauslistoissa.</p>
      </div>

      <Button onClick={() => navigate(`/customers/new`)}>
        Luo uusi asiakas
      </Button>

      {customers.map((customer: any) => (
        <CustomerCard key={customer.id}>
          <CustomerSection>{customer.order_index}</CustomerSection>
          <CustomerSection>
            <div>
              <strong>
                {customer.chain} {customer.name}
              </strong>
            </div>
            <div>{customer.company_name}</div>
          </CustomerSection>
          <CustomerSection>
            <div>{customer.address}</div>
            <div>
              {customer.postal_code} {customer.city}
            </div>
          </CustomerSection>
          <CustomerSection>
            <div>Viite {customer.reference}</div>
            <div>Hyvitys {customer.compensation} %</div>
          </CustomerSection>
          <CustomerSection>
            <div></div>
            <Button onClick={() => navigate(`/customers/${customer.id}`)}>
              Muokkaa
            </Button>
          </CustomerSection>
        </CustomerCard>
      ))}
    </>
  )
}
