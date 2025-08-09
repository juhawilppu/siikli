import type { OrderRowDto } from '../services/order-service'
import { Role } from '@prisma/client'
import { Decimal } from '@prisma/client/runtime/library'
import { addDays, formatDate, subDays } from 'date-fns'
import { describe, expect, it } from 'vitest'
import prisma from '../prisma'
import { AuthService } from '../services/auth-service'
import { CustomerService } from '../services/customer-service'
import { InvoiceService } from '../services/invoice-service'
import { OrderService } from '../services/order-service'
import { PackagingListService } from '../services/packaging-list-service'
import { ProductService } from '../services/product-service'
import { SalesReportService } from '../services/sales-report-service'
import { TenantService } from '../services/tenant-service'
import { UserService } from '../services/user-service'

describe('integration test', () => {
  it('should handle data changes', async () => {
    const tenantName = crypto.randomUUID()
    const tenantResponse = await TenantService.createTenant({
      name: tenantName,
      businessId: 'Y-1234567-8',
      streetAddress: 'Test street 1',
      postalCode: '12345',
      city: 'Helsinki',
      phone: '1234567890',
      email: 'siikli@siikli.fi',
      website: 'https://siikli.fi',
      invoiceBankName: 'Test bank',
      invoiceBankAccount: '1234567890',
      invoiceSwiftBic: '1234567890',
      invoiceReference: '1234567890',
      invoiceSumRow: 'Test sum row',
      signupCompleted: true,
      subscriptionType: 'PREMIUM',
      subscriptionEndDate: null,
      subscriptionStartDate: null,
    })
    const tenant = await TenantService.getTenant(tenantResponse.id)
    expect(tenant.name).toBe(tenantName)

    const email = `${crypto.randomUUID()}@example.com`
    const juha = await UserService.createUser({
      email,
      tenantId: tenant.id,
      role: Role.OWNER,
    })
    expect(juha).toBeDefined()

    await TenantService.completeOnboarding(tenant.id, {
      name: tenantName,
      businessId: 'Y-1234567-8',
      user: {
        marketingConsent: true,
      },
    }, juha.id)

    await TenantService.updateTenant(tenant.id, {
      name: tenantName,
      businessId: 'Y-1234567-8',
      streetAddress: 'Test street 1',
      postalCode: '12345',
      city: 'Helsinki',
      phone: '1234567890',
      email: 'siikli@siikli.fi',
      website: 'https://siikli.fi',
      invoiceBankName: 'Test bank',
      invoiceBankAccount: '1234567890',
      invoiceSwiftBic: '1234567890',
      invoiceReference: '1234567890',
      invoiceSumRow: 'Test sum row',
    }, juha.id)

    const users = await TenantService.getUsers(tenant.id)
    expect(users.length).toBe(1)
    expect(users[0].email).toBe(email)
    expect(users[0].role).toBe(Role.OWNER)

    await AuthService.createPin({ email, ip: '127.0.0.1' })
    const pin = await prisma.emailLoginPinCode.findFirst({
      where: {
        email,
      },
    })
    expect(pin).toBeDefined()

    const sello = await CustomerService.createCustomer({
      name: 'Alepa Sello',
      discount: new Decimal(0),
      streetAddress: 'Leppävaarankatu 3',
      postalCode: '02600',
      city: 'Espoo',
      phone: '010 7669010',
      email: 'test@example.com',
      showPriceWithoutTax: true,
      invoiceReference: '1234567890',
      companyLegalName: 'Test company',
      businessId: '1234567890',
      customerGroup: 'Test group',
    }, tenant.id, juha.id)
    expect(sello).toBeDefined()

    const customers = await CustomerService.getCustomers(tenant.id, juha.id)
    expect(customers.customers.length).toBe(1)
    expect(customers.customers[0].name).toBe('Alepa Sello')

    await CustomerService.updateCustomer(sello.id, {
      ...sello,
      name: 'Alepa Sello 2',
    }, tenant.id, juha.id)

    const updatedCustomer = await CustomerService.getCustomer(sello.id, tenant.id)
    expect(updatedCustomer?.name).toBe('Alepa Sello 2')

    const packageSizes = [5, 10, 20, 30, 50, 100, 200, 300]
    for (const size of packageSizes) {
      await TenantService.createPackageSize(tenant.id, size)
    }

    const packageTypes = ['Ltk', 'A', 'Pnt']
    for (const type of packageTypes) {
      await TenantService.createPackageType(tenant.id, type)
    }

    const created = await TenantService.verifyPackageSizeAndType('Ltk', 10, tenant.id)
    expect(created.packageType).toBe(false)
    expect(created.packageSize).toBe(false)

    const created2 = await TenantService.verifyPackageSizeAndType('A', 11, tenant.id)
    expect(created2.packageType).toBe(false)
    expect(created2.packageSize).toBe(true)

    const created3 = await TenantService.verifyPackageSizeAndType('KT', 12, tenant.id)
    expect(created3.packageType).toBe(true)
    expect(created3.packageSize).toBe(true)

    const packageSizes2 = await TenantService.getPackageSizes(tenant.id)
    expect(packageSizes2.length).toBe(packageSizes.length + 2)

    const packageTypes2 = await TenantService.getPackageTypes(tenant.id)
    expect(packageTypes2.length).toBe(packageTypes.length + 1)

    const siikli = await ProductService.createProduct({
      name: 'Siikli',
      tenantId: tenant.id,
      price: new Decimal(1.40),
      price0: new Decimal(1.40).div(1.14),
      packageSize: 10,
      packageType: 'Ltk',
      userId: juha.id,
      type: 'Ltk',
      variety: 'Siikli',
      info: 'Erikoistuote',
      subtype: 'Siikli',
      customerGroup: null,
    })
    expect(siikli).toBeDefined()

    const productToDelete = await ProductService.createProduct({
      name: 'Siikli To Update',
      tenantId: tenant.id,
      price: new Decimal(1.40),
      price0: new Decimal(1.40).div(1.14),
      packageSize: 10,
      packageType: 'Ltk',
      userId: juha.id,
      type: 'Ltk',
      variety: 'Siikli',
      info: 'Erikoistuote',
      subtype: 'Siikli',
      customerGroup: null,
    })
    expect(productToDelete).toBeDefined()

    await ProductService.updateProduct(productToDelete, tenant.id, {
      id: productToDelete,
      name: 'Siikli To Delete',
      price: new Decimal(1.40).toString(),
      price0: new Decimal(1.40).div(1.14).toString(),
      packageSize: 10,
      packageType: 'Ltk',
      type: 'Ltk',
      variety: 'Siikli',
      info: 'Erikoistuote',
      subtype: 'Siikli',
      customerGroup: null,
    }, juha.id)

    const products2 = await ProductService.getProducts(tenant.id)
    expect(products2.length).toBe(2)
    expect(products2.map(p => p.name)).toContain('Siikli')
    expect(products2.map(p => p.name)).toContain('Siikli To Delete')

    await ProductService.deleteProduct(productToDelete, tenant.id, juha.id)
    const products3 = await ProductService.getProducts(tenant.id)
    expect(products3.length).toBe(1)
    expect(products3.map(p => p.name)).toContain('Siikli')
    expect(products3.map(p => p.name)).not.toContain('Siikli To Delete')

    await expect(ProductService.createProduct({
      name: 'Siikli',
      tenantId: tenant.id,
      price: new Decimal(1.40),
      price0: new Decimal(1.40), // This is wrong on purpose
      packageSize: 10,
      packageType: 'Ltk',
      userId: juha.id,
      type: 'Ltk',
      variety: 'Siikli',
      info: 'Erikoistuote',
      subtype: 'Siikli',
      customerGroup: null,
    })).rejects.toThrow('Price and price0 do not match')

    const products = await ProductService.getProducts(tenant.id)
    expect(products.length).toBe(1)
    expect(products[0].name).toBe('Siikli')
    expect(products[0].price).toBeDefined()
    expect(products[0].price0).toBeDefined()
    expect(products[0].packageSize).toBe(10)
    expect(products[0].packageType).toBe('Ltk')
    expect(products[0].customerGroup).toBeNull()

    const productTypes = await ProductService.getProductTypes(tenant.id)
    expect(productTypes.length).toBe(1)
    expect(productTypes[0].type).toBe('Ltk')
    expect(productTypes[0].subtypes.length).toBe(0)
    expect(productTypes[0].id).toBeDefined()

    const orderRows: OrderRowDto[] = []
    for (let productIdIndex = 0; productIdIndex < products.length; productIdIndex++) {
      const product = products[productIdIndex]
      orderRows.push({
        productId: product.id,
        amount: new Decimal(37),
        price: product.price || new Decimal(0.99).toDecimalPlaces(2),
        price0: product.price0 || new Decimal(0.99).div(1.14).toDecimalPlaces(2),
        packageSize: product.packageSize || 1,
        packageType: product.packageType || 'Ltk',
        freetext: 'Erikoistuote',
      })
    }

    const deliveryDate = '2025-08-07'

    const orderId = await OrderService.createOrder({
      customerId: sello.id,
      tenantId: tenant.id,
      deliveryDate,
      hasNote: true,
      noteHeader: 'Toimitus',
      noteBody: 'Toimitus ovelle H3. Nouto aamulla.',
      items: orderRows.map(item => ({
        ...item,
        id: undefined,
        packages: 1,
        freetext: 'Erikoistuote',
      })),
    })

    const order = await OrderService.getOrder(orderId.id, tenant.id)
    expect(order.id.length).toBe(36) // uuid
    expect(order.waybillNumber).toBe(1000)
    expect(order.customerId).toBe(customers.customers[0].id)
    expect(order.deliveryDate).toBe(deliveryDate)
    expect(order.hasNote).toBe(true)
    expect(order.noteHeader).toBe('Toimitus')
    expect(order.noteBody).toBe('Toimitus ovelle H3. Nouto aamulla.')
    expect(order.items.length).toBe(1)

    await OrderService.updateOrder({
      tenantId: tenant.id,
      userId: juha.id,
      customerId: sello.id,
      id: orderId.id,
      deliveryDate,
      hasNote: true,
      noteHeader: 'Toimitus',
      noteBody: 'Toimitus ovelle H3. Nouto aamulla.',
      items: order.items.map(item => ({
        ...item,
        price: new Decimal(item.price),
        price0: new Decimal(item.price0),
        amount: new Decimal(item.amount),
      })),
    })

    const orders = await OrderService.getOrders(tenant.id, subDays(new Date(), 10), addDays(new Date(), 10))
    expect(orders.length).toBe(1)
    expect(orders[0].customer.id).toBe(customers.customers[0].id)
    expect(orders[0].deliveryDate).toBe(deliveryDate)

    const waybills = await OrderService.getWaybillHtmls(tenant.id, deliveryDate, deliveryDate)
    expect(waybills).toBeDefined()
    expect(waybills.includes('Siikli')).toBe(true)
    expect(waybills).toContain('<h1>Kuormakirja</h1>')
    expect(waybills).toContain('Alepa Sello 2')
    expect(waybills).toContain(formatDate(deliveryDate, 'd.M.yyyy'))
    expect(waybills).toContain('Siikli')
    expect(waybills).toContain('37')
    expect(waybills).toContain('51,80 €')
    expect(waybills.trim().startsWith('<html')).toBe(true)
    expect(waybills.trim().endsWith('</html>')).toBe(true)

    const waybillPdf = await OrderService.getWaybillPdf(tenant.id, deliveryDate, deliveryDate)
    expect(waybillPdf).toBeInstanceOf(Uint8Array)
    expect(waybillPdf.length).toBeGreaterThan(100)

    const packagingListByCustomer = await PackagingListService.getPackagingListGroupedByCustomer(tenant.id, deliveryDate)
    expect(packagingListByCustomer).toBeDefined()
    expect(packagingListByCustomer.groupedBy).toBe('customer')
    expect(packagingListByCustomer.rows.length).toBe(products.length)
    expect(packagingListByCustomer.rows[0].customerId).toBe(sello.id)
    expect(packagingListByCustomer.rows[0].productName).toBe(products[0].name)
    expect(packagingListByCustomer.rows[0].amount.equals(new Decimal(37))).toBe(true)

    const packagingListByProduct = await PackagingListService.getPackagingListGroupedByProduct(tenant.id, deliveryDate)
    expect(packagingListByProduct).toBeDefined()
    expect(packagingListByProduct.groupedBy).toBe('product')
    expect(packagingListByProduct.rows.length).toBe(products.length)
    expect(packagingListByProduct.rows[0].productId).toBe(products[0].id)
    expect(packagingListByProduct.rows[0].amount.equals(new Decimal(37))).toBe(true)

    const invoice = await InvoiceService.getInvoice(sello.id, tenant.id, subDays(new Date(), 30), new Date())
    expect(invoice).toBeDefined()
    expect(invoice.items.length).toBe(products.length)
    expect(invoice.totals.totalSumWithTax.equals(new Decimal(51.88))).toBe(true)
    expect(invoice.totals.totalSumWithoutTax.equals(new Decimal(45.51))).toBe(true)
    expect(invoice.totals.totalDiscount.equals(new Decimal(0))).toBe(true)
    expect(invoice.totals.totalTax.equals(new Decimal(6.37))).toBe(true)
    expect(invoice.totals.finalSumWithTax.equals(new Decimal(51.88))).toBe(true)
    expect(invoice.totals.finalSumWithoutTax.equals(new Decimal(45.51))).toBe(true)
    expect(invoice.totals.totalKg.equals(new Decimal(37))).toBe(true)

    const remaining = await OrderService.getRemainingOrders(tenant.id)
    expect(remaining).toBe(19)

    const salesReport = await SalesReportService.getSalesReportData(tenant.id, juha.id)
    expect(salesReport).toBeDefined()
    expect(salesReport.length).toBe(1)
    expect(salesReport[0].date).toBe(formatDate(deliveryDate, 'd.M.yyyy'))
    expect(salesReport[0].waybillNumber).toBe(order.waybillNumber)
    expect(salesReport[0].customerName).toBe('Alepa Sello 2')
    expect(salesReport[0].productName).toBe(products[0].name)
    expect(salesReport[0].amount).toBe(37)
    expect(salesReport[0].price).toBe(1.4)
    expect(salesReport[0].packageSize).toBe(10)
    expect(salesReport[0].packageType).toBe('Ltk')
    expect(salesReport[0].freetext).toBe('Erikoistuote')

    const workbook = SalesReportService.createExcelReport(salesReport)
    expect(workbook).toBeDefined()
    expect(workbook.worksheets.length).toBe(1)
    expect(workbook.worksheets[0].name).toBe('Myyntiraportti')
    // expect(workbook.worksheets[0].rows.length).toBe(2)
    // expect(workbook.worksheets[0].rows[0].values).toEqual(['Päivämäärä', 'Tilaus', 'Asiakas', 'Tuote', 'Määrä', 'Hinta', 'Pakkauskoko', 'Pakkaustyyppi', 'Lisätieto'])
    // expect(workbook.worksheets[0].rows[1].values).toEqual([dateToIso(deliveryDate), order.id, customers.customers[0].name, products[0].name, 37, 51.80, 10, 'Ltk', 'Erikoistuote'])

    await OrderService.deleteOrder(order.id, tenant.id)
    await expect(OrderService.getOrder(order.id, tenant.id)).rejects.toThrow()

    await CustomerService.deleteCustomer(sello.id, tenant.id, juha.id)

    const deletedCustomer = await CustomerService.getCustomer(sello.id, tenant.id)
    expect(deletedCustomer).toBeNull()

    const deletedOrders = await OrderService.getOrders(tenant.id, subDays(new Date(), 1), addDays(new Date(), 1))
    expect(deletedOrders.length).toBe(0)

    await TenantService.deleteUser(tenant.id, juha.id, juha.id)
    const users2 = await TenantService.getUsers(tenant.id)
    expect(users2.length).toBe(0)

    const email2 = `${crypto.randomUUID()}@example.com`

    await TenantService.createUser(tenant.id, email2, 'USER', juha.id)
    const users3 = await TenantService.getUsers(tenant.id)
    expect(users3.length).toBe(1)
    expect(users3[0].email).toBe(email2)
    expect(users3[0].role).toBe(Role.USER)

    await TenantService.updateUser(tenant.id, users3[0].id, 'OWNER', juha.id)
    const users4 = await TenantService.getUsers(tenant.id)
    expect(users4.length).toBe(1)
    expect(users4[0].email).toBe(email2)
    expect(users4[0].role).toBe(Role.OWNER)

    await TenantService.updateSubscription(tenant.id, 'FREE', juha.id)
    const tenant2 = await TenantService.getTenant(tenant.id)
    expect(tenant2.subscriptionType).toBe('FREE')
    expect(tenant2.subscriptionEndDate).toBeDefined()
    expect(tenant2.subscriptionStartDate).toBeNull()
    expect(tenant2.trialEndDate).toBeNull()

    await TenantService.deleteTenant(tenant.id, juha.id)

    await expect(TenantService.getTenant(tenant.id)).rejects.toThrow()
  })
}, 9000)
