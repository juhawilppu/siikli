import ExcelJS from 'exceljs'
import express from 'express'
import { formatDate } from '../../frontend/src/utils/date'
import { getUser, isAuthenticated } from '../middlewares/permissions'
import prisma from '../prisma'

const router = express.Router()

router.get('/api/sales-report', isAuthenticated, async (req, res) => {
  try {
    const { tenantId, userId } = getUser(req)
    const data = await prisma.orderProduct.findMany({
      where: {
        tenantId,
        order: {
          tenantId,
        },
        products: {
          tenantId,
        },
      },
      include: {
        order: {
          include: {
            customer: {
              select: {
                name: true,
              },
            },
          },
        },
        products: true,
      },
    })

    const workbook = new ExcelJS.Workbook()
    const sheet = workbook.addWorksheet('Order Products')

    // Define headers
    sheet.columns = [
      { header: 'Päivämäärä', key: 'date' },
      { header: 'Tilaus', key: 'orderId' },
      { header: 'Asiakas', key: 'customerName' },
      { header: 'Tuote', key: 'productName' },
      { header: 'Määrä', key: 'amount' },
      { header: 'Hinta', key: 'price' },
      { header: 'Pakkauskoko', key: 'packageSize' },
      { header: 'Pakkaustyyppi', key: 'packageType' },
      { header: 'Lisätieto', key: 'freetext' },
    ]

    // Add rows
    data.forEach((item) => {
      sheet.addRow({
        date: formatDate(item.order.deliveryDate),
        orderId: item.orderId,
        customerName: item.order.customer.name,
        productName: item.products.name,
        amount: item.amount,
        price: item.price,
        packageSize: item.packageSize,
        packageType: item.packageType,
        freetext: item.freetext,
      })
    })

    // Set headers for file download
    res.setHeader(
      'Content-Disposition',
      'attachment; filename="myyntiraportti.xlsx"',
    )
    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    )

    // Stream the Excel file to the response
    await workbook.xlsx.write(res)

    await prisma.log.create({
      data: {
        userId,
        tenantId,
        event: 'export_sales_report',
      },
    })
    res.end()
  }
  catch (err) {
    console.error('Failed to export orders:', err)
    res.status(500).send('Failed to export orders')
  }
})

export default router
