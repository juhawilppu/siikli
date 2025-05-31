import type { GetCustomerRequestDto, GetCustomersResponseDto } from '@/types/types'
import axios from 'axios'
import {
  Edit,
  Filter,
  Trash2,
} from 'lucide-react'
import { useEffect, useState } from 'react'
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
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { useToast } from '@/hooks/use-toast'
import SiikliPage from '@/SiikliPage'
import { NewCustomer } from './NewCustomer'

function SortableTableRow({ customer, onEdit, onDelete }: {
  customer: GetCustomerRequestDto
  onEdit: (customer: GetCustomerRequestDto) => void
  onDelete: (id: string) => void
}) {
  return (
    <TableRow>
      <TableCell className="font-medium">{customer.name}</TableCell>
      <TableCell>{customer.city}</TableCell>
      <TableCell>{customer.customerGroup}</TableCell>
      <TableCell>
        <div className="text-sm">
          {customer.email && (
            <div>
              <span className="text-gray-500">Email:</span>
              {' '}
              {customer.email}
            </div>
          )}
          {customer.phone && (
            <div>
              <span className="text-gray-500">Puh:</span>
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
                <p>Muokkaa</p>
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
                <p>Poista</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </TableCell>
    </TableRow>
  )
}

export function Customers() {
  const [customers, setCustomers] = useState<GetCustomerRequestDto[]>([])
  const [customerGroups, setCustomerGroups] = useState<string[]>([])

  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [customerToEdit, setCustomerToEdit] = useState<GetCustomerRequestDto>()
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [customerIdToDelete, setCustomerIdToDelete] = useState<string | null>(null)
  const [customerGroupFilter, setCustomerGroupFilter] = useState<string>('all')
  const { toast } = useToast()

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value)
  }

  const refreshCustomers = () => {
    axios
      .get<GetCustomersResponseDto>('/customers')
      .then((response) => {
        setCustomers(response.data.customers)
        setCustomerGroups(response.data.customerGroups)
      })
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    refreshCustomers()
  }, [])

  // Filter and sort customers
  const filteredCustomers = customers
    .filter((customer) => {
      // Searchs
      const matchesSearch
        = customer.name.toLowerCase().includes(searchQuery.toLowerCase())
          || customer.companyLegalName?.toLowerCase().includes(searchQuery.toLowerCase())
          || customer.city?.toLowerCase().includes(searchQuery.toLowerCase())
          || customer.businessId?.toLowerCase().includes(searchQuery.toLowerCase())
          || customer.email?.toLowerCase().includes(searchQuery.toLowerCase())
          || customer.phone?.toLowerCase().includes(searchQuery.toLowerCase())

      // Customer group filter
      const matchesGroup = customerGroupFilter === 'all' || customer.customerGroup === customerGroupFilter

      return matchesSearch && matchesGroup
    })

  // Customer edit
  const startEdit = (customer: GetCustomerRequestDto) => {
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
          title: 'Asiakas poistettu',
          description: `Asiakas "${customerToDelete.name}" on poistettu onnistuneesti.`,
        })
      })
      .catch((error) => {
        console.error(error)
        toast({
          title: 'Virhe',
          description: 'Asiakkaan poisto epäonnistui.',
          variant: 'destructive',
        })
      })
  }

  if (loading)
    return <SiikliPage title="Asiakkaat" description="Hallitse asiakastietoja" />
  if (!customers)
    return <div>Ei asiakkaita</div>

  return (
    <>
      <SiikliPage title="Asiakkaat" description="Hallitse asiakastietoja">

        {/* Toiminnot ja suodattimet */}
        <div className="mb-4 flex flex-col sm:flex-row gap-4 justify-between">
          <div className="flex flex-wrap gap-2">
            <Input
              type="text"
              placeholder="Hae asiakasta"
              value={searchQuery}
              onChange={handleSearch}
              className="w-full sm:w-auto"
            />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="gap-1">
                  <Filter className="h-4 w-4 mr-1" />
                  Asiakasryhmä:
                  {' '}
                  {customerGroupFilter === 'all' ? 'Kaikki' : customerGroupFilter}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => setCustomerGroupFilter('all')}>
                  Kaikki asiakasryhmät
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                {customerGroups.map(customerGroup => (
                  <DropdownMenuItem key={customerGroup} onClick={() => setCustomerGroupFilter(customerGroup)}>
                    {customerGroup}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <Button onClick={() => setShowCreateDialog(true)}>Lisää asiakas</Button>
        </div>

        {/* Customer table */}
        <Card className="shadow-md">
          <CardHeader className="border-b bg-gray-50 py-4 pl-2">
            <CardTitle>Asiakasluettelo</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="relative">
              <Table>
                <TableHeader className="bg-gray-50 sticky top-0 z-10">
                  <TableRow>
                    <TableHead>
                      Nimi
                    </TableHead>
                    <TableHead>Kaupunki</TableHead>
                    <TableHead>
                      Asiakasryhmä
                    </TableHead>
                    <TableHead>Yhteystiedot</TableHead>
                    <TableHead className="text-right">Toiminnot</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCustomers.length === 0
                    ? (
                        <TableRow>
                          <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                            Ei asiakkaita
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
          forwaredCustomerGroups={customerGroups}
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
            <AlertDialogTitle>Haluatko varmasti poistaa tämän asiakkaan?</AlertDialogTitle>
            <AlertDialogDescription>
              <p>Tätä toimintoa ei voi peruuttaa enää jälkikäteen. Asiakkaan tiedot poistetaan pysyvästi järjestelmästä.</p>
              <p>Jos asiakkaalla on tilauksia, ne poistetaan myös. Varmista, että olet laskuttanut kaikki asiakkaan tilaukset.</p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Peruuta</AlertDialogCancel>
            <AlertDialogAction onClick={confirmCustomerDeletion} className="bg-red-500 hover:bg-red-600">
              Poista
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
