import type { GetOnboardingResponseDto } from '@siikli/shared'

import { Check, ChevronRight, CreditCard, Receipt, ShoppingCart, Truck, Users } from 'lucide-react'

import { useNavigate } from 'react-router-dom'
import { Card, CardContent } from '@/components/ui/card'

export function FunnelBar({ onboarding }: { onboarding: GetOnboardingResponseDto }) {
  const navigate = useNavigate()

  const steps = [
    {
      id: 'create-product',
      title: 'Luo tuote',
      description: 'Lisää ensimmäinen tuote',
      icon: ShoppingCart,
      completed: onboarding.productCreated,
      url: '/app/products',
      current: false,
    },
    {
      id: 'create-customer',
      title: 'Luo asiakas',
      description: 'Lisää ensimmäinen asiakas',
      icon: Users,
      completed: onboarding.customerCreated,
      url: '/app/customers',
    },
    {
      id: 'create-order',
      title: 'Luo tilaus',
      description: 'Käsittele ensimmäinen tilaus',
      icon: ShoppingCart,
      completed: onboarding.orderCreated,
      url: '/app/orders',
    },
    {
      id: 'print-waybill',
      title: 'Tulosta kuormakirja',
      description: 'Luo kuormakirja tilaukselle',
      icon: Truck,
      completed: onboarding.waybillCreated,
      url: '/app/waybills',
    },
    {
      id: 'add-bank-account',
      title: 'Lisää laskutustiedot',
      description: 'Lisää IBAN ja pankin nimi',
      icon: CreditCard,
      completed: onboarding.bankInformationSet,
      url: '/app/own-company',
    },
    {
      id: 'print-invoice',
      title: 'Tulosta lasku',
      description: 'Luo asiakkaalle lasku',
      icon: Receipt,
      completed: onboarding.invoiceCreated,
      url: '/app/invoices',
    },
  ]

  const completedSteps = steps.filter(step => step.completed).length
  const totalSteps = steps.length

  const handleStepClick = (stepId: string) => {
    navigate(steps.find(step => step.id === stepId)?.url ?? '/')
  }

  return (
    <Card className="mb-6 border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50">
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <div className="h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
              <h3 className="font-semibold text-blue-900">Vaiheet</h3>
              <span className="text-sm text-blue-600 bg-blue-100 px-2 py-1 rounded-full">
                {completedSteps}
                /
                {totalSteps}
                {' '}
                suoritettu
              </span>
            </div>
          </div>

        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          {steps.map((step, index) => {
            const Icon = step.icon
            return (
              <div
                key={step.id}
                className={`
                  relative p-3 rounded-lg border transition-all cursor-pointer
                  ${
              step.completed
                ? 'bg-green-50 border-green-200 hover:bg-green-100'
                : step.current
                  ? 'bg-blue-100 border-blue-300 hover:bg-blue-200 ring-2 ring-blue-200'
                  : 'bg-white border-gray-200 hover:bg-gray-50'
              }
                `}
                onClick={() => !step.completed && handleStepClick(step.id)}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`
                    flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center
                    ${
              step.completed
                ? 'bg-green-500 text-white'
                : step.current
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 text-gray-500'
              }
                  `}
                  >
                    {step.completed ? <Check className="h-4 w-4" /> : <Icon className="h-4 w-4" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1">
                      {!step.completed && step.current && <ChevronRight className="h-3 w-3 text-blue-500" />}
                    </div>
                    <h4
                      className={`
                      text-sm font-medium truncate
                      ${step.completed ? 'text-green-800' : step.current ? 'text-blue-800' : 'text-gray-700'}
                    `}
                    >
                      {index + 1}
                      .
                      {' '}
                      {step.title}
                    </h4>
                    <p
                      className={`
                      text-xs truncate
                      ${step.completed ? 'text-green-600' : step.current ? 'text-blue-600' : 'text-gray-500'}
                    `}
                    >
                      {step.description}
                    </p>
                  </div>
                </div>

                {step.completed && (
                  <div className="absolute top-1 right-1">
                    <div className="w-2 h-2 bg-green-500 rounded-full" />
                  </div>
                )}
              </div>
            )
          })}
        </div>

      </CardContent>
    </Card>
  )
}
