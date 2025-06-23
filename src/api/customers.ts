import type { DeleteCustomerResponseDto, GetCustomersResponseDto, PostCreateCustomerRequestDto, PutUpdateCustomerRequestDto, PutUpdateCustomerResponseDto } from '../../frontend/src/types/types'
import { Decimal } from 'decimal.js'
import express from 'express'
import { getUser, isAuthenticated } from '../middlewares/permissions'
import prisma from '../prisma'
import { CustomerService } from '../services/customer-service'

export const customersRoute = express.Router()

customersRoute.get(`/api/customers`, isAuthenticated, async (req, res) => {
  console.log('getting customers', req.user)

  const { userId, tenantId } = getUser(req)
  const result = await CustomerService.getCustomers(tenantId, userId)

  res.json({
    customerGroups: result.customerGroups,
    customers: result.customers.map(customer => ({
      ...customer,
      discount: customer.discount.toDecimalPlaces(2).toString(),
    })),
  } satisfies GetCustomersResponseDto)
})

customersRoute.post(`/api/customers`, isAuthenticated, async (req, res) => {
  console.log('creating customer')

  const { userId, tenantId } = getUser(req)
  const body = req.body as PostCreateCustomerRequestDto

  const result = await CustomerService.createCustomer(
    {
      ...body,
      discount: new Decimal(body.discount),
    },
    tenantId,
    userId,
  )

  return res.status(201).json({ id: result.id })
})

customersRoute.put(`/api/customers/:id`, isAuthenticated, async (req, res) => {
  console.log('updating customer')
  const { userId, tenantId } = getUser(req)

  const id = req.params.id
  const body = req.body as PutUpdateCustomerRequestDto
  const result = await CustomerService.updateCustomer(id, {
    ...body,
    discount: new Decimal(body.discount),
  }, tenantId, userId)

  return res.json({
    id: result.id,
  } satisfies PutUpdateCustomerResponseDto)
})

customersRoute.delete(`/api/customers/:id`, isAuthenticated, async (req, res) => {
  const { userId, tenantId } = getUser(req)
  const id = req.params.id

  const result = await CustomerService.deleteCustomer(id, tenantId, userId)

  return res.json({
    deletedOrders: result.deletedOrders,
    deletedCustomer: result.deletedCustomer,
  } satisfies DeleteCustomerResponseDto)
})
