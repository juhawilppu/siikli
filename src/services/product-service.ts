import type Decimal from 'decimal.js'
import type { GetProductResponse, ProductTypeResponse } from '../../frontend/src/types/types'
import prisma from '../prisma'
import { TenantService } from './tenant-service'

export const ProductService = {

  async createProduct(input: { name: string, tenantId: string, userId: string, price: Decimal | null, price0: Decimal | null, packageSize: number | null, packageType: string | null, type: string | null, variety: string | null, info: string | null, subtype: string | null, customerGroup: string | null }): Promise<string> {
    const {
      name,
      tenantId,
      userId,
      price,
      price0,
      packageSize,
      packageType,
      type,
      variety,
      info,
      subtype,
      customerGroup,
    } = input

    if (price && price0 && price.div(1.14).toDecimalPlaces(2).toNumber() !== price0.toDecimalPlaces(2).toNumber()) {
      throw new Error('Price and price0 do not match')
    }

    await TenantService.verifyPackageSizeAndType(packageType, packageSize, tenantId)
    await ProductService.verifyProductTypeAndSubtype({ type, subtype }, tenantId)

    const result = await prisma.product.create({
      data: {
        name,
        type,
        variety,
        info,
        price0,
        price,
        subtype,
        packageSize,
        packageType,
        customerGroup,
        tenantId,
      },
    })
    await prisma.log.create({
      data: {
        userId,
        tenantId,
        event: 'create_product',
        data: {
          product: result.id,
          name: result.name,
        },
      },
    })
    return result.id
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
        type: r.type!,
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

  async verifyProductTypeAndSubtype(body: { type: string | null, subtype: string | null }, tenantId: string) {
    console.log('checking type', body.type)

    if (body.type) {
      const type = await prisma.productType.findFirst({
        where: {
          type: body.type,
          tenantId,
        },
      })
      if (!type) {
        console.log('creating type', body.type)
        await prisma.productType.create({
          data: {
            tenantId,
            type: body.type,
            orderIndex: 0,
          },
        })
      }
      else {
        console.log('type OK')
      }
    }

    if (body.subtype) {
      console.log('checking subtype', body.subtype)
      const subtype = await prisma.productSubtypes.findFirst({
        where: {
          type: body.type,
          subtype: body.subtype,
          tenantId,
        },
      })
      if (!subtype) {
        console.log('creating subtype', body.subtype)
        await prisma.productSubtypes.create({
          data: {
            tenantId,
            type: body.type,
            subtype: body.subtype,
            orderIndex: 0,
          },
        })
      }
      else {
        console.log('subtype OK')
      }
    }
  },

  async deleteProduct(id: string, tenantId: string, userId: string) {
    await prisma.$transaction([
      prisma.product.delete({
        where: {
          id,
          tenantId,
        },
      }),
      prisma.log.create({
        data: {
          userId,
          tenantId,
          event: 'delete_product',
          data: {
            product: id,
          },
        },
      }),
    ])
  },
}
