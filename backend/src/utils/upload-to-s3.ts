import { createHash } from 'node:crypto'
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'

const s3 = new S3Client({ region: process.env.AWS_REGION })

interface ArchiveOpts {
  bucket: string
  key: string // e.g. tenant/123/invoices/INV-2025-0001.pdf
  pdfBuffer: Uint8Array // your generated PDF bytes
  metadata?: Record<string, string> // { tenantId, invoiceNumber, issuedAt, sha256? }
}

export async function uploadPdfToS3({
  bucket,
  key,
  pdfBuffer,
  metadata,
}: ArchiveOpts) {
  // Optional but recommended: checksums for integrity
  const md5b64 = createHash('md5').update(pdfBuffer).digest('base64')
  const sha256b64 = createHash('sha256').update(pdfBuffer).digest('base64')

  const cmd = new PutObjectCommand({
    Bucket: bucket,
    Key: key,
    Body: pdfBuffer, // Uint8Array is fine
    ContentType: 'application/pdf',
    ContentLength: pdfBuffer.byteLength,
    ContentDisposition: `inline; filename="${key.split('/').pop()}"`,
    ContentMD5: md5b64,
    ChecksumSHA256: sha256b64,
    ServerSideEncryption: 'AES256',
    Metadata: metadata,
  })

  await s3.send(cmd)

  const url = await getSignedUrl(
    s3,
    new PutObjectCommand({ Bucket: bucket, Key: key }) as any,
    {
      expiresIn: 60,
    },
  )
  return { key, md5b64, sha256b64, url }
}
