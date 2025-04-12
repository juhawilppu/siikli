import { PrismaClient } from '@prisma/client'
import express from 'express'
import { DashboardDataDto } from '../../frontend/src/types/types'

export const dashboardRoute = express.Router()
const prisma = new PrismaClient()

dashboardRoute.get(`/api/dashboard`, async (req, res) => {
    console.log('getting dashboard data')
    const result = await prisma.customer.findMany({
        orderBy: {
            order_index: 'asc',
        },
    })
    res.json({
        salesThisYear: {
            value: 100,
            change: 1
        },
        invoicesSent: {
            value: 100,
            change: 1
        },
        ordersToday: {
            value: 100,
            change: 1
        },
        uninvoiced: {
            value: 100,
            change: 1
        },
    } satisfies DashboardDataDto)
})

export default dashboardRoute
