import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function verifyHistoryTables() {
  const tablesToVerify = [
    'tenant',
    'user',
    'email_login_pin_code',
    'customer',
    'order_row',
    'product_type',
    'product',
    'order',
    'product_subtype',
    'rate_limit',
    'package_type',
    'package_size',
    'invoice',
  ]
  const errors: string[] = []
  for (const tableName of tablesToVerify) {
    const result = await verifyHistoryTable(tableName)
    if (!result) {
      errors.push(tableName)
    }
  }
  if (errors.length > 0) {
    console.error('\n--------------\nVerification failed for tables:')
    errors.forEach(error => console.error(` ❌ ${error}`))
    console.error('--------------\n')
  }
}

async function getTableSchema(tableName: string) {
  const schema = await prisma.$queryRaw`
    SELECT 
      column_name, 
      data_type, 
      is_nullable, 
      character_maximum_length, 
      column_default 
    FROM information_schema.columns 
    WHERE table_name = ${tableName}
  `
  return schema as any[]
}

function findSchemaDifferences(baseSchema: any, compareSchema: any, allowedExtraColumns: string[]) {
  const differences = [] as string[]

  const baseColumns = baseSchema.map((col: any) => col.column_name)
  const compareColumns = compareSchema.map((col: any) => col.column_name)

  // Check for missing columns
  baseColumns.forEach((column: string) => {
    if (!compareColumns.includes(column)) {
      differences.push(`Missing column '${column}' in history table`)
    }
  })

  // Check for extra columns
  compareColumns.forEach((column: string) => {
    if (!baseColumns.includes(column) && !allowedExtraColumns.includes(column)) {
      differences.push(`Unexpected column '${column}' in history table`)
    }
  })

  // Compare column definitions
  baseSchema.forEach((baseCol: any) => {
    const compareCol = compareSchema.find(
      (col: any) => col.column_name === baseCol.column_name,
    )
    if (compareCol) {
      if (
        baseCol.data_type !== compareCol.data_type
        || baseCol.character_maximum_length !== compareCol.character_maximum_length
      ) {
        differences.push(`Column definition mismatch for '${baseCol.column_name}'`)
      }
    }
  })

  return differences
}

async function checkTriggerExists(triggerName: string) {
  const result = (await prisma.$queryRaw`
      SELECT t.tgname
      FROM pg_trigger t
      JOIN pg_class c ON c.oid = t.tgrelid
      WHERE t.tgname = ${triggerName}
    `) as any[]

  return result.length > 0
}

async function getTriggerFunctionDefinition(functionName: string) {
  const result = (await prisma.$queryRaw`
      SELECT pg_get_functiondef(p.oid)
      FROM pg_proc p
      WHERE proname = ${functionName}
    `) as any[]

  if (result.length > 0) {
    return result[0].pg_get_functiondef
  }

  throw new Error(`Trigger function '${functionName}' not found`)
}

function findArrayDifferences(arr1: string[], arr2: string[]) {
  const missingFromArr2 = arr1.filter(item => !arr2.includes(item))
  const missingFromArr1 = arr2.filter(item => !arr1.includes(item))
  return [...missingFromArr2, ...missingFromArr1]
}

function extractTriggerColumns(triggerSQL: string) {
  const insertRegex = /INSERT INTO \w+\s*\(([^)]+)\)/i
  const match = triggerSQL.match(insertRegex)

  if (match) {
    return match[1].split(',').map(col => col.trim())
  }
  return []
}

async function getTriggerStatus(tableName: string, triggerName: string) {
  const result = (await prisma.$queryRaw`
      SELECT t.tgname
      FROM pg_trigger t
      JOIN pg_class c ON c.oid = t.tgrelid
      JOIN pg_namespace n ON n.oid = c.relnamespace
      WHERE c.relname = ${tableName}
      AND t.tgisinternal = false
    `) as any[]

  if (result.length === 0) {
    return 'MISSING'
  }
  if (result.length === 1) {
    return result.map(row => row.tgname).includes(triggerName)
      ? 'VALID'
      : 'MISSING'
  }
  return 'MULTIPLE_TRIGGERS'
}

async function validateTriggerColumns(
  tableColumns: string[],
  triggerFunctionName: string,
) {
  try {
    const triggerDefinition = await getTriggerFunctionDefinition(
      triggerFunctionName,
    )

    const allTriggerColumns = extractTriggerColumns(triggerDefinition)
    const dataColumns = allTriggerColumns.filter(
      col => col !== 'operation',
    )

    const columnDifferences = findArrayDifferences(tableColumns, dataColumns)
    return columnDifferences.length === 0
  }
  catch (error: any) {
    console.error(`Failed to validate trigger columns: ${error.message}`)
    return false
  }
}

function generateTriggerSQL(
  tableName: string,
  historyTable: string,
  columns: string[],
) {
  const columnList = columns.join(',\n        ')
  const newValues = columns.map(col => `NEW.${col}`).join(',\n           ')
  const oldValues = columns.map(col => `OLD.${col}`).join(',\n           ')

  return `DROP TRIGGER IF EXISTS ${tableName}_history_trigger ON "${tableName}";

CREATE OR REPLACE FUNCTION ${tableName}_history_trigger_func() RETURNS trigger AS $body$
BEGIN
    if (TG_OP = 'INSERT' or TG_OP = 'UPDATE') then
        INSERT INTO ${historyTable} (
        ${columnList},
        operation
        )
        VALUES (
            ${newValues},
            TG_OP
        );

        RETURN NEW;
    elsif (TG_OP = 'DELETE') then
        INSERT INTO ${historyTable} (
        ${columnList},
        operation
        )
        VALUES (
            ${oldValues},
            'DELETE'
        );
        RETURN OLD;
    end if;

END;
$body$
LANGUAGE plpgsql;

CREATE TRIGGER ${tableName}_history_trigger
AFTER INSERT OR UPDATE OR DELETE ON "${tableName}"
FOR EACH ROW EXECUTE FUNCTION ${tableName}_history_trigger_func();`
}

async function verifyHistoryTable(tableName: string) {
  const historyTableName = `${tableName}_history`

  console.log('\n=== History Table Verification ===')
  console.log(`Analyzing: ${tableName} -> ${historyTableName}`)

  const tableSchema = await getTableSchema(tableName)
  const tableColumns = tableSchema.map(s => s.column_name)
  const historySchema = await getTableSchema(historyTableName)

  const schemaDifferences = findSchemaDifferences(tableSchema, historySchema, [
    'revision',
    'operation',
  ])

  if (!tableColumns.includes('created_at')) {
    schemaDifferences.push('Required column created_at is missing')
  }
  if (
    !tableColumns.includes('updated_at')
  ) {
    schemaDifferences.push('Required column (updated_at) is missing')
  }

  if (historySchema.length - tableSchema.length < 2) {
    schemaDifferences.push('History table is missing required tracking columns')
  }

  if (schemaDifferences.length === 0) {
    console.log('✅ Schema validation passed')

    const triggerExists = await checkTriggerExists(`${historyTableName}_trigger`)
    const triggerStatus = await getTriggerStatus(
      tableName,
      `${historyTableName}_trigger`,
    )

    if (!triggerExists || triggerStatus !== 'VALID') {
      console.log('❌ History trigger not found')
      return false
    }

    const columnsForTrigger = tableColumns.filter(
      column => !['modified_at', 'last_updated_at'].includes(column),
    )

    const triggerIsValid = await validateTriggerColumns(
      columnsForTrigger,
      `${historyTableName}_trigger_func`,
    )

    if (triggerStatus !== 'VALID' || !triggerIsValid) {
      const triggerSQL = await generateTriggerSQL(
        tableName,
        historyTableName,
        columnsForTrigger,
      )
      console.log('❌ History trigger needs update')
      console.log('\n--- Required Trigger SQL ---')
      console.log(triggerSQL)
      return false
    }
    else {
      console.log('✅ History trigger is up to date')
      return true
    }
  }
  else {
    console.log('❌ Schema validation failed:')
    schemaDifferences.forEach(diff => console.log(`  - ${diff}`))
    return false
  }
}

verifyHistoryTables()
  .catch((error) => {
    console.error('Verification failed:', error)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
