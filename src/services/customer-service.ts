import type { Customer } from '@prisma/client'
import type Decimal from 'decimal.js'
import type { GetCustomersResponse } from '../../frontend/src/types/types'
import prisma from '../prisma'

interface CustomerCreateInput {
  name: string
  tenantId: string
  discount: Decimal
  streetAddress: string
  postalCode: string
  city: string
  phone: string
  email: string
  showPriceWithoutTax: boolean
  invoiceReference: string
  companyLegalName: string
  businessId: string
  customerGroup: string
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

    return {
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
    }
  },
  async createCustomer(input: CustomerCreateInput): Promise<Customer> {
    const {
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
      customerGroup,
    } = input

    const customer = await prisma.customer.create({
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
        customerGroup,

      },
    })

    return customer
  },
}
