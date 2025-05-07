import { addDays, endOfDay, startOfDay, startOfYear } from 'date-fns'
import express from 'express'
import { DashboardDataDto } from '../../frontend/src/types/types'
import { getUser, isAuthenticated } from '../middlewares/permissions'
import { setSentryUser } from '../middlewares/sentryUser'
import prisma from '../prisma'

export const dashboardRoute = express.Router()

dashboardRoute.get(`/api/dashboard`, isAuthenticated, setSentryUser, async (req, res) => {
    const { userId, tenantId } = getUser(req)

    const now = new Date()

    console.log('getting dashboard data')
    const result = await prisma.customer.findMany({
        where: {
            tenantId: tenantId
        },
        orderBy: {
            orderIndex: 'asc',
        },
    })

    const salesThisYear = (await prisma.order.findMany({
        where: {
            deliveryDate: {
                gte: startOfYear(now)
            },
            tenantId: tenantId
        },
        include: {
            products: true
        }
    })).map(o => o.products.map(p => {
        return {
            sum: p.amount * p.price
        }
    })).flat().reduce((a, b) => a + b.sum, 0)

    const ordersYesterday = await prisma.order.count({
        where: {
            deliveryDate: {
                gte: startOfDay(addDays(now, -1)),
                lt: endOfDay(addDays(now, -1))
            },
            tenantId: tenantId
        }
    })

    const ordersToday = await prisma.order.findMany({
        where: {
            deliveryDate: {
                gte: startOfDay(now),
                lt: endOfDay(now)
            },
            tenantId: tenantId
        },
        include: {
            customer: true
        },
    })

    res.json({
        metrics: {
            salesThisYear: {
                value: salesThisYear,
                change: null,
                unit: 'money'
            },
            invoicesSent: {
                value: 100,
                change: 1,
                unit: 'count'
            },
            ordersToday: {
                value: ordersToday.length,
                change: ordersYesterday > 0 ? (1 - (ordersToday.length / ordersYesterday)) * 100 : null,
                unit: 'count'
            },
            uninvoiced: {
                value: 100,
                change: 1,
                unit: 'money'
            },
        },
        orders: ordersToday.map(o => {
            return {
                orderId: o.id,
                deliveryDate: o.deliveryDate,
                customerName: o.customer.chain + ' ' + o.customer.name,
                amount: 1
            }
        })
    } satisfies DashboardDataDto)
})

export default dashboardRoute
