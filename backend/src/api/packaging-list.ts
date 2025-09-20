import type { GetPackagingListGroupedByCustomerResponse, GetPackagingListGroupedByProductResponse } from '@siikli/shared'
import { GetPackagingListQuery } from '@siikli/shared'
import express from 'express'
import { getSessionOrThrow } from '../middlewares/permissions'
import { rateLimitByUserAccount } from '../middlewares/rate-limit'
import { PackagingListService } from '../services/packaging-list-service'

export const packagingListRoute = express.Router()

packagingListRoute.get('/api/packaging-list/grouped-by/customer', rateLimitByUserAccount(20, 1), async (req, res) => {
  const { tenantId } = getSessionOrThrow(req)
  const { deliveryDate } = GetPackagingListQuery.parse(req.query)

  const results = await PackagingListService.getPackagingListGroupedByCustomer(tenantId, deliveryDate)
  res.json(results satisfies GetPackagingListGroupedByCustomerResponse)
})

packagingListRoute.get('/api/packaging-list/grouped-by/product', rateLimitByUserAccount(20, 1), async (req, res) => {
  const { tenantId } = getSessionOrThrow(req)
  const { deliveryDate } = GetPackagingListQuery.parse(req.query)

  const results = await PackagingListService.getPackagingListGroupedByProduct(tenantId, deliveryDate)
  res.json(results satisfies GetPackagingListGroupedByProductResponse)
})
