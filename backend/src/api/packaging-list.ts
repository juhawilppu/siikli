import type { GetPackagingListGroupedByCustomerResponse, GetPackagingListGroupedByProductResponse } from '@siikli/shared'
import { GetPackagingListQuery } from '@siikli/shared'
import express from 'express'
import { getSessionOrThrow } from '../middlewares/permissions'
import { PackagingListService } from '../services/packaging-list-service'

const router = express.Router()

router.get('/api/packaging-list/grouped-by/customer', async (req, res) => {
  const { tenantId } = getSessionOrThrow(req)
  const { deliveryDate } = GetPackagingListQuery.parse(req.query)

  const results = await PackagingListService.getPackagingListGroupedByCustomer(tenantId, deliveryDate)
  res.json(results satisfies GetPackagingListGroupedByCustomerResponse)
})

router.get('/api/packaging-list/grouped-by/product', async (req, res) => {
  const { tenantId } = getSessionOrThrow(req)
  const { deliveryDate } = GetPackagingListQuery.parse(req.query)

  const results = await PackagingListService.getPackagingListGroupedByProduct(tenantId, deliveryDate)
  res.json(results satisfies GetPackagingListGroupedByProductResponse)
})

export default router
