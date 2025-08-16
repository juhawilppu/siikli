import express from 'express'
import { getUser, isAuthenticated } from '../middlewares/permissions'
import { SalesReportService } from '../services/sales-report-service'

const router = express.Router()

router.get('/api/sales-report', isAuthenticated, async (req, res) => {
  const { tenantId, userId } = getUser(req)
  const data = await SalesReportService.getSalesReportData(tenantId, userId)
  const workbook = SalesReportService.createExcelReport(data)

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

  res.end()
})

export default router
