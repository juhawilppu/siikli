import type { GetCustomerResponse, GetCustomersResponse } from '@siikli/shared'
import axios from 'axios'
import {
  Edit,
  Plus,
  Trash2,
} from 'lucide-react'
import { useEffect, useState } from 'react'
import SiikliPage from '@/app/components/SiikliPage'
import { useToast } from '@/app/hooks/use-toast'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { useTranslation } from '@/lib/translations'
import { NewCustomer } from './CustomerForm'

function SortableTableRow({ customer, onEdit, onDelete }: {
  customer: GetCustomerResponse
  onEdit: (customer: GetCustomerResponse) => void
  onDelete: (id: string) => void
}) {
  const t = useTranslation()
  return (
    <TableRow>
      <TableCell className="font-medium">
        <Button
          variant="ghost"
          className="text-blue-500 font-bold"
          size="default"
          onClick={() => onEdit(customer)}
        >
          {customer.name}
        </Button>
      </TableCell>
      <TableCell>{customer.city}</TableCell>
      <TableCell>
        <div className="text-sm">
          {customer.email && (
            <div>
              <span className="text-gray-500">
                {t('customerForm.email')}
                :
              </span>
              {' '}
              {customer.email}
            </div>
          )}
          {customer.phone && (
            <div>
              <span className="text-gray-500">
                {t('customerForm.phone')}
                :
              </span>
              {' '}
              {customer.phone}
            </div>
          )}
        </div>
      </TableCell>
      <TableCell className="text-right">
        <div className="flex justify-end gap-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => onEdit(customer)}
                >
                  <Edit className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{t('customerForm.edit')}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50"
                  onClick={() => onDelete(customer.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{t('customerForm.delete')}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </TableCell>
    </TableRow>
  )
}

export function Customers() {
  const t = useTranslation()

  const [loading, setLoading] = useState(true)
  const [customers, setCustomers] = useState<GetCustomerResponse[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [customerToEdit, setCustomerToEdit] = useState<GetCustomerResponse>()
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [customerIdToDelete, setCustomerIdToDelete] = useState<string | null>(null)
  const { toast } = useToast()

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value)
  }

  const refreshCustomers = () => {
    axios
      .get<GetCustomersResponse>('/customers')
      .then((response) => {
        setCustomers(response.data.customers)
      })
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    refreshCustomers()
  }, [])

  // Filter and sort customers
  const filteredCustomers = customers
    .filter((customer) => {
      const matchesSearch
        = customer.name.toLowerCase().includes(searchQuery.toLowerCase())
          || customer.companyLegalName?.toLowerCase().includes(searchQuery.toLowerCase())
          || customer.city?.toLowerCase().includes(searchQuery.toLowerCase())
          || customer.businessId?.toLowerCase().includes(searchQuery.toLowerCase())
          || customer.email?.toLowerCase().includes(searchQuery.toLowerCase())
          || customer.phone?.toLowerCase().includes(searchQuery.toLowerCase())

      return matchesSearch
    })

  // Customer edit
  const startEdit = (customer: GetCustomerResponse) => {
    setCustomerToEdit({ ...customer })
    setShowCreateDialog(true)
  }

  // Customer deletion
  const deleteCustomer = (id: string) => {
    setCustomerIdToDelete(id)
  }

  const confirmCustomerDeletion = () => {
    if (!customerIdToDelete)
      return

    const customerToDelete = customers.find(a => a.id === customerIdToDelete)
    if (!customerToDelete)
      return

    axios
      .delete(`/customers/${customerIdToDelete}`)
      .then(() => {
        setCustomers(customers.filter(a => a.id !== customerIdToDelete))
        setCustomerIdToDelete(null)
        toast({
          title: t('customerForm.delete.success.title'),
          description: t('customerForm.delete.success.description'),
        })
      })
      .catch((error) => {
        console.error(error)
        toast({
          title: t('customerForm.delete.error.title'),
          description: t('customerForm.delete.error.description'),
          variant: 'destructive',
        })
      })
  }

  if (loading)
    return <SiikliPage title={t('customers.title')} description={t('customers.description')} />
  if (!customers)
    return <div>{t('customers.emptyState.description')}</div>

  return (
    <>
      <SiikliPage
        title={t('customers.title')}
        description={t('customers.description')}
        mainAction={(
          <Button onClick={() => setShowCreateDialog(true)}>
            <Plus className="h-4 w-4 mr-2" />
            {' '}
            {t('customers.createButton')}
          </Button>
        )}
      >
        <div className="mb-4 flex flex-col sm:flex-row gap-4 justify-between">
          <div className="flex flex-wrap gap-2">
            <Input
              type="text"
              placeholder={t('customers.search.placeholder')}
              value={searchQuery}
              onChange={handleSearch}
              className="h-8 w-full md:w-[300px] bg-white"
            />
          </div>
        </div>

        {/* Customer table */}
        <Card className="shadow-md">
          <CardHeader className="border-b bg-gray-50 py-4 pl-2">
            <CardTitle>{t('customers.list.title')}</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="relative">
              <Table>
                <TableHeader className="bg-gray-50 sticky top-0 z-10">
                  <TableRow>
                    <TableHead>
                      {t('customers.list.name')}
                    </TableHead>
                    <TableHead>{t('customers.list.city')}</TableHead>
                    <TableHead>{t('customers.list.contact')}</TableHead>
                    <TableHead className="text-right">{t('customers.list.actions')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCustomers.length === 0
                    ? (
                        <TableRow>
                          <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                            {t('customers.emptyState.description')}
                          </TableCell>
                        </TableRow>
                      )
                    : (
                        filteredCustomers.map(customer => (
                          <SortableTableRow
                            key={customer.id}
                            customer={customer}
                            onEdit={startEdit}
                            onDelete={deleteCustomer}
                          />
                        ))
                      )}
                </TableBody>
              </Table>
            </div>

          </CardContent>
        </Card>
      </SiikliPage>

      {(showCreateDialog || customerToEdit) && (
        <NewCustomer
          closeDialog={
            () => {
              setShowCreateDialog(false)
              setCustomerToEdit(undefined)
            }
          }
          customerToEdit={customerToEdit}
          onSave={() => {
            refreshCustomers()
            setShowCreateDialog(false)
            setCustomerToEdit(undefined)
          }}
        />
      )}
      {/* Delete dialog */}
      <AlertDialog open={!!customerIdToDelete} onOpenChange={open => !open && setCustomerIdToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('customers.deleteDialog.title')}</AlertDialogTitle>
            <AlertDialogDescription>
              <p>
                {t('customers.deleteDialog.description.warning')}
              </p>
              <p className="pt-2">{t('customers.deleteDialog.description.details')}</p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('customers.deleteDialog.cancel')}</AlertDialogCancel>
            <AlertDialogAction onClick={confirmCustomerDeletion} className="bg-red-500 hover:bg-red-600">
              {t('customers.deleteDialog.confirm')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
