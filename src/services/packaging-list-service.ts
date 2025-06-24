import type { PackagingListGroupedByCustomer, PackagingListGroupedByProduct } from '../../frontend/src/types/types'
import prisma from '../prisma'

export const PackagingListService = {
  getPackagingListGroupedByCustomer: async (tenantId: string, deliveryDate: string): Promise<PackagingListGroupedByCustomer> => {
    const results = await prisma.$queryRawUnsafe<any>(`
    SELECT
      customer_id,
      c.name AS customer_name,
      product_id,
      p.name AS product_name,
      type AS product_type,
      variety AS product_variety,
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
      type,
      p.variety,
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
    console.log('results', results)

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
          amount: r.amount,
        }
      }),
    } satisfies PackagingListGroupedByCustomer
  },
  getPackagingListGroupedByProduct: async (tenantId: string, deliveryDate: string): Promise<PackagingListGroupedByProduct> => {
    const results = await prisma.$queryRawUnsafe<any>(`
            SELECT
            product_id,
            p.name AS product_name,
            p.type AS product_type,
            p.variety AS product_variety,
            SUM(amount)::numeric AS amount,
            op.package_size,
            op.package_type
            FROM "order" o
            LEFT JOIN order_row op ON (op.order_id = o.id)
            LEFT JOIN product p ON (p.id = op.product_id)
            LEFT JOIN product_type pt ON (p.type = pt.type and pt.tenant_id = '${tenantId}')
            LEFT JOIN product_subtype pst ON (p.type = pst.type AND p.subtype = pst.subtype and pst.tenant_id = '${tenantId}')
            WHERE delivery_date = '${deliveryDate}' and o.tenant_id = '${tenantId}'
            GROUP BY
            product_id,
            name,
            p.type,
            p.variety,
            pt.order_index,
            pst.order_index,
            op.package_size,
            op.package_type
            ORDER BY
            pt.order_index ASC,
            pst.order_index ASC,
            product_name ASC,
            op.package_type ASC,
            op.package_size ASC,
            amount ASC;
            `)
    console.log('results', results)

    return {
      deliveryDate,
      groupedBy: 'product',
      rows: results.map((r) => {
        return {
          productId: r.product_id,
          productName: r.product_name,
          productType: r.product_type,
          productVariety: r.product_variety,
          packageSize: r.package_size,
          packageType: r.package_type,
          amount: r.amount,
        }
      }),
    } satisfies PackagingListGroupedByProduct
  },
}
