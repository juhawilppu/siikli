import type { CustomerDto, DeleteCustomerResponseDto, GetCustomersResponseDto } from '../../frontend/src/types/types'
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
      orderIndex: 'asc',
    },
  })
  const chains = await prisma.customer.findMany({
    where: {
      tenantId,
    },
    select: {
      chain: true,
    },
    distinct: ['chain'],
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
    chains: chains.map(r => r.chain as string),
    customers: result.map((r) => {
      return {
        id: r.id,
        chain: r.chain,
        name: r.name,
        streetAddress: r.address,
        streetAddress2: r.address2,
        postalCode: r.postalCode,
        compensation: r.compensation,
        businessId: r.businessId,
        city: r.city,
        email: r.email,
        phone: r.phone,
        showPriceWithoutTax: r.showPriceWithoutTax,
        tenantId: r.tenantId,
        reference: r.reference,
        companyName: r.companyName,
        orderIndex: r.orderIndex,
        customerGroup: r.customerGroup,
      }
    }),
  } satisfies GetCustomersResponseDto)
})

customersRoute.post(`/api/customers`, isAuthenticated, async (req, res) => {
  console.log('creating customer')

  const { userId, tenantId } = getUser(req)

  const body = req.body as CustomerDto
  const result = await prisma.customer.create({
    data: {
      tenant: {
        connect: {
          id: tenantId,
        },
      },
      chain: body.chain,
      name: body.name,
      compensation: body.compensation,
      address: body.streetAddress,
      address2: body.streetAddress2,
      postalCode: body.postalCode,
      city: body.city,
      email: body.email,
      phone: body.phone,
      showPriceWithoutTax: body.showPriceWithoutTax,
      reference: body.reference,
      companyName: body.companyName,
      orderIndex: body.orderIndex,
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
  res.json(result)
})

customersRoute.put(`/api/customers/reorder`, isAuthenticated, async (req, res) => {
  console.log('reordering customers')
  const { userId, tenantId } = getUser(req)

  const customers = req.body as CustomerDto[]

  try {
    // Update all customers in a transaction to ensure atomicity
    await prisma.$transaction(
      customers.map(customer =>
        prisma.customer.update({
          where: { id: customer.id, tenantId },
          data: { orderIndex: customer.orderIndex },
        }),
      ),
    )

    res.json({ success: true })
  }
  catch (error) {
    console.error('Failed to reorder customers:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to update customer order',
    })
  }
})

customersRoute.put(`/api/customers/:id`, isAuthenticated, async (req, res) => {
  console.log('updating customer')
  const { userId, tenantId } = getUser(req)

  const id = req.params.id
  const body = req.body as CustomerDto
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
      chain: body.chain,
      name: body.name,
      compensation: body.compensation,
      address: body.streetAddress,
      address2: body.streetAddress2,
      postalCode: body.postalCode,
      city: body.city,
      email: body.email,
      phone: body.phone,
      showPriceWithoutTax: body.showPriceWithoutTax,
      reference: body.reference,
      companyName: body.companyName,
      orderIndex: body.orderIndex,
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
