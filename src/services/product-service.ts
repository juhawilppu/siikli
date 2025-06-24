import type { Product } from '@prisma/client'
import type Decimal from 'decimal.js'
import type { GetProductResponse, GetProductResponseDto, ProductTypeResponse } from '../../frontend/src/types/types'
import prisma from '../prisma'
import { formatNumber } from '../utils/money'

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

  async getProducts(tenantId: string): Promise<GetProductResponse[]> {
    const products = await prisma.product.findMany({
      where: {
        tenantId,
      },
      orderBy: {
        name: 'asc',
      },
    })
    return products.map((p) => {
      return {
        id: p.id,
        name: p.name,
        price: p.price,
        price0: p.price0,
        packageSize: p.packageSize ? p.packageSize : null,
        packageType: p.packageType,
        customerGroup: p.customerGroup,
        variety: p.variety,
        type: p.type,
        subtype: p.subtype,
        info: p.info,
      }
    })
  },

  async getProductTypes(tenantId: string): Promise<ProductTypeResponse[]> {
    const rows = await prisma.productType.findMany({
      where: {
        tenantId,
      },
      include: {
        productSubtypes: true,
      },
    })

    return rows.map((r) => {
      return {
        id: r.id,
        name: r.type!,
        orderIndex: r.orderIndex,
        subtypes: r.productSubtypes.map((s) => {
          return {
            id: s.id,
            name: s.subtype!,
            orderIndex: s.orderIndex,
          }
        }),
      }
    })
  },
}
