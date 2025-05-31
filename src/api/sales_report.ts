import ExcelJS from 'exceljs'
import express from 'express'
import { formatDate } from '../../frontend/src/utils/date'
import { getUser, isAuthenticated } from '../middlewares/permissions'
import prisma from '../prisma'

const router = express.Router()

router.get('/api/sales-report', isAuthenticated, async (req, res) => {
  try {
    const { tenantId, userId } = getUser(req)
    const data = await prisma.orderRow.findMany({
      where: {
        tenantId,
        order: {
          tenantId,
        },
        product: {
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
        product: true,
      },
    })

    const workbook = new ExcelJS.Workbook()
    const sheet = workbook.addWorksheet('Myyntiraportti')

    // Define headers
    sheet.columns = [
      { header: 'Päivämäärä', key: 'date', style: { font: { bold: true } }, width: 11 },
      { header: 'Tilaus', key: 'orderId', style: { font: { bold: true }, alignment: { horizontal: 'right' } }, width: 11 },
      { header: 'Asiakas', key: 'customerName', style: { font: { bold: true } }, width: 15 },
      { header: 'Tuote', key: 'productName', style: { font: { bold: true } }, width: 15 },
      { header: 'Määrä', key: 'amount', style: { font: { bold: true }, alignment: { horizontal: 'right' } }, width: 10 },
      { header: 'Hinta', key: 'price', style: { font: { bold: true }, alignment: { horizontal: 'right' } }, width: 10 },
      { header: 'Pakkauskoko', key: 'packageSize', style: { font: { bold: true }, alignment: { horizontal: 'right' } }, width: 12 },
      { header: 'Pakkaustyyppi', key: 'packageType', style: { font: { bold: true } }, width: 12 },
      { header: 'Lisätieto', key: 'freetext', style: { font: { bold: true } }, width: 20 },
    ]

    // Add rows
    data.forEach((item) => {
      const row = sheet.addRow({
        date: formatDate(item.order.deliveryDate),
        orderId: item.order.waybillNumber,
        customerName: item.order.customer.name,
        productName: item.product.name,
        amount: item.amount.toNumber(),
        price: item.price.toNumber(),
        packageSize: item.packageSize,
        packageType: item.packageType,
        freetext: item.freetext,
      })
      row.font = { bold: false }
    })

    sheet.getColumn('date').numFmt = 'dd.mm.yyyy'
    sheet.getColumn('amount').numFmt = '#.00'
    sheet.getColumn('price').numFmt = '#.00'
    sheet.getColumn('packageSize').numFmt = '#'

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
