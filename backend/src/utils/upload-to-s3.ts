import { createHash } from 'node:crypto'
// s3UploadInvoice.ts
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'

const s3 = new S3Client({ region: process.env.AWS_REGION })

interface ArchiveOpts {
  bucket: string
  key: string // e.g. tenant/123/invoices/INV-2025-0001.pdf
  pdfBuffer: Uint8Array // your generated PDF bytes
  metadata?: Record<string, string> // { tenantId, invoiceNumber, issuedAt, sha256? }
  retentionUntil?: Date // if using Object Lock (governance)
}

export async function uploadPdfToS3({
  bucket,
  key,
  pdfBuffer,
  metadata,
  retentionUntil,
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
    // Either/both checksums are okay. MD5 is widely supported.
    ContentMD5: md5b64,
    ChecksumSHA256: sha256b64,
    // Server-side encryption (simple & cheap). Or use "aws:kms" + SSEKMSKeyId.
    ServerSideEncryption: 'AES256',
    Metadata: metadata,
    // If the bucket has Object Lock enabled and you want retention:
    ...(retentionUntil && {
      ObjectLockMode: 'GOVERNANCE',
      ObjectLockRetainUntilDate: retentionUntil,
    }),
  })

  await s3.send(cmd)

  // Give back a short-lived presigned URL (download/view)
  const url = await getSignedUrl(
    s3,
    new PutObjectCommand({ Bucket: bucket, Key: key }) as any, // we’ll actually want a GET URL:
    // Tip: for GET use GetObjectCommand – shown below
    {
      expiresIn: 60,
    },
  )
  return { key, md5b64, sha256b64, url } // (see GET example below)
}
