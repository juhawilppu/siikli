import { PrismaClient } from '@prisma/client'
import express from 'express'

const invoiceRoute = express.Router()
const prisma = new PrismaClient()

invoiceRoute.get(`/api/invoices`, async (req, res) => {
    try {
        const customerId = req.query.customerId as string;
        const startDate = new Date(req.query.startDate as string);
        const endDate = new Date(req.query.endDate as string);
        const usePrice0 = req.query.usePrice0 === 'true';

        const customer = await prisma.customer.findUnique({
            where: { id: customerId },
        });

        if (!customer) throw new Error('Customer not found');


        const orders = await prisma.order.findMany({
            where: {
                customerId: customer.id,
                deliveryDate: {
                    gte: startDate,
                    lte: endDate,
                },
            },
            orderBy: {
                deliveryDate: 'asc',
            },
            include: {
                products: true, // Assuming the relation is named this way
            },
        });

        // Optional: if your model doesn’t auto-include products, fetch separately
        // and attach items to each order manually

        const today = new Date()


        const invoice = {
            invoiceId: 1001,
            date: dateToString(today),
            dueDate: dateToString(addDays(today, 14)),
            paymentCondition: '14 päivää',
            notificationPeriod: '14 päivää',
            interestRate: 7,
            customer: {
                name: customer.name,
                companyName: customer.company_name,
                businessId: customer.business_id,
                address: customer.address,
                postalCode: customer.postal_code,
                city: customer.city
            },
            orders,
            total: calculateInvoiceTotal(orders, usePrice0),
        };

        return res.status(200).json(invoice satisfies InvoiceDto);
    } catch (err) {
        console.error('Error generating invoice:', err);
        res.status(500).json({ error: 'Internal server error' });
    }

})


import { Order, OrderProduct } from '@prisma/client'
import { addDays } from 'date-fns'
import { InvoiceDto } from '../../frontend/src/types/types'
import { dateToString } from '../../frontend/src/utils/date'

export function calculateInvoiceTotal(
    orders: (Order & { products: OrderProduct[] })[],
    usePrice0: boolean
): number {
    let total = 0;
    for (const order of orders) {
        for (const item of order.products) {
            const price = usePrice0 ? item.price0 : item.price;
            total += item.amount * price;
        }
    }
    return total;
}

export default invoiceRoute
