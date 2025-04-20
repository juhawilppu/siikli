import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Add middleware to validate tenant_id filtering
prisma.$use(async (params, next) => {
    // Check if this is a customer query
    if (params.model === 'Customer') {
        // For findMany and findFirst, ensure where clause includes tenantId
        if (params.action === 'findMany' || params.action === 'findFirst') {
            if (!params.args?.where?.tenantId) {
                throw new Error('Customer queries must include tenantId filter')
            }
        }
        // For create, ensure data includes tenantId
        if (params.action === 'create') {
            if (!params.args?.data?.tenantId) {
                throw new Error('Customer creation must include tenantId')
            }
        }
        // For update, ensure where clause includes tenantId
        if (params.action === 'update') {
            if (!params.args?.where?.tenantId) {
                throw new Error('Customer updates must include tenantId filter')
            }
        }
        // For delete, ensure where clause includes tenantId
        if (params.action === 'delete') {
            if (!params.args?.where?.tenantId) {
                throw new Error('Customer deletions must include tenantId filter')
            }
        }
    }
    return next(params)
})

export default prisma 