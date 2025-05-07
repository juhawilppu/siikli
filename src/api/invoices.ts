import { addDays } from 'date-fns'
import Decimal from 'decimal.js'
import express from 'express'
import { InvoiceDto, InvoiceItemDto } from '../../frontend/src/types/types'
import { dateToString } from '../../frontend/src/utils/date'
import { getUser, isAuthenticated } from '../middlewares/permissions'
import prisma from '../prisma'

const invoiceRoute = express.Router()

invoiceRoute.get(`/api/invoices`, isAuthenticated, async (req, res) => {
    const { userId, tenantId } = getUser(req)
    try {
        const customerId = req.query.customerId as string;
        const startDate = new Date(req.query.startDate as string);
        const endDate = new Date(req.query.endDate as string);
        const usePrice0 = req.query.usePrice0 === 'true';

        const customer = await prisma.customer.findUnique({
            where: {
                id: customerId,
                tenantId
            },
        });

        if (!customer) throw new Error('Customer not found');

        const orders = await prisma.order.findMany({
            where: {
                customerId: customer.id,
                tenantId,
                deliveryDate: {
                    gte: startDate,
                    lte: endDate,
                },
            },
            orderBy: {
                deliveryDate: 'asc',
            },
            include: {
                products: {
                    include: {
                        products: true
                    }
                },
            },
        });


        const company = await prisma.tenant.findFirstOrThrow({
            where: {
                id: tenantId
            }
        })

        const today = new Date()

        const items = orders.map(o => {
            return o.products.map(p => {
                return {
                    orderId: o.id,
                    orderNumber: 1,
                    amount: p.amount,
                    deliveryDate: o.deliveryDate,
                    productName: p.products.name,
                    price: p.price,
                    price0: p.price0
                }
            })
        }
        ).flat()

        const notificationPeriod = 14

        const invoice = {
            invoiceId: 1001,
            date: dateToString(today),
            dueDate: dateToString(addDays(today, notificationPeriod)),
            paymentCondition: notificationPeriod + ' päivää',
            notificationPeriod: notificationPeriod + ' päivää',
            interestRate: 7,
            customer: {
                chain: customer.chain,
                name: customer.name,
                companyName: customer.companyName,
                businessId: customer.businessId,
                address: customer.address,
                postalCode: customer.postalCode,
                city: customer.city,
                showPriceWithoutTax: customer.showPriceWithoutTax
            },
            company: {
                name: company.name,
            },
            items,
            totals: calculateTotals(items, customer.compensation, customer.showPriceWithoutTax)
        };

        return res.status(200).json(invoice satisfies InvoiceDto);
    } catch (err) {
        console.error('Error generating invoice:', err);
        res.status(500).json({ error: 'Internal server error' });
    }

})

const getPrice = (item: InvoiceItemDto, usePrice0: boolean) => {
    return usePrice0 ? item.price0 * 1.14 : item.price;
}

const getPriceWithoutTax = (item: InvoiceItemDto, usePrice0: boolean) => {
    return usePrice0 ? item.price0 : item.price / 1.14;
}

const calculateTotals = (items: InvoiceItemDto[], compensation: number, usePrice0: boolean) => {
    let totalSumWithoutTax = new Decimal(0);
    let totalSumWithTax = new Decimal(0);
    let totalCompensation = new Decimal(0);
    let totalTax = new Decimal(0);
    let finalSumWithoutTax = new Decimal(0);
    let finalSumWithTax = new Decimal(0);
    let totalKg = 0;

    for (const item of items) {

        const priceWithoutTax = new Decimal(item.amount).mul(getPriceWithoutTax(item, usePrice0));
        const priceWithTax = new Decimal(item.amount).mul(getPrice(item, usePrice0));

        totalSumWithoutTax = totalSumWithoutTax.add(priceWithoutTax);
        totalSumWithTax = totalSumWithTax.add(priceWithTax);
        totalKg += item.amount;
    }

    if (usePrice0) {
        totalSumWithoutTax = totalSumWithoutTax.toDecimalPlaces(2, Decimal.ROUND_HALF_DOWN);
        totalSumWithTax = totalSumWithTax.toDecimalPlaces(2, Decimal.ROUND_HALF_DOWN);

        totalCompensation = totalSumWithoutTax
            .mul(new Decimal(compensation).div(100))
            .toDecimalPlaces(2, Decimal.ROUND_HALF_DOWN);

        totalTax = totalSumWithoutTax
            .mul(0.14)
            .toDecimalPlaces(2, Decimal.ROUND_HALF_DOWN);

        finalSumWithoutTax = totalSumWithoutTax.sub(totalCompensation);
        finalSumWithTax = finalSumWithoutTax.add(totalTax);
    } else {
        totalSumWithTax = totalSumWithTax.toDecimalPlaces(2, Decimal.ROUND_HALF_DOWN);

        totalSumWithoutTax = totalSumWithTax
            .div(1.14)
            .toDecimalPlaces(2, Decimal.ROUND_HALF_DOWN);

        if (compensation > 0) {
            totalCompensation = totalSumWithoutTax
                .mul(new Decimal(compensation).div(100))
                .toDecimalPlaces(2, Decimal.ROUND_HALF_DOWN);

            finalSumWithoutTax = totalSumWithoutTax.sub(totalCompensation);

            totalTax = finalSumWithoutTax
                .mul(0.14)
                .toDecimalPlaces(2, Decimal.ROUND_HALF_DOWN);

            finalSumWithTax = finalSumWithoutTax.add(totalTax);
        } else {
            totalCompensation = new Decimal(0);
            totalTax = totalSumWithTax.sub(totalSumWithoutTax);

            finalSumWithoutTax = totalSumWithoutTax;
            finalSumWithTax = finalSumWithoutTax.add(totalTax);
        }
    }

    return {
        totalSumWithoutTax: totalSumWithoutTax.toNumber(),
        totalSumWithTax: totalSumWithTax.toNumber(),
        totalCompensation: totalCompensation.toNumber(),
        totalTax: totalTax.toNumber(),
        finalSumWithoutTax: finalSumWithoutTax.toNumber(),
        finalSumWithTax: finalSumWithTax.toNumber(),
        totalKg
    }
}

export default invoiceRoute
