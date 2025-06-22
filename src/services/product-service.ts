import { Product } from "@prisma/client"
import prisma from "../prisma"
import Decimal from "decimal.js"

export const ProductService = {

    async createProduct(input: { name: string, tenantId: string, price: Decimal, price0: Decimal, packageSize: number, packageType: string }): Promise<Product> {
        const {
            name,
            tenantId,
            price,
            price0,
            packageSize,
            packageType,
        } = input

        const product = await prisma.product.create({
            data: {
                name,
                tenantId,
                price,
                price0,
                packageSize,
                packageType,
            },
        })
        
        return product
    }
}