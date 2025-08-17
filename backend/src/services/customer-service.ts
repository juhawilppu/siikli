import type { Customer } from '@prisma/client'
import type { DeleteCustomerResponseDto, GetCustomersResponse } from '@siikli/shared'
import type Decimal from 'decimal.js'
import prisma from '../prisma'

interface CustomerCreateInput {
  name: string
  companyLegalName: string | null
  discount: Decimal
  invoiceReference: string | null
  streetAddress: string | null
  postalCode: string | null
  city: string | null
  showPriceWithoutTax: boolean
  email: string | null
  phone: string | null
  businessId: string | null
}

export const CustomerService = {
  async getCustomers(tenantId: string, userId: string): Promise<GetCustomersResponse> {
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

    return {
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
        }
      }),
    }
  },
  async getCustomer(id: string, tenantId: string): Promise<Customer | null> {
    const result = await prisma.customer.findUnique({
      where: {
        id,
        tenantId,
      },
    })

    return result
  },
  async createCustomer(input: CustomerCreateInput, tenantId: string, userId: string): Promise<Customer> {
    const {
      name,
      discount,
      streetAddress,
      postalCode,
      city,
      phone,
      email,
      showPriceWithoutTax,
      invoiceReference,
      companyLegalName,
      businessId,
    } = input

    if (discount.gt(100)) {
      throw new Error('Discount cannot be greater than 100%')
    }

    const customer = await prisma.$transaction(async (tx) => {
      const customer = await tx.customer.create({
        data: {
          name,
          tenantId,
          discount,
          streetAddress,
          postalCode,
          city,
          phone,
          email,
          showPriceWithoutTax,
          invoiceReference,
          companyLegalName,
          businessId,
        },
      })

      await tx.log.create({
        data: {
          userId,
          tenantId,
          event: 'create_customer',
          data: {
            customer: customer.id,
            name: customer.name,
          },
        },
      })

      return customer
    })

    return customer
  },
  async updateCustomer(id: string, body: CustomerCreateInput, tenantId: string, userId: string): Promise<Customer> {
    if (body.discount.gt(100)) {
      throw new Error('Discount cannot be greater than 100%')
    }

    const result = await prisma.$transaction(async (tx) => {
      const customer = await tx.customer.update({
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

      await tx.log.create({
        data: {
          userId,
          tenantId,
          event: 'update_customer',
          data: {
            customer: customer.id,
            name: customer.name,
          },
        },
      })

      return customer
    })

    return result
  },
  async deleteCustomer(id: string, tenantId: string, userId: string): Promise<DeleteCustomerResponseDto> {
    const result = await prisma.$transaction(async (tx) => {
      const deletedOrders = await tx.order.deleteMany({
        where: {
          customerId: id,
          tenantId,
        },
      })

      const deletedCustomer = await tx.customer.delete({
        where: {
          id,
          tenantId,
        },
      })

      await tx.log.create({
        data: {
          userId,
          tenantId,
          event: 'delete_customer',
          data: {
            customer: deletedCustomer.id,
            name: deletedCustomer.name,
          },
        },
      })

      return {
        deletedOrders: deletedOrders.count,
        deletedCustomer: deletedCustomer.id,
      } satisfies DeleteCustomerResponseDto
    })

    return result
  },
}
