import { formatDate } from '@siikli/shared'
import ExcelJS from 'exceljs'
import prisma from '../prisma'

export interface SalesReportData {
  date: string
  waybillNumber: number
  customerName: string
  productName: string
  amount: number
  price: number
  packageSize: number
  packageType: string | null
  freetext: string | null
}

export const SalesReportService = {
  getSalesReportData: async (tenantId: string, userId: string): Promise<SalesReportData[]> => {
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
    await prisma.log.create({
      data: {
        userId,
        tenantId,
        event: 'export_sales_report',
      },
    })

    return data.map(item => ({
      date: formatDate(item.order.deliveryDate),
      waybillNumber: item.order.waybillNumber,
      customerName: item.order.customer.name,
      productName: item.product.name,
      amount: item.amount.toNumber(),
      price: item.price.toNumber(),
      packageSize: item.packageSize,
      packageType: item.packageType,
      freetext: item.freetext,
    }))
  },
  createExcelReport: (data: SalesReportData[]): ExcelJS.Workbook => {
    const workbook = new ExcelJS.Workbook()
    const sheet = workbook.addWorksheet('Myyntiraportti')

    // Define headers
    sheet.columns = [
      { header: 'Päivämäärä', key: 'date', style: { font: { bold: true } }, width: 11 },
      { header: 'Tilaus', key: 'waybillNumber', style: { font: { bold: true }, alignment: { horizontal: 'right' } }, width: 11 },
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
        date: item.date,
        waybillNumber: item.waybillNumber,
        customerName: item.customerName,
        productName: item.productName,
        amount: item.amount,
        price: item.price,
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

    return workbook
  },
}
