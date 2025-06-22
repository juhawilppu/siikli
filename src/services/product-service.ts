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

        if (price.div(1.14).toDecimalPlaces(2).toNumber() !== price0.toDecimalPlaces(2).toNumber()) {
            throw new Error('Price and price0 do not match')
        }

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
    },

    async getProducts(input: {tenantId: string}): Promise<Product[]> {
        const {
            tenantId,
        } = input

        const products = await prisma.product.findMany({
            where: {
                tenantId,
            },
        })

        return products
    }
}