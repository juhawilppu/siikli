// routes/export.ts or inside your Express app setup
import { PrismaClient } from '@prisma/client';
import ExcelJS from 'exceljs';
import express from 'express';
import { getUser, isAuthenticated } from '../middlewares/permissions';

const router = express.Router();
const prisma = new PrismaClient();

router.get('/api/sales-report', isAuthenticated, async (req, res) => {
    try {
        const { tenantId, userId } = getUser(req)
        const data = await prisma.orderProduct.findMany({
            where: {
                order: {
                    tenantId
                }
            },
            include: {
                order: true,
                products: true,
            },
        });

        const workbook = new ExcelJS.Workbook();
        const sheet = workbook.addWorksheet('Order Products');

        // Define headers
        sheet.columns = [
            { header: 'ID', key: 'id' },
            { header: 'Date', key: 'date' },
            { header: 'Order ID', key: 'orderId' },
            { header: 'Product ID', key: 'productId' },
            { header: 'Product Name', key: 'productName' },
            { header: 'Amount', key: 'amount' },
            { header: 'Price', key: 'price' },
            { header: 'Package Size', key: 'packageSize' },
            { header: 'Package Type', key: 'packageType' },
            { header: 'Freetext', key: 'freetext' },
            { header: 'Price0', key: 'price0' },
        ];

        // Add rows
        data.forEach((item) => {
            sheet.addRow({
                id: item.id,
                date: item.order.deliveryDate,
                orderId: item.orderId,
                productId: item.productId,
                productName: item.products.name,
                amount: item.amount,
                price: item.price,
                packageSize: item.packageSize,
                packageType: item.packageType,
                freetext: item.freetext,
                price0: item.price0,
            });
        });

        // Set headers for file download
        res.setHeader(
            'Content-Disposition',
            'attachment; filename="sales-report.xlsx"'
        );
        res.setHeader(
            'Content-Type',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        );

        // Stream the Excel file to the response
        await workbook.xlsx.write(res);

        await prisma.log.create({
            data: {
                userId,
                tenantId,
                event: 'export_sales_report',
            }
        })
        res.end();
    } catch (err) {
        console.error('Failed to export orders:', err);
        res.status(500).send('Failed to export orders');
    }
});

export default router;
