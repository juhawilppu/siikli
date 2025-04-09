// warehouseReport.routes.ts
import { PrismaClient } from '@prisma/client';
import express from 'express';
import { WarehouseReportByCustomer, WarehouseReportByProduct } from '../../frontend/src/types/types';

const router = express.Router();
const prisma = new PrismaClient();

router.get('/api/warehouse-report/grouped-by/customer', async (req, res) => {
  const query = req.query;

  if (!query.deliveryDate || typeof query.deliveryDate !== 'string') {
    return res.status(400).json({ error: 'Missing deliveryDate' });
  }

  const deliveryDate = query.deliveryDate;

  console.log('deliveryDate here', deliveryDate)

  try {
    const results = await prisma.$queryRawUnsafe<any>(`
      SELECT
        customer_id,
        CONCAT(c.chain, ' ', c.name) AS customer_name,
        c.order_index AS customer_order_index,
        product_id,
        p.name AS product_name,
        type AS product_type,
        variety AS product_variety,
        SUM(amount)::double precision AS amount,
        op.package_size,
        op.package_type,
        freetext
      FROM "order" o
      LEFT JOIN customer c ON (c.id = o.customer_id)
      LEFT JOIN order_product op ON (op.order_id = o.id)
      LEFT JOIN product p ON (p.id = op.product_id)
      WHERE DATE(delivery_date) = '${deliveryDate}'
      GROUP BY
        customer_id,
        c.chain,
        c.name,
        c.order_index,
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
    `);
    console.log('results', results)

    res.json({
      deliveryDate,
      groupedBy: 'customer',
      rows: results.map(r => {
        return {
          customerId: r.customer_id,
          customerName: r.customer_name,
          productType: r.product_type,
          productName: r.product_name,
          packageSize: r.package_size,
          packageType: r.package_type,
          freetext: r.freetext,
          amount: r.amount
        }
      })
    } satisfies WarehouseReportByCustomer);
  } catch (error) {
    console.error('Error fetching warehouse report:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/api/warehouse-report/grouped-by/product', async (req, res) => {
  const query = req.query;

  if (!query.deliveryDate || typeof query.deliveryDate !== 'string') {
    return res.status(400).json({ error: 'Missing deliveryDate' });
  }

  const deliveryDate = query.deliveryDate;

  console.log('deliveryDate here', deliveryDate)

  try {
    const results = await prisma.$queryRawUnsafe<any>(`
		SELECT
    product_id,
		p.name AS product_name,
		p.type AS product_type,
		p.variety AS product_variety,
		SUM(amount)::double precision AS amount,
		op.package_size,
		op.package_type
		FROM "order" o
		LEFT JOIN order_product op ON (op.order_id = o.id)
		LEFT JOIN product p ON (p.id = op.product_id)
		LEFT JOIN product_type pt ON (p.type = pt.type)
		LEFT JOIN product_subtype pst ON (p.type = pst.type AND p.subtype = pst.subtype)
		WHERE delivery_date = '${deliveryDate}'
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
    `);
    console.log('results', results)

    res.json({
      deliveryDate,
      groupedBy: 'product',
      rows: results.map(r => {
        return {
          productId: r.product_id,
          productName: r.product_name,
          productType: r.product_type,
          productVariety: r.product_variety,
          packageSize: r.package_size,
          packageType: r.package_type,
          amount: r.amount
        }
      })
    } satisfies WarehouseReportByProduct);
  } catch (error) {
    console.error('Error fetching warehouse report:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
