import { PrismaClient } from '@prisma/client'
import express from 'express'
import { CustomerDto, DeleteCustomerResponseDto, GetCustomersResponseDto } from '../../frontend/src/types/types'

export const customersRoute = express.Router()
const prisma = new PrismaClient()

customersRoute.get(`/api/customers`, async (req, res) => {
  console.log('getting customers')
  const result = await prisma.customer.findMany({
    orderBy: {
      order_index: 'asc',
    },
  })
  const chains = await prisma.customer.findMany({
    select: {
      chain: true
    },
    distinct: ['chain'],
  })
  const customerGroups = await prisma.customer.findMany({
    select: {
      customer_group: true
    },
    distinct: ['customer_group'],
    where: {
      customer_group: {
        not: null
      }
    }
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

customersRoute.put(`/api/customers/:id`, async (req, res) => {
  console.log('updating customer')
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