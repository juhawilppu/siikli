// warehouseReport.routes.ts
import { PrismaClient } from '@prisma/client';
import express from 'express';
import { WarehouseReportRow } from '../../frontend/src/types/types';

const router = express.Router();
const prisma = new PrismaClient();

router.get('/api/warehouse-report/grouped-by-customer', async (req, res) => {
  const query = req.query;

  if (!query.deliveryDate || typeof query.deliveryDate !== 'string') {
    return res.status(400).json({ error: 'Missing deliveryDate' });
  }

  const deliveryDate = query.deliveryDate;

  console.log('deliverDate here', deliveryDate)

  try {
    const results = await prisma.$queryRawUnsafe<WarehouseReportRow[]>(`
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

    res.json(results);
  } catch (error) {
    console.error('Error fetching warehouse report:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
