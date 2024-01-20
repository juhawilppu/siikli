import EditIcon from '@mui/icons-material/Edit'
import { Button, LinearProgress } from '@mui/material'
import axios from 'axios'
import { useEffect, useState } from 'react'
import { CustomerCard, CustomerSection, Ingress, Page } from '../components'

export const Customers = () => {
  const [customers, setCustomers] = useState<any>()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    axios
      .get('/customers')
      .then((response) => setCustomers(response.data))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <LinearProgress />
  if (!customers) return <div>Ei asiakkaita</div>

  return (
    <Page>
      <h1>Asiakkaat</h1>
      <Ingress>
        Järjestä asiakkaat haluamaasi järjestykseen raahaamalla. Järjestystä
        käytetään pakkauslistoissa.
      </Ingress>
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
            <Button startIcon={<EditIcon />}>Muokkaa</Button>
          </CustomerSection>
        </CustomerCard>
      ))}
    </Page>
  )
}
