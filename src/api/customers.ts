import { PrismaClient, User } from '@prisma/client'
import express from 'express'
import { CustomerDto, DeleteCustomerResponseDto, GetCustomersResponseDto } from '../../frontend/src/types/types'

export const customersRoute = express.Router()
const prisma = new PrismaClient()

const getTenantId = (req: express.Request, res: express.Response) => {
  const user = req.user as User
  if (!user?.tenantId || user.tenantId !== '232') {
    console.log('Unauthorized - No tenant ID found')
    res.status(401).json({
      error: 'Unauthorized',
      message: 'You must be logged in to access this resource',
      redirect: '/login'
    })
    return null
  }
  return user.tenantId
}

customersRoute.get(`/api/customers`, async (req, res) => {
  console.log('getting customers', req.user)
  const tenantId = getTenantId(req, res)
  if (!tenantId) return // Early return if unauthorized

  const result = await prisma.customer.findMany({
    where: {
      tenantId: tenantId
    },
    orderBy: {
      order_index: 'asc',
    },
  })
  const chains = await prisma.customer.findMany({
    where: {
      tenantId: tenantId
    },
    select: {
      chain: true
    },
    distinct: ['chain'],
  })
  const customerGroups = await prisma.customer.findMany({
    where: {
      tenantId: tenantId,
      customer_group: {
        not: null
      }
    },
    select: {
      customer_group: true
    },
    distinct: ['customer_group'],
  })

  res.json({
    customerGroups: customerGroups.map(r => r.customer_group as string),
    chains: chains.map(r => r.chain as string),
    customers: result.map(r => {
      return {
        id: r.id,
        chain: r.chain,
        name: r.name,
        streetAddress: r.address,
        streetAddress2: r.address2,
        postalCode: r.postal_code,
        compensation: r.compensation,
        businessId: r.business_id,
        city: r.city,
        email: r.email,
        phone: r.phone,
        showPriceWithoutTax: r.show_price_without_tax,
        tenantId: r.tenantId,
        reference: r.reference,
        companyName: r.company_name,
        orderIndex: r.order_index,
        customerGroup: r.customer_group,
      }
    })
  } satisfies GetCustomersResponseDto)
})

customersRoute.post(`/api/customers`, async (req, res) => {
  console.log('creating customer')
  const tenantId = getTenantId(req, res)
  if (!tenantId) return // Early return if unauthorized

  const body = req.body as CustomerDto
  const tenant = await prisma.tenant.findFirstOrThrow()
  const result = await prisma.customer.create({
    data: {
      tenant: {
        connect: {
          id: tenant.id
        }
      },
      chain: body.chain,
      name: body.name,
      compensation: body.compensation,
      address: body.streetAddress,
      address2: body.streetAddress2,
      postal_code: body.postalCode,
      city: body.city,
      email: body.email,
      phone: body.phone,
      show_price_without_tax: body.showPriceWithoutTax,
      reference: body.reference,
      company_name: body.companyName,
      order_index: body.orderIndex,
      business_id: body.businessId,
      customer_group: body.customerGroup,
    }
  })
  res.json(result)
})

customersRoute.put(`/api/customers/reorder`, async (req, res) => {
  console.log('reordering customers')
  const tenantId = getTenantId(req, res)
  if (!tenantId) return // Early return if unauthorized

  const customers = req.body as CustomerDto[]

  try {
    // Update all customers in a transaction to ensure atomicity
    await prisma.$transaction(
      customers.map(customer =>
        prisma.customer.update({
          where: { id: customer.id },
          data: { order_index: customer.orderIndex }
        })
      )
    )

    res.json({ success: true })
  } catch (error) {
    console.error('Failed to reorder customers:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to update customer order'
    })
  }
})

customersRoute.put(`/api/customers/:id`, async (req, res) => {
  console.log('updating customer')
  const tenantId = getTenantId(req, res)
  if (!tenantId) return // Early return if unauthorized

  const id = req.params.id
  const body = req.body as CustomerDto
  const tenant = await prisma.tenant.findFirstOrThrow()
  const result = await prisma.customer.update({
    where: {
      id: id
    },
    data: {
      tenant: {
        connect: {
          id: tenant.id
        }
      },
      chain: body.chain,
      name: body.name,
      compensation: body.compensation,
      address: body.streetAddress,
      address2: body.streetAddress2,
      postal_code: body.postalCode,
      city: body.city,
      email: body.email,
      phone: body.phone,
      show_price_without_tax: body.showPriceWithoutTax,
      reference: body.reference,
      company_name: body.companyName,
      order_index: body.orderIndex,
      business_id: body.businessId,
      customer_group: body.customerGroup,
    }
  })
  res.json(result)
})

customersRoute.delete(`/api/customers/:id`, async (req, res) => {
  const tenantId = getTenantId(req, res)
  if (!tenantId) return // Early return if unauthorized

  const id = req.params.id
  console.log('deleting customer', id)

  const deletedOrders = await prisma.order.deleteMany({
    where: {
      customerId: id
    }
  })

  const result = await prisma.customer.delete({
    where: {
      id: id
    }
  })
  res.json({
    deletedOrders: deletedOrders.count,
    deletedCustomer: result.id
  } satisfies DeleteCustomerResponseDto)
})