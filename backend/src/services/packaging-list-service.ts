import type { PackagingListGroupedByCustomer, PackagingListGroupedByProduct } from '@siikli/shared'
import { Decimal } from '@prisma/client/runtime/library'
import prisma from '../prisma'

export const PackagingListService = {
  getPackagingListGroupedByCustomer: async (tenantId: string, deliveryDate: string): Promise<PackagingListGroupedByCustomer> => {
    const results = await prisma.$queryRawUnsafe<any>(`
    SELECT
      customer_id,
      c.name AS customer_name,
      product_id,
      p.name AS product_name,
      SUM(amount)::numeric AS amount,
      op.package_size,
      op.package_type,
      freetext
    FROM "order" o
    LEFT JOIN customer c ON (c.id = o.customer_id)
    LEFT JOIN order_row op ON (op.order_id = o.id)
    LEFT JOIN product p ON (p.id = op.product_id)
    WHERE DATE(delivery_date) = '${deliveryDate}' and o.tenant_id = '${tenantId}'
    GROUP BY
      customer_id,
      c.name,
      product_id,
      p.name,
      op.package_size,
      op.package_type,
      freetext
    ORDER BY
      customer_name ASC,
      op.package_type ASC,
      op.package_size ASC,
      amount ASC,
      product_name ASC
  `)

    return {
      deliveryDate,
      groupedBy: 'customer',
      rows: results.map((r) => {
        return {
          customerId: r.customer_id,
          customerName: r.customer_name,
          productType: r.product_type,
          productName: r.product_name,
          packageSize: r.package_size,
          packageType: r.package_type,
          freetext: r.freetext,
          amount: new Decimal(r.amount),
        }
      }),
    } satisfies PackagingListGroupedByCustomer
  },
  getPackagingListGroupedByProduct: async (tenantId: string, deliveryDate: string): Promise<PackagingListGroupedByProduct> => {
    const results = await prisma.$queryRawUnsafe<any>(`
            SELECT
            product_id,
            p.name AS product_name,
            SUM(amount)::numeric AS amount,
            op.package_size,
            op.package_type
            FROM "order" o
            LEFT JOIN order_row op ON (op.order_id = o.id)
            LEFT JOIN product p ON (p.id = op.product_id)
            WHERE delivery_date = '${deliveryDate}' and o.tenant_id = '${tenantId}'
            GROUP BY
            product_id,
            name,
            op.package_size,
            op.package_type
            ORDER BY
            product_name ASC,
            op.package_type ASC,
            op.package_size ASC,
            amount ASC;
            `)

    return {
      deliveryDate,
      groupedBy: 'product',
      rows: results.map((r) => {
        return {
          productId: r.product_id,
          productName: r.product_name,
          packageSize: r.package_size,
          packageType: r.package_type,
          amount: new Decimal(r.amount),
        }
      }),
    } satisfies PackagingListGroupedByProduct
  },
}
