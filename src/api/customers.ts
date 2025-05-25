import type { DeleteCustomerResponseDto, GetCustomersResponseDto, PostCreateCustomerRequestDto } from '../../frontend/src/types/types'
import express from 'express'
import { getUser, isAuthenticated } from '../middlewares/permissions'
import prisma from '../prisma'

export const customersRoute = express.Router()

customersRoute.get(`/api/customers`, isAuthenticated, async (req, res) => {
  console.log('getting customers', req.user)

  const { userId, tenantId } = getUser(req)

  await prisma.log.create({
    data: {
      userId,
      tenantId,
      event: 'get_customers',
    },
  })

  const result = await prisma.customer.findMany({
    where: {
      tenantId,
    },
    orderBy: {
      name: 'asc',
    },
  })
  const customerGroups = await prisma.customer.findMany({
    where: {
      tenantId,
      customerGroup: {
        not: null,
      },
    },
    select: {
      customerGroup: true,
    },
    distinct: ['customerGroup'],
  })

  res.json({
    customerGroups: customerGroups.map(r => r.customerGroup as string),
    customers: result.map((r) => {
      return {
        id: r.id,
        name: r.name,
        companyLegalName: r.companyLegalName,
        discount: r.discount,
        invoiceReference: r.invoiceReference,
        streetAddress: r.streetAddress,
        postalCode: r.postalCode,
        city: r.city,
        businessId: r.businessId,
        email: r.email,
        phone: r.phone,
        showPriceWithoutTax: r.showPriceWithoutTax,
        tenantId: r.tenantId,
        customerGroup: r.customerGroup,
      }
    }),
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
