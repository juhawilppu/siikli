import type { DeleteCustomerResponse, GetCustomersResponse, PutUpdateCustomerResponseDto } from '@siikli/shared'
import { IdParams, PostCreateCustomerRequest } from '@siikli/shared'
import { Decimal } from 'decimal.js'
import express from 'express'
import { getSessionOrThrow, isAuthenticated } from '../middlewares/permissions'
import { CustomerService } from '../services/customer-service'
import { serializeNumber } from '../utils/serialization'

export const customersRoute = express.Router()

customersRoute.get(`/api/customers`, isAuthenticated, async (req, res) => {
  const { userId, tenantId } = getSessionOrThrow(req)

  const result = await CustomerService.getCustomers(tenantId, userId)

  res.json({
    customers: result.customers.map(customer => ({
      ...customer,
      discount: serializeNumber(customer.discount),
    })),
  } satisfies GetCustomersResponse)
})

customersRoute.post(`/api/customers`, isAuthenticated, async (req, res) => {
  const { userId, tenantId } = getSessionOrThrow(req)
  const body = PostCreateCustomerRequest.parse(req.body)

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
  const { id } = IdParams.parse(req.params)
  const body = PostCreateCustomerRequest.parse(req.body)

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
  const { id } = IdParams.parse(req.params)

  const result = await CustomerService.deleteCustomer(id, tenantId, userId)

  return res.json({
    deletedOrders: result.deletedOrders,
    deletedCustomer: result.deletedCustomer,
  } satisfies DeleteCustomerResponse)
})
