import type { DeleteCustomerResponseDto, GetCustomersResponseDto, PostCreateCustomerRequestDto, PutUpdateCustomerRequestDto, PutUpdateCustomerResponseDto } from '@siikli/shared'
import { Decimal } from 'decimal.js'
import express from 'express'
import { getSessionOrThrow, isAuthenticated } from '../middlewares/permissions'
import { CustomerService } from '../services/customer-service'

export const customersRoute = express.Router()

customersRoute.get(`/api/customers`, isAuthenticated, async (req, res) => {
  const { userId, tenantId } = getSessionOrThrow(req)

  const result = await CustomerService.getCustomers(tenantId, userId)

  res.json({
    customers: result.customers.map(customer => ({
      ...customer,
      discount: customer.discount.toDecimalPlaces(2).toString(),
    })),
  } satisfies GetCustomersResponseDto)
})

customersRoute.post(`/api/customers`, isAuthenticated, async (req, res) => {
  const { userId, tenantId } = getSessionOrThrow(req)

  const body = req.body as PostCreateCustomerRequestDto

  const result = await CustomerService.createCustomer(
    {
      ...body,
      discount: body.discount ? new Decimal(body.discount) : new Decimal(0),
    },
    tenantId,
    userId,
  )

  return res.status(201).json({ id: result.id })
})

customersRoute.put(`/api/customers/:id`, isAuthenticated, async (req, res) => {
  const { userId, tenantId } = getSessionOrThrow(req)

  const id = req.params.id
  const body = req.body as PutUpdateCustomerRequestDto
  const result = await CustomerService.updateCustomer(id, {
    ...body,
    discount: new Decimal(body.discount || 0),
  }, tenantId, userId)

  return res.json({
    id: result.id,
  } satisfies PutUpdateCustomerResponseDto)
})

customersRoute.delete(`/api/customers/:id`, isAuthenticated, async (req, res) => {
  const { userId, tenantId } = getSessionOrThrow(req)

  const id = req.params.id

  const result = await CustomerService.deleteCustomer(id, tenantId, userId)

  return res.json({
    deletedOrders: result.deletedOrders,
    deletedCustomer: result.deletedCustomer,
  } satisfies DeleteCustomerResponseDto)
})
