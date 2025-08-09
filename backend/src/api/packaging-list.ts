import type { PackagingListGroupedByCustomer, PackagingListGroupedByProduct } from '@siikli/shared'
import express from 'express'
import { getUser } from '../middlewares/permissions'
import { PackagingListService } from '../services/packaging-list-service'

const router = express.Router()

router.get('/api/packaging-list/grouped-by/customer', async (req, res) => {
  const { tenantId } = getUser(req)
  const query = req.query

  if (!query.deliveryDate || typeof query.deliveryDate !== 'string') {
    return res.status(400).json({ error: 'Missing deliveryDate' })
  }
  const deliveryDate = query.deliveryDate
  const results = await PackagingListService.getPackagingListGroupedByCustomer(tenantId, deliveryDate)
  res.json(results satisfies PackagingListGroupedByCustomer)
})

router.get('/api/packaging-list/grouped-by/product', async (req, res) => {
  const { tenantId } = getUser(req)
  const query = req.query

  if (!query.deliveryDate || typeof query.deliveryDate !== 'string') {
    return res.status(400).json({ error: 'Missing deliveryDate' })
  }

  const deliveryDate = query.deliveryDate
  const results = await PackagingListService.getPackagingListGroupedByProduct(tenantId, deliveryDate)
  res.json(results satisfies PackagingListGroupedByProduct)
})

export default router
