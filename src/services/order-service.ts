import { Order } from "@prisma/client"
import { subDays } from "date-fns"
import prisma from "../prisma"
import { Decimal } from "decimal.js"

export type OrderRowDto = {
    productId: string
    amount: Decimal
    price: Decimal
    price0: Decimal
    packageSize: number
    packageType: string
    freetext: string | null
}

export const OrderService = {

    async createOrder(input: {tenantId: string, customerId: string, deliveryDate: Date, hasNote: boolean, noteHeader: string | null, noteBody: string | null, orderRows: any[]}): Promise<Order> {
        const {
            tenantId,
            customerId,
            deliveryDate,
            hasNote,
            noteHeader,
            noteBody,
            orderRows,
        } = input

        return await prisma.$transaction(async (tx) => {
            const waybillNumber = await tx.order.count({
                where: {
                    tenantId,
                },
            }) + 1

            const order = await tx.order.create({
                data: {
                  customerId,
                  tenantId,
                  deliveryDate,
                  waybillNumber,
                  hasNote,
                  noteHeader,
                  noteBody,
                },
            })

            for (const orderRow of orderRows) {

                if (orderRow.price.div(1.14).toDecimalPlaces(2).cmp(orderRow.price0) !== 0) {
                    throw new Error('Price and price0 do not match')
                }

                await tx.orderRow.create({
                    data: {
                    orderId: order.id,
                    productId: orderRow.productId,
                    amount: orderRow.amount,
                    price: orderRow.price,
                    price0: orderRow.price0,
                    packageSize: orderRow.packageSize,
                    packageType: orderRow.packageType,
                    tenantId: tenantId,
                    freetext: orderRow.freetext,
                    },
                })
            }

            return order
        })
    },

    async getOrders(input: {tenantId: string}): Promise<Order[]> {
        const {
            tenantId,
        } = input

        return prisma.order.findMany({
            where: {
                tenantId,
            },
        })
    },
}