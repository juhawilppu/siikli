import type { DeleteCustomerResponseDto, GetCustomersResponseDto, PostCreateCustomerRequestDto } from '../../frontend/src/types/types'
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
  const result = await prisma.customer.create({
    data: {
      tenant: {
        connect: {
          id: tenantId,
        },
      },
      name: body.name,
      companyLegalName: body.companyLegalName,
      discount: body.discount || 0,
      invoiceReference: body.invoiceReference,
      streetAddress: body.streetAddress,
      postalCode: body.postalCode,
      city: body.city,
      email: body.email,
      phone: body.phone,
      showPriceWithoutTax: body.showPriceWithoutTax,
      businessId: body.businessId,
      customerGroup: body.customerGroup,
    },
  })

  await prisma.log.create({
    data: {
      userId,
      tenantId,
      event: 'create_customer',
      data: {
        customer: result.id,
        name: result.name,
      },
    },
  })
  res.status(201).json({ id: result.id })
})

customersRoute.put(`/api/customers/:id`, isAuthenticated, async (req, res) => {
  console.log('updating customer')
  const { userId, tenantId } = getUser(req)

  const id = req.params.id
  const body = req.body as PostCreateCustomerRequestDto
  const result = await prisma.customer.update({
    where: {
      id,
      tenantId,
    },
    data: {
      tenant: {
        connect: {
          id: tenantId,
        },
      },
      name: body.name,
      companyLegalName: body.companyLegalName,
      discount: body.discount,
      streetAddress: body.streetAddress,
      postalCode: body.postalCode,
      city: body.city,
      email: body.email,
      phone: body.phone,
      showPriceWithoutTax: body.showPriceWithoutTax,
      invoiceReference: body.invoiceReference,
      businessId: body.businessId,
      customerGroup: body.customerGroup,
    },
  })
  await prisma.log.create({
    data: {
      userId,
      tenantId,
      event: 'update_customer',
      data: {
        customer: result.id,
        name: result.name,
      },
    },
  })

  res.json(result)
})

customersRoute.delete(`/api/customers/:id`, isAuthenticated, async (req, res) => {
  const { userId, tenantId } = getUser(req)

  const id = req.params.id
  console.log('deleting customer', id)

  const deletedOrders = await prisma.order.deleteMany({
    where: {
      customerId: id,
      tenantId,
    },
  })

  const result = await prisma.customer.delete({
    where: {
      id,
      tenantId,
    },
  })
  await prisma.log.create({
    data: {
      userId,
      tenantId,
      event: 'delete_customer',
      data: {
        customer: result.id,
        name: result.name,
      },
    },
  })
  res.json({
    deletedOrders: deletedOrders.count,
    deletedCustomer: result.id,
  } satisfies DeleteCustomerResponseDto)
})
