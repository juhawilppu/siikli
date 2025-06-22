import { Customer } from "@prisma/client"
import prisma from "../prisma"

interface CustomerCreateInput {
    name: string
    tenantId: string
    discount: number
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
    }
}