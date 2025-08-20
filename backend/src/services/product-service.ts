import type { GetProductResponse, GetProductResponseDto } from '@siikli/shared'
import type Decimal from 'decimal.js'
import prisma from '../prisma'
import { TenantService } from './tenant-service'

export const ProductService = {

  async createProduct(input: { name: string, tenantId: string, userId: string, price: Decimal | null, packageSize: number | null, packageType: string | null }): Promise<string> {
    const {
      name,
      tenantId,
      userId,
      price,
      packageSize,
      packageType,
    } = input

    await TenantService.verifyPackageSizeAndType(packageType, packageSize, tenantId)

    const result = await prisma.product.create({
      data: {
        name,
        price,
        packageSize,
        packageType,
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
        packageSize: p.packageSize ? p.packageSize : null,
        packageType: p.packageType,
      }
    })
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

  async updateProduct(id: string, tenantId: string, body: GetProductResponseDto, userId: string): Promise<void> {
    await TenantService.verifyPackageSizeAndType(body.packageType, body.packageSize, tenantId)

    await prisma.product.update({
      data: {
        name: body.name,
        price: body.price,
        packageSize: body.packageSize,
        packageType: body.packageType,
      },
      where: {
        id,
        tenantId,
      },
    })
    await prisma.log.create({
      data: {
        userId,
        tenantId,
        event: 'update_product',
        data: {
          product: id,
          name: body.name,
        },
      },
    })
  },
}
